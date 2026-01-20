import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { SidebarContextValue } from "../../types/sidebarContext.types";

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const value: SidebarContextValue = {
    isOpen,
    setIsOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};
