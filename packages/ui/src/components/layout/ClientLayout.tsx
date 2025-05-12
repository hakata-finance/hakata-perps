'use client';

import React from "react";
import ConnectionWalletProvider from "@/context/ConnectionWalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import { useHydrateStore } from "@/hooks/useHydrateStore";

export type ClientLayoutProps = {
  children: React.ReactNode;
};

const StoreUpdater = () => {
  useHydrateStore()
  return null
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <ConnectionWalletProvider>
      <TooltipProvider>
        <Navbar />
        <StoreUpdater />
        {children}
      </TooltipProvider>
    </ConnectionWalletProvider>
  );
};

export default ClientLayout; 