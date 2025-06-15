# Zauberstack - Full-Stack Application with Supabase Integration

A comprehensive full-stack application built with NestJS, React, and Supabase, featuring authentication, database management, file storage, and a modern UI.

## 🏗️ Architecture Overview

This is a monorepo containing:

- **API** (`packages/api/`): NestJS backend with GraphQL API, Prisma ORM, and Supabase integration
- **Client** (`packages/client/`): React frontend with Mantine UI, Apollo Client, and authentication
- **Website** (`packages/website/`): Marketing/landing pages

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** (LTS version, v18+ recommended)
- **Yarn** (v3.x)
- **Docker & Docker Compose** (for local development)
- **Git**

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd zauberstack
yarn install
```

### 2. Environment Setup

Copy and configure environment files for each package:

```bash
# API environment
cp packages/api/env-example-improved.txt packages/api/.env

# Client environment  
cp packages/client/env.example.txt packages/client/.env

# Website environment (if applicable)
cp packages/website/.env.example packages/website/.env
```

### 3. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and API keys

2. **Configure Environment Variables**:
   Update `packages/api/.env` with your Supabase credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_KEY="your-service-role-key"
   SUPABASE_JWT_SECRET="your-jwt-secret"
   
   # Database Connection
   DATABASE_URL="postgresql://postgres:your-db-password@your-project-ref.supabase.co:5432/postgres"
   ```

3. **Set up Storage Buckets** (in Supabase Dashboard):
   - Go to Storage → Create bucket named `media`
   - Configure appropriate permissions

For detailed Supabase setup instructions, see [packages/api/SUPABASE_SETUP.md](packages/api/SUPABASE_SETUP.md).

### 4. Database Initialization

Initialize and seed the database:

```bash
yarn init-db
```

This command will:
- Run database migrations
- Seed the database with initial roles, permissions, and demo data
- Create admin and author user accounts

### 5. Start Development Servers

Start all services simultaneously:

```bash
yarn start
```

This will start:
- **API Server**: http://localhost:4000 (GraphQL Playground available)
- **Client App**: http://localhost:3000
- **Website**: http://localhost:3000

Or start individual services:
```bash
yarn api      # API only
yarn client   # Client only  
yarn website  # Website only
```

## 🔧 Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start all services |
| `yarn api` | Start API server |
| `yarn client` | Start React client |
| `yarn website` | Start website |
| `yarn init-db` | Initialize and seed database |
| `yarn lint-api` | Lint API code |
| `yarn lint-client` | Lint client code |
| `yarn prettier-api` | Format API code |
| `yarn prettier-client` | Format client code |
| `yarn e2e-test-api` | Run API E2E tests |
| `yarn clean` | Clean all node_modules |
| `yarn reinstall` | Clean and reinstall dependencies |

### Package Management

Always use yarn workspaces for dependency management:

```bash
# Add dependencies to specific packages
yarn workspace api add package-name
yarn workspace client add package-name

# Add dev dependencies
yarn workspace api add -D package-name

# Don't navigate to package directories for installation
```

## 🗄️ Database & Prisma

### Schema Management

The database schema is defined in `packages/api/prisma/schema.prisma` and managed with Prisma:

```bash
# Generate Prisma client
yarn workspace api prisma generate

# Create and apply migrations
yarn workspace api migrate:dev

# Reset database (useful for development)
yarn workspace api migrate:reset

# Seed database
yarn workspace api seed
```

### Database Seeding

The database comes pre-seeded with:

- **Roles**: `admin`, `author`
- **Permissions**: Various permissions for different features
- **Demo Users**: Admin and author accounts
- **Sample Data**: Tasks, tags, and organizations

**Default Accounts**:
- Admin: `admin@admin.com` / `secret42`
- Author: `author@author.com` / `secret42`

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Supabase Auth**: Primary authentication handled by Supabase
2. **JWT Validation**: API validates Supabase JWT tokens
3. **User Creation**: New users are automatically created in the database
4. **Role Assignment**: Users are assigned roles with specific permissions

### Permission System

The application uses a role-based permission system:

- **Roles**: Defined in `packages/api/src/auth/enums/role.ts`
- **Permissions**: Defined in `packages/api/src/auth/enums/permission.ts`
- **Guards**: Protect routes with `@RequiredPermissions()` decorator

