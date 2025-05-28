import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';

export interface LeaderboardData {
  owner: string;
  balance: number;
  rank: number;
}

interface SplTokenAccount {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLeaderboard = (
  tokenMint: string = 'FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP',
  limit: number = 10
): UseLeaderboardReturn => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the same RPC endpoint as the compressed tokens
  const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "https://devnet.helius-rpc.com?api-key=dcefb6d9-a6e8-4679-8b60-b9555a56b3cf";

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching token holders for mint:', tokenMint);
      
      // Get token largest accounts using direct RPC call
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenLargestAccounts',
          params: [tokenMint]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('RPC error:', data.error);
        throw new Error(`Failed to fetch token accounts: ${data.error.message || 'Unknown RPC error'}`);
      }
      
      if (!data.result?.value || !Array.isArray(data.result.value)) {
        throw new Error('Invalid response format from RPC');
      }

      // Filter out accounts with 0 balance and large airdrop accounts
      const filteredAccounts = data.result.value
        .filter((account: SplTokenAccount) => account.uiAmount > 0 && account.uiAmount < 500_000);
      
      console.log(`Found ${filteredAccounts.length} token accounts after filtering`);
      
      if (filteredAccounts.length === 0) {
        setLeaderboard([]);
        return;
      }
      
      // Create connection for resolving ATA owners
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      
      // Resolve ATA addresses to their actual owners
      const holders: LeaderboardData[] = [];
      
      for (const account of filteredAccounts) {
        try {
          console.log(`Processing ATA: ${account.address} (${account.uiAmount} tokens)`);
          
          // Use @solana/spl-token getAccount to get the parsed account info
          const tokenAccount = await getAccount(connection, new PublicKey(account.address));
          
          holders.push({
            owner: tokenAccount.owner.toString(),
            balance: account.uiAmount,
            rank: 0
          });
          
          console.log(`✅ ATA ${account.address} -> Owner ${tokenAccount.owner.toString()} (${account.uiAmount} tokens)`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.warn(`Failed to resolve owner for ATA ${account.address}:`, error);
          // Fallback: use ATA address with label
          holders.push({
            owner: `${account.address} (ATA)`,
            balance: account.uiAmount,
            rank: 0
          });
        }
      }
      
      // Sort by balance and assign ranks
      const sortedHolders = holders
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit)
        .map((holder, index) => ({
          ...holder,
          rank: index + 1
        }));
      
      console.log(`Returning ${sortedHolders.length} token holders`);
      setLeaderboard(sortedHolders);
      
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [tokenMint, limit, RPC_ENDPOINT]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
}; 