import { Rpc, createRpc } from "@lightprotocol/stateless.js";
import { createTokenProgramLookupTable } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { getAccount } from '@solana/spl-token';

export interface CxpTokenHolder {
  owner: string | PublicKey;
  balance: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
}

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

/**
 * Fetches leaderboard data directly from RPC (client-side)
 */
async function fetchLeaderboardFromRpc(
  tokenMint: string,
  limit: number = 10,
  rpcEndpoint: string
): Promise<LeaderboardData[]> {
  try {
    console.log('Fetching token holders for mint:', tokenMint);
    
    // Get token largest accounts using direct RPC call
    const response = await fetch(rpcEndpoint, {
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
      return [];
    }
    
    // Create connection for resolving ATA owners
    const connection = new Connection(rpcEndpoint, 'confirmed');
    
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
    return sortedHolders;
    
  } catch (error) {
    console.error('Error fetching leaderboard from RPC:', error);
    throw error;
  }
}

/**
 * Creates a lookup table for cXP token program with additional token holders
 */
export async function createCxpLookupTable(
  connection: Rpc,
  payer: Keypair,
  authority: Keypair,
  cxpTokenMint: PublicKey,
  additionalAccounts: PublicKey[] = [],
  rpcEndpoint?: string
): Promise<{ address: PublicKey; signature: string }> {
  try {
    // Use the same RPC endpoint as the compressed tokens if not provided
    const endpoint = rpcEndpoint || process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://devnet.helius-rpc.com?api-key=dcefb6d9-a6e8-4679-8b60-b9555a56b3cf";
    
    // Get top cXP token holders to include in lookup table using client-side RPC call
    const leaderboardData = await fetchLeaderboardFromRpc(
      cxpTokenMint.toString(),
      10,
      endpoint
    );
    
    const holderAccounts = leaderboardData.map((holder) => new PublicKey(holder.owner));

    // Combine with additional accounts
    const allAccounts = [...holderAccounts, ...additionalAccounts];

    // Create the lookup table
    const { address } = await createTokenProgramLookupTable(
      connection,
      payer,
      authority,
      [cxpTokenMint], // Token mints
      allAccounts // Additional accounts including top holders
    );

    console.log("Created cXP lookup table:", address.toBase58());
    console.log("Included accounts:", allAccounts.length);

    return { 
      address, 
      signature: "lookup_table_created" // Placeholder - actual signature would come from the transaction
    };
  } catch (error) {
    console.error("Error creating cXP lookup table:", error);
    throw error;
  }
}

/**
 * Gets compressed token balance for a specific owner
 */
export async function getCxpBalance(
  connection: Rpc,
  owner: PublicKey,
  cxpTokenMint: PublicKey
): Promise<number> {
  try {
    console.log("Getting compressed token accounts for owner:", owner.toBase58());
    
    const compressedAccounts = await connection.getCompressedTokenAccountsByOwner(
      owner, 
      { mint: cxpTokenMint }
    );
    
    console.log("Compressed accounts response:", compressedAccounts);
    
    // If we have compressed tokens, sum them up
    if (compressedAccounts.items && compressedAccounts.items.length > 0) {
      const totalBalance = compressedAccounts.items.reduce(
        (total, account) => {
          const compressedAccount = account.compressedAccount as unknown as {
            tokenAmount?: { amount: string | number };
            amount?: string | number;
          };
          
          const amount = compressedAccount.amount || 
                        (compressedAccount.tokenAmount?.amount) || 
                        0;
                        
          return total + Number(amount);
        },
        0
      );
      
      // Convert from lamports to cXP (based on 9 decimals)
      return totalBalance / 1000000000; // LAMPORTS_PER_SOL equivalent
    }

    return 0;
  } catch (error) {
    console.error("Error getting cXP balance:", error);
    return 0;
  }
}

/**
 * Creates RPC connection for devnet with compression support
 */
export function createDevnetRpc(apiKey?: string): Rpc {
  if (!apiKey) {
    throw new Error("API key is required for ZK Compression RPC access. Please provide a Helius API key.");
  }
  
  const endpoint = `https://devnet.helius-rpc.com?api-key=${apiKey}`;
  
  console.log("Creating RPC connection to:", endpoint.replace(apiKey, "***"));
  
  return createRpc(endpoint, endpoint, endpoint);
}

/**
 * Formats balance for display (e.g., 1000000 -> "1.00M")
 */
export function formatBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(2)}M`;
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K`;
  }
  return balance.toFixed(2);
}

/**
 * Formats wallet address for display (e.g., "1234...5678")
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 