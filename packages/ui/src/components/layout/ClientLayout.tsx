'use client';

import { ToastContainer } from "react-toastify";
import ConnectionWalletProvider from "@/context/ConnectionWalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useHydrateStore } from "@/hooks/useHydrateStore";
import 'react-toastify/dist/ReactToastify.css';
import '@/app/toastify-custom.css';

/**
 * Props interface for the ClientLayout component
 */
export type ClientLayoutProps = {
  /** Child components to be rendered within the layout */
  children: React.ReactNode;
};

/**
 * StoreUpdater component
 * Responsible for initializing and keeping the global store synchronized with blockchain data
 * Uses the useHydrateStore hook to set up subscriptions for real-time updates
 */
const StoreUpdater = () => {
  useHydrateStore();
  return null; // This component doesn't render anything visible
}

/**
 * ClientLayout component
 * Main layout wrapper that provides context providers and consistent UI elements
 * Provides wallet connectivity, tooltips, notifications, and navigation
 * 
 * @param {ClientLayoutProps} props - Component props
 * @returns {JSX.Element} The rendered layout with all providers and UI elements
 */
const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <ConnectionWalletProvider>
      <TooltipProvider>
        {/* Toast notifications configuration */}
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
        
        {/* Main navigation */}
        <Navbar />
        
        {/* Initialize and sync global store data */}
        <StoreUpdater />
        
        {/* Main content */}
        {children}
        
        {/* Footer */}
        <Footer />
      </TooltipProvider>
    </ConnectionWalletProvider>
  );
};

export default ClientLayout; 