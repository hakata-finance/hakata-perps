'use client';

import React from "react";
import ConnectionWalletProvider from "@/context/ConnectionWalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";

export type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <ConnectionWalletProvider>
      <TooltipProvider>
        <Navbar />
        {children}
      </TooltipProvider>
    </ConnectionWalletProvider>
  );
};

export default ClientLayout; 