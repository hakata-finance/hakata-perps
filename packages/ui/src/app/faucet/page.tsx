'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FaucetPage = () => {
  const [amount, setAmount] = useState<string>("");
  const { connected, publicKey } = useWallet();
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const isButtonDisabled = !amount || parseFloat(amount) <= 0;
  const walletAddress = publicKey?.toBase58() || "";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-black text-white p-4">
      <div className="w-full max-w-md rounded-lg bg-[#121212] p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Request Airdrop</h2>
          <div className="flex justify-end">
            <Select defaultValue="devnet">
              <SelectTrigger className="w-32 bg-[#1E1E1E] border-gray-700">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E1E] border border-gray-700">
                <SelectItem value="devnet">devnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            placeholder="Enter USDC amount"
            className="bg-[#1E1E1E] border-gray-700 w-full"
          />
        </div>
        {connected ? (
          <Button 
            disabled={isButtonDisabled}
            className="w-full py-6 font-bold bg-[#121212] hover:bg-[#1A1A1A] text-white border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get USDC
          </Button>
        ) : (
          <div className="w-full">
            <WalletMultiButton className="w-full font-bold py-6 !bg-[#23262B] !text-white !rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FaucetPage; 