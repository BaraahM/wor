import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { DateTime } from 'luxon';
import { PrismaService } from 'nestjs-prisma';
import { SecurityConfig } from '../config/config.interface';
import { InvalidCredentialsError } from '../errors/InvalidCredentialsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { RoleNotFoundError } from '../errors/RoleNotFoundError';
import { PasswordService } from './password.service';
import { MailService } from '../mail/mail.service';
import { Role } from './enums/role';
import { AccountService } from '../account/account.service';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';
import { SignUpDto } from '../account/graphql/inputs/create-account.input';

interface SupabaseUserPayload {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly mailService: MailService,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  validateUserByEmail(email: string): Promise<User> {
    return this.prismaService.user.findFirst({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        account: {
          include: {
            subscriptions: true,
          },
        },
      },
    });
  }

  async createUserFromGoogle(googleUser: any): Promise<User> {
    const { email, firstName, lastName, picture } = googleUser;

    const account = await this.accountService.createAccount({
      organization: {
        name: `${firstName} ${lastName}'s Account`,
      },
      owner: {
        email,
        password: '',
        role: Role.Admin,
      },
    });

    return account.owner;
  }

  async signInWithMagicLink(token: string) {
    // check if token is valid
    const verifyOptions = {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    };

    const tokenData = await this.jwtService.verify(token, verifyOptions);

    const { email } = tokenData;

    // check if user exists
    const user = await this.validateUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      tokens: this.generateTokens({
        userId: user.id,
      }),
      user,
    };
  }

  async generateMagicLinkToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      },
    );
  }

  async sendMagicLink(email: string) {
    const magicLinkToken = await this.generateMagicLinkToken(email);

    const magicLink = `${this.configService.get(
      'MAGIC_LINK_CALLBACK_URL',
    )}?token=${magicLinkToken}`;

    await this.mailService.sendMagicLink(email, magicLink);
  }

  setRefreshTokenCookie(response, refreshToken: any): void {
    response.cookie('refresh_token', refreshToken.token, {
      path: '/graphql',
      httpOnly: true,
      secure: true,
      maxAge: DateTime.fromJSDate(refreshToken.expiresAt).diff(DateTime.now())
        .milliseconds,
      sameSite: 'None',
    });
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      // Use Supabase for authentication
      const { supabaseSession, user } = await this.supabaseAuthService.signIn(
        email,
        password,
      );

      if (!user) {
        throw new InvalidCredentialsError();
      }

      return {
        tokens: this.generateTokens({
          userId: user.id,
        }),
        user,
      };
    } catch (error) {
      // Fall back to local auth if Supabase auth fails
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new InvalidCredentialsError();
      }

      const passwordValid = await this.passwordService.validatePassword(
        password,
        user.password,
      );

      if (!passwordValid) {
        throw new InvalidCredentialsError();
      }

      return {
        tokens: this.generateTokens({
          userId: user.id,
        }),
        user,
      };
    }
  }

  validateUser(userId: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        account: {
          include: {
            subscriptions: true,
          },
        },
      },
    });
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prismaService.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string }): any {
    const token = {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };

    return token;
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): {
    token: string;
    expiresAt: DateTime;
  } {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });

    const expiresAt = DateTime.now()
      .plus({ seconds: securityConfig.refreshIn })
      .toJSDate();

    return {
      token,
      // @ts-ignore
      expiresAt,
    };
  }

  async refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async handleSupabaseUserSignup(payload: SupabaseUserPayload): Promise<User> {
    const { id: supabaseId, email, firstname, lastname } = payload;

    // First check if user already exists by supabaseId
    let existingUser = await this.prismaService.user.findUnique({
      where: { supabaseId },
      include: {
        role: { include: { permissions: true } },
        account: true,
        ownerOf: true,
      },
    });

    if (existingUser) {
      console.log(`User with supabaseId ${supabaseId} already exists.`);
      return existingUser;
    }

    // Check if user exists by email (for migration scenarios)
    existingUser = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: true } },
        account: true,
        ownerOf: true,
      },
    });

    if (existingUser) {
      // Update existing user with supabaseId and return
      console.log(`User with email ${email} exists, updating with supabaseId.`);
      const updatedUser = await this.prismaService.user.update({
        where: { id: existingUser.id },
        data: { supabaseId },
        include: {
          role: { include: { permissions: true } },
          account: true,
          ownerOf: true,
        },
      });
      return updatedUser;
    }

    // Create new user with account - wrap in transaction to handle race conditions
    try {
      const accountCreationInput: SignUpDto = {
        owner: {
          email,
          password: '',
          role: Role.Admin,
          supabaseId: supabaseId,
          firstname: firstname || '',
          lastname: lastname || '',
        },
        organization: {
          name: `${email.split('@')[0]}\'s Organization`,
        },
      };

      const newAccount =
        await this.accountService.createAccount(accountCreationInput);

      const createdUser = await this.prismaService.user.findUnique({
        where: { supabaseId: supabaseId },
        include: {
          role: { include: { permissions: true } },
          account: true,
          ownerOf: true,
        },
      });

      if (!createdUser) {
        throw new Error('User creation failed after account setup.');
      }

      console.log(
        `Successfully created new user ${email} with supabaseId ${supabaseId}`,
      );
      return createdUser;
    } catch (error) {
      console.error('Error in handleSupabaseUserSignup:', error.message);

      // Handle race condition - another request might have created the user
      if (error.message && error.message.includes('email_already_used')) {
        console.log(
          `Race condition detected for ${email}, fetching existing user`,
        );
        const existingUserAfterRace = await this.prismaService.user.findUnique({
          where: { email },
          include: {
            role: { include: { permissions: true } },
            account: true,
            ownerOf: true,
          },
        });

        if (existingUserAfterRace) {
          // Update with supabaseId if missing
          if (!existingUserAfterRace.supabaseId) {
            return await this.prismaService.user.update({
              where: { id: existingUserAfterRace.id },
              data: { supabaseId },
              include: {
                role: { include: { permissions: true } },
                account: true,
                ownerOf: true,
              },
            });
          }
          return existingUserAfterRace;
        }
      }

      // Re-throw the error to be handled by the JWT strategy
      throw error;
    }
  }
}
