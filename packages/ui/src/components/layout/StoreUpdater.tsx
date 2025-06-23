'use client';

import { useHydrateStore } from "@/hooks/useHydrateStore";

/**
 * StoreUpdater component
 * 
 * Responsible for initializing and keeping the global store synchronized with blockchain data.
 * Uses the useHydrateStore hook to set up subscriptions for real-time updates.
 * 
 * This component is designed to be mounted once in the app layout and doesn't render
 * any visible UI elements - it only handles store synchronization side effects.
 * 
 * @returns {null} This component doesn't render anything visible
 * 
 * @example
 * ```tsx
 * <StoreUpdater />
 * ```
 */
export const StoreUpdater = (): null => {
  useHydrateStore();
  
  return null; // This component doesn't render anything visible
};

export default StoreUpdater; 