Example usage:
```typescript
@Mutation(() => Task)
@RequiredPermissions(Permission.Create_Tasks)
async createTask(@Args('data') data: CreateTaskInput) {
  // Only users with Create_Tasks permission can access this
}
```

## 🎨 Frontend Development

### Technology Stack

- **React**: Frontend framework
- **TypeScript**: Type safety
- **Mantine UI**: Component library
- **Apollo Client**: GraphQL client
- **React Router**: Routing

### Component Patterns

Components follow atomic design principles:

```typescript
// Component structure
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction: (value: string) => void;
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 = 0, onAction }) => {
  const [state, setState] = useState(initialState);
  
  return <div>{/* Component markup */}</div>;
};
```

### Form Handling

Forms use the `FormBase` component with Mantine Form:

```typescript
<FormBase
  initialValues={{ name: '', email: '' }}
  validationSchema={validationSchema}
  submitAction={useCreateUserMutation}
  mode={FORM_MODE.CREATE}
>
  {(form) => (
    <Stack>
      <TextInput {...form.getInputProps('name')} />
      <TextInput {...form.getInputProps('email')} />
    </Stack>
  )}
</FormBase>
```

## 🔍 API Development

### GraphQL Schema

The API uses a code-first approach with NestJS GraphQL:

- **Resolvers**: Define GraphQL endpoints
- **Models**: Define GraphQL object types  
- **Inputs**: Define GraphQL input types
- **Schema**: Generated automatically

### Error Handling

Comprehensive error handling system:

1. **Domain Errors**: Business logic errors (`src/errors/`)
2. **GraphQL API Errors**: GraphQL-specific wrappers (`src/errors/graphql/`)

Example:
```typescript
// Domain error
export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
  }
}

// GraphQL API error
export class GraphQLApiErrorUserNotFound extends GraphQLApiError {
  constructor() {
    super('user_not_found', 'User not found');
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# API unit tests
yarn workspace api test

# API E2E tests  
yarn e2e-test-api

# Client tests
yarn workspace client test
```

### Test Structure

- **Unit Tests**: Individual component/service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing

## 🐳 Docker & Deployment

### Local Development with Docker

```bash
# Build API container
docker build -f packages/api/Dockerfile.api -t zauberstack-api .

# Build client container
docker build -f packages/client/Dockerfile.client -t zauberstack-client .

# Use docker-compose for full stack
docker-compose up
```

### Environment Configuration

Ensure all environment variables are properly set for production:

- Database connections
- Supabase credentials  
- JWT secrets
- CORS settings
- Storage configurations

## 🐛 Troubleshooting

### Common Issues

#### "Role not found" Error

**Problem**: Users can't be created due to missing roles.

**Solution**: 
```bash
# Reset and reseed database
yarn workspace api migrate:reset
yarn workspace api seed
```

#### Supabase Connection Issues

**Problem**: Authentication fails or users can't be created.

**Solutions**:
1. Verify Supabase environment variables in `.env`
2. Check Supabase project is active
3. Verify JWT secret matches Supabase dashboard
4. Ensure database URL is correct

#### Database Connection Failed

**Problem**: Can't connect to database.

**Solutions**:
1. Check DATABASE_URL format
2. Verify database is running
3. Check network connectivity
4. Verify credentials

#### Module Resolution Errors

**Problem**: Import errors or missing modules.

**Solutions**:
```bash
# Clean and reinstall
yarn reinstall

# Regenerate Prisma client
yarn workspace api prisma generate
```

### Debug Mode

Enable debug logging:

```bash
# API debug mode
DEBUG=* yarn api

# Verbose Prisma logging
yarn workspace api prisma studio
```

### Getting Help

1. Check existing documentation in `/docs` or package-specific README files
2. Review error logs carefully
3. Verify environment configuration
4. Check database state with Prisma Studio

## 📚 Additional Documentation

- [API Package Details](packages/api/README.md)
- [Client Package Details](packages/client/README.md)  
- [Supabase Setup Guide](packages/api/SUPABASE_SETUP.md)
- [Authentication Guide](packages/client/SUPABASE_AUTH.md)
- [Environment Variables](packages/api/ENV_DOCUMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Make your changes
4. Run tests: `yarn test`
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔗 Quick Links

- **API GraphQL Playground**: http://localhost:4000/graphql
- **Client Application**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Prisma Studio**: Run `yarn workspace api prisma studio`

For detailed setup instructions and advanced configuration, please refer to the package-specific documentation in each directory.
