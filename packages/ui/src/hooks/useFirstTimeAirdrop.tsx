import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { getCxpBalance, initializeMint, airdropCxp } from '@/lib/compressed-tokens';
import { toast } from 'react-toastify';

// Get mint authority key from environment variable
const getMintAuthorityKey = () => {
  return new Uint8Array(
    process.env.NEXT_PUBLIC_MINT_AUTHORITY_KEY!.split(',').map(num => parseInt(num.trim(), 10))
  );
};

// We're declaring this but it's potentially unused - that's OK as we know we need it for the airdrop function
const getAdminKeypair = (): Keypair => {
  return Keypair.fromSecretKey(getMintAuthorityKey());
};

export const useFirstTimeAirdrop = () => {
  const { publicKey } = useWallet();
  const [hasReceivedAirdrop, setHasReceivedAirdrop] = useState<boolean | null>(null);
  const [hasAddedLiquidity, setHasAddedLiquidity] = useState<boolean | null>(null);
  const [hasRemovedLiquidity, setHasRemovedLiquidity] = useState<boolean | null>(null);
  const [isAirdropping, setIsAirdropping] = useState(false);
  
  // Load from local storage and/or check blockchain for all activities
  useEffect(() => {
    const checkStatus = async () => {
      if (!publicKey) return;
      
      // Check faucet airdrop status
      const faucetStatus = localStorage.getItem(`cxp-airdrop-${publicKey.toBase58()}`);
      if (faucetStatus === 'true') {
        setHasReceivedAirdrop(true);
      } else {
        // Check blockchain for cXP tokens - if exists, mark as received
        try {
          const balance = await getCxpBalance(publicKey);
          if (balance > 0) {
            setHasReceivedAirdrop(true);
            localStorage.setItem(`cxp-airdrop-${publicKey.toBase58()}`, 'true');
          } else {
            setHasReceivedAirdrop(false);
          }
        } catch (error) {
          console.error("Error checking cXP balance:", error);
          setHasReceivedAirdrop(false);
        }
      }
      
      // Check add liquidity status
      const addLiquidityStatus = localStorage.getItem(`cxp-add-liquidity-${publicKey.toBase58()}`);
      setHasAddedLiquidity(addLiquidityStatus === 'true');
      
      // Check remove liquidity status
      const removeLiquidityStatus = localStorage.getItem(`cxp-remove-liquidity-${publicKey.toBase58()}`);
      setHasRemovedLiquidity(removeLiquidityStatus === 'true');
    };
    
    checkStatus();
  }, [publicKey]);
  
  // Function to perform the airdrop
  const performFirstTimeAirdrop = async () => {
    if (!publicKey || hasReceivedAirdrop || isAirdropping) return null;
    
    setIsAirdropping(true);
    try {
      const adminKeypair = getAdminKeypair();
      if (!adminKeypair) {
        toast.error("Admin keypair not available. Cannot perform airdrop.");
        return null;
      }
      
      await initializeMint();
      const txId = await airdropCxp(adminKeypair, publicKey);
      
      // Mark as received in local storage
      localStorage.setItem(`cxp-airdrop-${publicKey.toBase58()}`, 'true');
      setHasReceivedAirdrop(true);
      
      return txId;
    } catch (error) {
      console.error("Error performing first-time airdrop:", error);
      toast.error("Failed to airdrop cXP. Please try again later.");
      return null;
    } finally {
      setIsAirdropping(false);
    }
  };

  // Track and reward first-time add liquidity
  const trackAddLiquidity = async (): Promise<string | null> => {
    if (!publicKey || hasAddedLiquidity || isAirdropping) return null;
    
    setIsAirdropping(true);
    try {
      const adminKeypair = getAdminKeypair();
      if (!adminKeypair) {
        toast.error("Admin keypair not available. Cannot perform airdrop.");
        return null;
      }
      
      await initializeMint();
      const txId = await airdropCxp(adminKeypair, publicKey);
      
      // Mark as completed in local storage
      localStorage.setItem(`cxp-add-liquidity-${publicKey.toBase58()}`, 'true');
      setHasAddedLiquidity(true);
      
      toast.success('Received 1 cXP for your first liquidity addition!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      return txId;
    } catch (error) {
      console.error("Error performing add liquidity airdrop:", error);
      toast.error("Failed to airdrop cXP. Please try again later.");
      return null;
    } finally {
      setIsAirdropping(false);
    }
  };
  
  // Track and reward first-time remove liquidity
  const trackRemoveLiquidity = async (): Promise<string | null> => {
    if (!publicKey || hasRemovedLiquidity || isAirdropping) return null;
    
    setIsAirdropping(true);
    try {
      const adminKeypair = getAdminKeypair();
      if (!adminKeypair) {
        toast.error("Admin keypair not available. Cannot perform airdrop.");
        return null;
      }
      
      await initializeMint();
      const txId = await airdropCxp(adminKeypair, publicKey);
      
      // Mark as completed in local storage
      localStorage.setItem(`cxp-remove-liquidity-${publicKey.toBase58()}`, 'true');
      setHasRemovedLiquidity(true);
      
      toast.success('Received 1 cXP for your first liquidity removal!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      return txId;
    } catch (error) {
      console.error("Error performing remove liquidity airdrop:", error);
      toast.error("Failed to airdrop cXP. Please try again later.");
      return null;
    } finally {
      setIsAirdropping(false);
    }
  };
  
  return {
    hasReceivedAirdrop,
    hasAddedLiquidity,
    hasRemovedLiquidity,
    isAirdropping,
    performFirstTimeAirdrop,
    trackAddLiquidity,
    trackRemoveLiquidity
  };
};