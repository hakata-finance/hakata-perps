import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Get admin public keys from environment variables
 * Falls back to hardcoded values if environment variable is not set
 * @returns Array of admin public key strings
 */
const getAdminPublicKeys = (): string[] => {
  // Try to get admin keys from environment variable first
  const envAdminKeys = process.env.NEXT_PUBLIC_ADMIN_PUBLIC_KEYS;
  
  if (envAdminKeys) {
    // Split comma-separated values and trim whitespace
    const keys = envAdminKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    if (keys.length > 0) {
      console.log('Using admin public keys from environment variables:', keys.length, 'keys found');
      return keys;
    }
  }
  
  // Fallback to hardcoded admin keys if env var is not set or empty
  console.log('Using fallback hardcoded admin public keys');
  return [
    // Using the mint authority public key as admin (derived from the mint authority keypair)
    '4amNLu1hA3WWyLDeZ1u7sUuaE5wKuycBshKCsgT8AKLU'
  ];
};

/**
 * Hook to check if the currently connected wallet is an admin
 * @returns boolean indicating if the current user is an admin
 */
export const useIsAdmin = (): boolean => {
  const { publicKey } = useWallet();

  // Memoize the admin check to avoid unnecessary recalculations
  const isAdmin = useMemo(() => {
    if (!publicKey) {
      return false;
    }

    // Get admin public keys (from env or fallback)
    const adminPublicKeys = getAdminPublicKeys();
    
    // Check if the current wallet's public key matches any admin public key
    const currentWalletAddress = publicKey.toBase58();
    
    return adminPublicKeys.includes(currentWalletAddress);
  }, [publicKey]);

  return isAdmin;
};
