
import { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import AppSidebar from '../organisms/AppSidebar/AppSidebar';
import TopBar from '../organisms/TopBar/TopBar';
import '@mantine/core/styles.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
          <AppSidebar />
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <TopBar />
            <div style={{ flex: 1 ,display: 'flex' }}>
              {children}
            </div>
          </div>
        </div>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default MainLayout;
