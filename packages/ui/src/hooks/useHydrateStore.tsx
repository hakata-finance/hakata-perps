import { useEffect } from 'react'
import { BN } from '@coral-xyz/anchor'
import { AccountLayout, getAssociatedTokenAddress, getMint, MintLayout } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useGlobalStore } from '@/stores/store';
import { Custody, Pool } from '@/lib/types';
import { CLUSTER, DEFAULT_POOL, POOL_CONFIG } from '@/lib/constants';
import { PoolConfig } from '@/lib/PoolConfig';
import { checkIfAccountExists } from '@/lib/retrieveData';
import { useProgram } from './useProgram';

/**
 * Hook to hydrate the global store with data from the blockchain
 * Sets up listeners for account changes and updates store state accordingly
 * Manages pool data, LP token data, custody accounts, and user LP token balances
 */
export const useHydrateStore = () => {
  const { connection } = useConnection();
  const program = useProgram();
  const wallet = useAnchorWallet();

  // const addPosition = useGlobalStore(state => state.addPosition);

  const addCustody = useGlobalStore(state => state.addCustody);
  const setPoolData = useGlobalStore(state => state.setPool);
  const setLpMintData = useGlobalStore(state => state.setLpMintData);

  const setUserLpTokensBalance = useGlobalStore(state => state.setUserLpTokensBalance);

  // Set up pool data and subscription
  useEffect(() => {
    const pool = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
    const subIds: number[] = [];

    // Fetch initial pool data and set up subscription
    (async () => {
      try {
        console.log('Fetching pool data for address:', pool.poolAddress.toString());
        const accountInfo = await connection.getAccountInfo(pool.poolAddress);
        
        if (accountInfo) {
          const poolData = program.coder.accounts.decode<Pool>('pool', accountInfo.data);
          console.log('Pool data fetched successfully');
          setPoolData(poolData);
        } else {
          console.warn('No pool account found at address:', pool.poolAddress.toString());
        }
        
        // Subscribe to account changes
        const subId = connection.onAccountChange(new PublicKey(pool.poolAddress), (accountInfo) => {
          console.log('Pool data updated');
          const poolData = program.coder.accounts.decode<Pool>('pool', accountInfo.data);
          setPoolData(poolData);
        });

        subIds.push(subId);
      } catch (error) {
        console.error('Error fetching pool data:', error);
      }
    })();
  
    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up pool data subscriptions');
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [connection, program, setPoolData]);

  // Set up LP token mint data and subscription
  useEffect(() => {
    const pool = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
    const subIds: number[] = [];
    
    (async () => {
      try {
        console.log('Fetching LP token mint data for address:', pool.lpTokenMint.toString());
        const accountInfo = await connection.getAccountInfo(pool.lpTokenMint);
        
        if (accountInfo) {
          const lpMintData = await getMint(connection, pool.lpTokenMint);
          console.log('LP token mint data fetched successfully');
          setLpMintData(lpMintData);
        } else {
          console.warn('No LP token mint account found at address:', pool.lpTokenMint.toString());
        }
        
        // Subscribe to account changes
        const subId = connection.onAccountChange(new PublicKey(pool.lpTokenMint), (accountInfo) => {
          console.log('LP token mint data updated');
          const rawMint = MintLayout.decode(accountInfo.data);
          
          setLpMintData({
            address: pool.lpTokenMint,
            mintAuthority: rawMint.mintAuthorityOption ? rawMint.mintAuthority : null,
            supply: rawMint.supply,
            decimals: rawMint.decimals,
            isInitialized: rawMint.isInitialized,
            freezeAuthority: rawMint.freezeAuthorityOption ? rawMint.freezeAuthority : null,
          });
        });

        subIds.push(subId);
      } catch (error) {
        console.error('Error fetching LP token mint data:', error);
      }
    })();
  
    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up LP token mint data subscriptions');
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [connection, setLpMintData]);

  // Set up custody accounts and subscriptions
  useEffect(() => {
    const custodies = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER).custodies;
    const subIds: number[] = [];

    (async () => {
      try {
        for (const custody of custodies) {
          console.log('Fetching custody data for address:', custody.custodyAccount.toString());
          const accountInfo = await connection.getAccountInfo(custody.custodyAccount);
          
          if (accountInfo) {
            const custodyData = program.coder.accounts.decode<Custody>('custody', accountInfo.data);
            console.log('Custody data fetched successfully for:', custody.custodyAccount.toString());
            addCustody(custody.custodyAccount.toBase58(), custodyData);
          } else {
            console.warn('No custody account found at address:', custody.custodyAccount.toString());
          }
          
          // Subscribe to account changes
          const subId = connection.onAccountChange(custody.custodyAccount, (accountInfo) => {
            console.log('Custody data updated for:', custody.custodyAccount.toString());
            const custodyData = program.coder.accounts.decode<Custody>('custody', accountInfo.data);
            addCustody(custody.custodyAccount.toBase58(), custodyData);
          });
          
          subIds.push(subId);
        }
      } catch (error) {
        console.error('Error fetching custody data:', error);
      }
    })();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up custody data subscriptions');
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [connection, program, addCustody]);

  // Set up user's LP token balance and subscription
  useEffect(() => {
    const subIds: number[] = [];
    
    (async () => {
      // Only proceed if wallet is connected
      if (!wallet || !wallet.publicKey) {
        console.log('Wallet not connected, skipping LP token balance fetch');
        return;
      }

      try {
        console.log('Fetching user LP token balance');
        
        // Get the user's associated token account for LP tokens
        const lpTokenAccount = await getAssociatedTokenAddress(POOL_CONFIG.lpTokenMint, wallet.publicKey);
        
        // Check if the account exists
        if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
          console.log('User LP token account does not exist yet');
          setUserLpTokensBalance(new BN(0));
        } else {
          // Fetch account info and decode token balance
          const accountInfo = await connection.getAccountInfo(lpTokenAccount);
          const decodedTokenAccountInfo = AccountLayout.decode(accountInfo!.data);
          const balance = new BN(decodedTokenAccountInfo.amount.toString());
          
          console.log('User LP token balance fetched:', balance.toString());
          setUserLpTokensBalance(balance);

          // Subscribe to account changes
          const subId = connection.onAccountChange(lpTokenAccount, (accountInfo) => {
            console.log('User LP token balance updated');
            const decodedTokenAccountInfo = AccountLayout.decode(accountInfo!.data);
            const newBalance = new BN(decodedTokenAccountInfo.amount.toString());
            setUserLpTokensBalance(newBalance);
          });
          
          subIds.push(subId);
        }
      } catch (error) {
        console.error('Error fetching user LP token balance:', error);
      }
    })();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up LP token balance subscriptions');
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet, connection, setUserLpTokensBalance]);

  // This component doesn't render anything visible
  return null;
}
