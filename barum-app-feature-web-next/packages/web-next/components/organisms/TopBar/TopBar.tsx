"use client"

import { useState } from 'react';
import { Group, Paper } from '@mantine/core';
import Button from '@/components/atoms/Button/Button';

const TopBar = () => {
  const [user, setUser] = useState<string | null>(null);

  const handleSignUpClick = () => {
    //TODO: sign up modal pop out
  };

  const handleLoginClick = () => {
    //TODO: login modal pop out
  };

  const handleSignOut = () => {
    setUser(null);
    //TODO: sign out logic
  };

  return (
    <>
      <Paper
        style={{
          width: '100%',
          borderBottom: 'solid var(--mantine-color-gray-3)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderRadius: 0,
        }}
      >
        <Group gap="sm">
          {user ? (
            <Button
              avatarLabel={user}
              backgroundColor="var(--mantine-color-dark-9)"
              color="var(--mantine-color-white)"
              onClick={handleSignOut}
            />
          ) : (
            <>
              <div onClick={handleLoginClick}>
                <Button
                  radius={50}
                  customStyles={{
                    backgroundColor: 'var(--mantine-color-dark-9)',
                    color: 'var(--mantine-color-white)',
                    transition: 'all 0.2s ease',
                  }}
                  customHoverStyles={{
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    transform: 'scale(1.03)',
                  }}
                >
                  Login
                </Button>
              </div>
              <div onClick={handleSignUpClick}>
                <Button
                  radius={50}
                  customStyles={{
                    backgroundColor: 'var(--mantine-color-white)',
                    color: 'var(--mantine-color-dark-9)',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--mantine-color-dark-9)',
                  }}
                  customHoverStyles={{
                    backgroundColor: 'var(--mantine-color-gray-1)',
                    transform: 'scale(1.03)',
                  }}
                >
                  Sign Up
                </Button>
              </div>
            </>
          )}
        </Group>
      </Paper>
    </>
  );
};

export default TopBar;