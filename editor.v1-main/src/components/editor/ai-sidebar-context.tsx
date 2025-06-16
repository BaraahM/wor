
'use client';

import React, { createContext, useContext, useState } from 'react';

interface AISidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const AISidebarContext = createContext<AISidebarContextType | undefined>(undefined);

export function AISidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <AISidebarContext.Provider
      value={{
        isOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </AISidebarContext.Provider>
  );
}

export function useAISidebar() {
  const context = useContext(AISidebarContext);
  if (context === undefined) {
    throw new Error('useAISidebar must be used within an AISidebarProvider');
  }
  return context;
}
