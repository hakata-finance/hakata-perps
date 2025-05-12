'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFaucet } from './hooks/useFaucet';

const FaucetPage = () => {
  const { connected, publicKey } = useWallet();
  const { 
    amount, 
    network, 
    isLoading, 
    tokenMint,
    isButtonDisabled,
    handleAmountChange,
    handleNetworkChange,
    mintTokens
  } = useFaucet();
  
  const walletAddress = publicKey?.toBase58() || "";
  
  const handleMint = () => {
    if (publicKey) {
      mintTokens(publicKey);
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
                onClick={handleMint}
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