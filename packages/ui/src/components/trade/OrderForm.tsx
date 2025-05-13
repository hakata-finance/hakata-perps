'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { UsdcIconCircle } from '../vault/UsdcIconCircle';

interface OrderFormProps {
  pair?: string;
}

const OrderForm = ({ pair = 'AAPL-usd' }: OrderFormProps) => {
  const [leverage, setLeverage] = useState<number>(50);
  const [amount, setAmount] = useState<string>("10");
  const [estimatedSize, setEstimatedSize] = useState<string>("10");
  const [activeTab, setActiveTab] = useState<string>("market");
  const [activeSideTab, setActiveSideTab] = useState<string>("buy");
  const { connected } = useWallet();
  
  // Parse the pair to get symbol and currency
  // const [symbol, currency] = pair.split('-');
  
  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between mb-4">
          <TabsList className="bg-gray-900">
            <TabsTrigger value="market" className="data-[state=active]:bg-gray-800">Market</TabsTrigger>
            {/* <TabsTrigger value="limit" className="data-[state=active]:bg-gray-800">Limit</TabsTrigger> */}
          </TabsList>
        </div>
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className={`${activeSideTab === 'buy' ? 'bg-[#18211D] text-[#C8FF00]' : 'border-gray-700 text-white'} hover:bg-[#213026]`}
              variant={activeSideTab === 'buy' ? 'default' : 'outline'}
              onClick={() => setActiveSideTab('buy')}
            >
              Buy
            </Button>
            <Button 
              className={`${activeSideTab === 'sell' ? 'bg-[#211818] text-[#FF6666]' : 'border-gray-700 text-white'} hover:bg-[#302121]`}
              variant={activeSideTab === 'sell' ? 'default' : 'outline'}
              onClick={() => setActiveSideTab('sell')}
            >
              Sell
            </Button>
          </div>
          <div>
            <p className="mb-2 text-gray-400">Pay</p>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#1E1E1E] border-gray-700 pr-16"
                />
              </div>
              <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                <UsdcIconCircle className="h-5 w-5 mr-2" />
                <span>USDC</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-gray-400">Estimated Size</p>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Input 
                  value={estimatedSize} 
                  onChange={(e) => setEstimatedSize(e.target.value)}
                  className="bg-[#1E1E1E] border-gray-700 pr-16"
                />
              </div>
              <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                <UsdcIconCircle className="h-5 w-5 mr-2" />
                <span>USDC</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-gray-400">Leverage</p>
              <p>{leverage}x</p>
            </div>
            <Slider 
              value={[leverage]} 
              min={1} 
              max={100}
              step={1}
              onValueChange={(value) => setLeverage(value[0])}
              className="my-4"
            />
            <div className="grid grid-cols-6 gap-2 text-sm">
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">3x</button>
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">5x</button>
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">10x</button>
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">25x</button>
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">50x</button>
              <button className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700">100x</button>
            </div>
          </div>
          {connected ? (
            <Button className={`w-full font-bold py-6 ${
              activeSideTab === 'buy' 
                ? 'bg-[#C8FF00] hover:bg-[#BDFF00] text-black' 
                : 'bg-[#FF6666] hover:bg-[#FF5555] text-white'
            }`}>
              {activeSideTab === 'buy' ? 'Buy / Long' : 'Sell / Short'}
            </Button>
          ) : (
            <div className="orderform-wallet-btn">
              <WalletMultiButton className="w-full font-bold py-6 !bg-[#23262B] !text-white !rounded-lg" />
            </div>
          )}
        </TabsContent>
        <TabsContent value="limit">
          <div className="text-gray-400">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                className={`${activeSideTab === 'buy' ? 'bg-[#18211D] text-[#C8FF00]' : 'border-gray-700 text-white'} hover:bg-[#213026]`}
                variant={activeSideTab === 'buy' ? 'default' : 'outline'}
                onClick={() => setActiveSideTab('buy')}
              >
                Buy
              </Button>
              <Button 
                className={`${activeSideTab === 'sell' ? 'bg-[#211818] text-[#FF6666]' : 'border-gray-700 text-white'} hover:bg-[#302121]`}
                variant={activeSideTab === 'sell' ? 'default' : 'outline'}
                onClick={() => setActiveSideTab('sell')}
              >
                Sell
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-gray-400">Price</p>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Input 
                      value="147.08" 
                      className="bg-[#1E1E1E] border-gray-700 pr-16"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                    <span>USD</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-gray-400">Amount</p>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Input 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[#1E1E1E] border-gray-700 pr-16"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                    <span>USDC</span>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-2">
                  <p className="text-gray-400">Leverage</p>
                  <p>{leverage}x</p>
                </div>
                <Slider 
                  value={[leverage]} 
                  min={1} 
                  max={100}
                  step={1}
                  onValueChange={(value) => setLeverage(value[0])}
                  className="my-4"
                />
                <div className="grid grid-cols-6 gap-2 text-sm">
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">3x</button>
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">5x</button>
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">10x</button>
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">25x</button>
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">50x</button>
                  <button className="px-1 py-1 rounded bg-gray-800 hover:bg-gray-700">100x</button>
                </div>
              </div>
              
              {connected ? (
                <Button className={`w-full font-bold py-6 ${
                  activeSideTab === 'buy' 
                    ? 'bg-[#C8FF00] hover:bg-[#BDFF00] text-black' 
                    : 'bg-[#FF6666] hover:bg-[#FF5555] text-white'
                }`}>
                  {activeSideTab === 'buy' ? 'Buy / Long' : 'Sell / Short'}
                </Button>
              ) : (
                <div className="orderform-wallet-btn">
                  <WalletMultiButton />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderForm;
