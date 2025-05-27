import { Rpc, createRpc } from "@lightprotocol/stateless.js";
import { createTokenProgramLookupTable } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey } from "@solana/web3.js";

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

/**
 * Creates a lookup table for cXP token program with additional token holders
 */
export async function createCxpLookupTable(
  connection: Rpc,
  payer: Keypair,
  authority: Keypair,
  cxpTokenMint: PublicKey,
  additionalAccounts: PublicKey[] = []
): Promise<{ address: PublicKey; signature: string }> {
  try {
    // Get top cXP token holders to include in lookup table
    const response = await fetch('/api/leaderboard?limit=10');
    const data = await response.json();
    
    const holderAccounts = data.holders?.map((holder: { owner: string }) => new PublicKey(holder.owner)) || [];

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
 * Fetches leaderboard data from the API route
 */
export async function fetchCxpLeaderboard(
  limit: number = 10
): Promise<LeaderboardData[]> {
  try {
    console.log("Fetching cXP leaderboard from API...");
    
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log(`Received ${data.holders?.length || 0} token holders from API`);
    return data.holders || [];
    
  } catch (error) {
    console.error("Error fetching cXP leaderboard:", error);
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