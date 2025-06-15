'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ApolloProvider } from '@apollo/client';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme/theme';
import apolloClient from '../lib/apolloClient';
import { AuthContextProvider } from '../context/AuthContextProvider';
import MainLayout from '@/components/layout/MainLayout';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Mantine styles
import '@mantine/notifications/styles.layer.css';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={apolloClient}>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <ModalsProvider>
              <Notifications position="bottom-right" />
              <AuthContextProvider>
                <MainLayout>
                  {children}
                </MainLayout>
              </AuthContextProvider>
            </ModalsProvider>
          </MantineProvider>
        </ApolloProvider>
      </body>
    </html>
  );
} 