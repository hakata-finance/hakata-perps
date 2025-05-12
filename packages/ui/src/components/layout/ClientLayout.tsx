'use client';

import React from "react";
import ConnectionWalletProvider from "@/context/ConnectionWalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import { useHydrateStore } from "@/hooks/useHydrateStore";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Navbar />
        <StoreUpdater />
        {children}
      </TooltipProvider>
    </ConnectionWalletProvider>
  );
};

export default ClientLayout; 