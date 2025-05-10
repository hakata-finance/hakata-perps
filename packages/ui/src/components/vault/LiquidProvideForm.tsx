'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const LiquidProvideForm = () => {
  const [inputAmount, setInputAmount] = useState<string>("0");
  const [outputAmount] = useState<string>("0");
  const [activeSideTab, setActiveSideTab] = useState<string>("add");
  const { connected } = useWallet();
  
  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            className={`${activeSideTab === 'add' ? 'bg-[#18211D] text-[#C8FF00]' : 'border-gray-700 text-white'} hover:bg-[#213026]`}
            variant={activeSideTab === 'add' ? 'default' : 'outline'}
            onClick={() => setActiveSideTab('add')}
          >
            Add
          </Button>
          <Button 
            className={`${activeSideTab === 'remove' ? 'bg-[#211818] text-[#FF6666]' : 'border-gray-700 text-white'} hover:bg-[#302121]`}
            variant={activeSideTab === 'remove' ? 'default' : 'outline'}
            onClick={() => setActiveSideTab('remove')}
          >
            Remove
          </Button>
        </div>
        
        <div>
          <p className="mb-2 text-gray-400">You {activeSideTab === 'add' ? 'Add' : 'Remove'}</p>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Input 
                value={inputAmount} 
                onChange={(e) => setInputAmount(e.target.value)}
                className="bg-[#1E1E1E] border-gray-700 pr-16"
              />
            </div>
            {/* TODO: Add token icon */}
            <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
              <span>USDC</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="mb-2 text-gray-400">You Receive</p>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Input 
                value={outputAmount} 
                className="bg-[#1E1E1E] border-gray-700 pr-16"
                readOnly
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
              <span>LP</span>
            </div>
          </div>
        </div>
        
        {connected ? (
          <Button className={`w-full font-bold py-6 ${
            activeSideTab === 'add' 
              ? 'bg-[#C8FF00] hover:bg-[#BDFF00] text-black' 
              : 'bg-[#FF6666] hover:bg-[#FF5555] text-white'
          }`}>
            Confirm
          </Button>
        ) : (
          <div className="orderform-wallet-btn">
            <WalletMultiButton className="w-full font-bold py-6 !bg-[#23262B] !text-white !rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidProvideForm;
