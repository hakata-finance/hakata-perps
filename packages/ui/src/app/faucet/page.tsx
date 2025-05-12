'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { PublicKey, Connection, Keypair, clusterApiUrl, Cluster } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccount, 
  mintTo
} from "@solana/spl-token";

const FaucetPage = () => {
  const [amount, setAmount] = useState<string>("");
  const [network, setNetwork] = useState<string>("devnet");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenMint, setTokenMint] = useState<PublicKey | null>(null);
  const { connected, publicKey } = useWallet();
  
  // Get mint authority key from environment variable with fallback
  const getMintAuthorityKey = () => {
    // If environment variable is set, use it (expected format: comma-separated numbers)
    return new Uint8Array(
      process.env.NEXT_PUBLIC_MINT_AUTHORITY_KEY!.split(',').map(num => parseInt(num.trim(), 10))
    );
  };
  
  // Token mint address from environment variable with fallback
  const FIXED_TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || "3JVVADC6XJ9ddr5mRir9wKfT8cmxisRy8R31vGcGHTDQ";
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const handleNetworkChange = (value: string) => {
    setNetwork(value);
  };
  
  const isButtonDisabled = !amount || parseFloat(amount) <= 0 || isLoading;
  const walletAddress = publicKey?.toBase58() || "";

  const getConnection = () => {
    return new Connection(clusterApiUrl(network as Cluster), "confirmed");
  };

  // Initialize token mint 
  useEffect(() => {
    try {
      // Use the fixed token mint address
      const mintPubkey = new PublicKey(FIXED_TOKEN_MINT_ADDRESS);
      console.log("Using fixed token mint:", mintPubkey.toBase58());
      setTokenMint(mintPubkey);
    } catch (error) {
      console.error("Error initializing token mint:", error);
      toast({
        title: "Error with token mint",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [network]);

  const mintUSDC = async () => {
    if (!publicKey || !tokenMint) return;
    
    try {
      setIsLoading(true);
      const connection = getConnection();
      
      // Use mint authority keypair
      const mintAuthority = Keypair.fromSecretKey(getMintAuthorityKey());
      
      // Get or create associated token account for the user
      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );
      
      // Check if the token account exists
      const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);
      
      // If the token account doesn't exist, create it
      if (!tokenAccountInfo) {
        console.log("Creating token account for user...");
        const createAtaTx = await createAssociatedTokenAccount(
          connection,
          mintAuthority,
          tokenMint,
          publicKey
        );
        console.log("Created associated token account:", createAtaTx);
      }
      
      // Mint tokens to the user's associated token account
      const amountToMint = parseFloat(amount) * 10**6; // Convert to token units (6 decimals for USDC)
      console.log(`Minting ${amount} tokens to ${associatedTokenAddress.toBase58()}...`);
      
      const mintTx = await mintTo(
        connection,
        mintAuthority,
        tokenMint,
        associatedTokenAddress,
        mintAuthority.publicKey,
        Math.floor(amountToMint)
      );
      
      console.log("Minted tokens:", mintTx);
      toast({
        title: "Success!",
        description: `${amount} test USDC has been minted to your wallet`,
        variant: "default",
      });
      
      // Reset amount after successful mint
      setAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      toast({
        title: "Error minting tokens",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-black text-white p-4">
      <div className="w-full max-w-md rounded-lg bg-[#121212] p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Request Test USDC</h2>
          <div className="flex justify-end">
            <Select value={network} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-32 bg-[#1E1E1E] border-gray-700">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E1E] border border-gray-700">
                <SelectItem value="devnet">devnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {tokenMint ? (
          <>
            <div className="mb-4">
              <p className="mb-2 text-gray-400">Token Mint</p>
              <Input 
                value={tokenMint.toBase58()}
                disabled
                className="bg-[#1E1E1E] border-gray-700 w-full text-gray-300"
              />
            </div>
            
            <div className="mb-5">
              <p className="mb-2 text-gray-400">Wallet Address</p>
              <Input 
                value={connected ? walletAddress : ""}
                disabled
                placeholder={connected ? "" : "Connect wallet to continue"}
                className="bg-[#1E1E1E] border-gray-700 w-full text-gray-300"
              />
            </div>
            <div className="mb-8">
              <p className="mb-2 text-gray-400">Amount</p>
              <Input 
                value={amount}
                onChange={handleAmountChange}
                type="number"
                placeholder="Enter test USDC amount"
                className="bg-[#1E1E1E] border-gray-700 w-full"
              />
            </div>
            {connected ? (
              <Button 
                disabled={isButtonDisabled}
                onClick={mintUSDC}
                className="w-full py-6 font-bold bg-[#121212] hover:bg-[#1A1A1A] text-white border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Get Test USDC"}
              </Button>
            ) : (
              <div className="w-full">
                <WalletMultiButton className="w-full font-bold py-6 !bg-[#23262B] !text-white !rounded-lg" />
              </div>
            )}
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-400">Initializing token mint...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaucetPage; 