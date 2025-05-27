import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';

// Configure for Edge Runtime (required for Cloudflare Pages)
export const runtime = 'edge';

interface SplTokenAccount {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface TokenHolder {
  owner: string;
  balance: number;
  rank: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('mint') || 'FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get API key from server environment
    // const apiKey = process.env.HELIUS_API_KEY;
    const apiKey = 'dcefb6d9-a6e8-4679-8b60-b9555a56b3cf';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HELIUS_API_KEY not configured on server' },
        { status: 500 }
      );
    }

    const endpoint = `https://devnet.helius-rpc.com?api-key=${apiKey}`;
    
    console.log('Fetching token holders for mint:', tokenMint);
    
    // Get token largest accounts
    const response = await fetch(endpoint, {
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
      return NextResponse.json(
        { error: 'Failed to fetch token accounts', details: data.error },
        { status: 500 }
      );
    }
    
    if (!data.result?.value || !Array.isArray(data.result.value)) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Filter out accounts with 0 balance and large airdrop accounts
    const filteredAccounts = data.result.value
      .filter((account: SplTokenAccount) => account.uiAmount > 0 && account.uiAmount < 500_000);
    
    console.log(`Found ${filteredAccounts.length} token accounts after filtering`);
    
    if (filteredAccounts.length === 0) {
      return NextResponse.json({
        holders: [],
        message: 'No token holders found after filtering'
      });
    }
    
    // Create connection using Helius endpoint
    const connection = new Connection(endpoint, 'confirmed');
    
    // Resolve ATA addresses to their actual owners using @solana/spl-token
    const holders: TokenHolder[] = [];
    
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
    
    return NextResponse.json({
      holders: sortedHolders,
      total: sortedHolders.length,
      message: `Found ${sortedHolders.length} token holders`
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 