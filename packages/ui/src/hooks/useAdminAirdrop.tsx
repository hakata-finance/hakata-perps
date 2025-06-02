import { useState } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { initializeMint, airdropCxp } from '@/lib/compressed-tokens';
import { getAdminKeypair } from '@/utils/mintAuthority';

/**
 * Hook for admin airdrop functionality
 * Provides methods to airdrop custom amounts of cXP to specific users
 */
export const useAdminAirdrop = () => {
  const [isAirdropping, setIsAirdropping] = useState(false);

  /**
   * Perform an airdrop of cXP tokens to a specific user
   * @param recipientPublicKey - The public key of the recipient
   * @param amount - The amount of cXP to airdrop (in whole tokens, not lamports)
   * @returns Transaction ID if successful, null if failed
   */
  const performAirdrop = async (
    recipientPublicKey: PublicKey,
    amount: number
  ): Promise<string | null> => {
    if (isAirdropping) {
      toast.error('Airdrop already in progress. Please wait.');
      return null;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return null;
    }

    setIsAirdropping(true);
    
    try {
      // Get the admin keypair with minting authority
      const adminKeypair = getAdminKeypair();
      if (!adminKeypair) {
        toast.error('Admin keypair not available. Cannot perform airdrop.');
        return null;
      }

      // Initialize mint (in case it's not already initialized)
      await initializeMint();
      
      // Convert amount to lamports (cXP has 9 decimals like SOL)
      const amountInLamports = amount * LAMPORTS_PER_SOL;
      
      // Perform the airdrop
      const txId = await airdropCxp(adminKeypair, recipientPublicKey, amountInLamports);
      
      toast.success(`Successfully airdropped ${amount} cXP to ${recipientPublicKey.toBase58()}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      return txId;
    } catch (error) {
      console.error('Error performing admin airdrop:', error);
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          toast.error('Insufficient funds in admin account to perform airdrop');
        } else if (error.message.includes('invalid')) {
          toast.error('Invalid recipient address provided');
        } else {
          toast.error(`Airdrop failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to perform airdrop. Please try again later.');
      }
      
      return null;
    } finally {
      setIsAirdropping(false);
    }
  };

  return {
    isAirdropping,
    performAirdrop
  };
};
