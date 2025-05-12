'use client';

import { ToastContainer } from "react-toastify";
import ConnectionWalletProvider from "@/context/ConnectionWalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import { useHydrateStore } from "@/hooks/useHydrateStore";
import 'react-toastify/dist/ReactToastify.css';
import '@/app/toastify-custom.css';

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
          theme="dark"
          toastClassName="bg-[#121212] text-white"
          style={{
            '--toastify-color-dark': '#121212',
            '--toastify-text-color-dark': 'var(--color-gray-400)',
          } as React.CSSProperties}
        />
        <Navbar />
        <StoreUpdater />
        {children}
      </TooltipProvider>
    </ConnectionWalletProvider>
  );
};

export default ClientLayout; 