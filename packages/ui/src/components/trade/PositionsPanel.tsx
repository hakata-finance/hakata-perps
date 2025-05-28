'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePositions } from '@/hooks/usePositions';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { closePosition } from '@/actions/closePosition';
import { BN } from '@coral-xyz/anchor';
import { tokenAddressToTokenE } from '@/lib/TokenUtils';
import { isVariant } from '@/lib/types';
import { usePythPrices } from '@/hooks/usePythPrices';
import { PRICE_DECIMALS } from '@/lib/constants';
import { useProgram } from '@/hooks/useProgram';
import { sleep } from '@/lib/TransactionHandlers';
import { PositionAccount } from '@/lib/PositionAccount';

const PositionsPanel = () => {
  const [activeTab, setActiveTab] = useState<string>("positions");
  const [isClosing, setIsClosing] = useState<{[key: string]: boolean}>({});
  
  const { positionAccounts, fetchPositions } = usePositions();
  const { connection } = useConnection();
  const { wallet, publicKey, signTransaction } = useWallet();
  const { prices } = usePythPrices();
  const program = useProgram();

  const handleClosePosition = async (positionAccount: PositionAccount) => {
    if (!wallet || !publicKey || !signTransaction) return;
    
    const positionKey = positionAccount.publicKey.toString();
    setIsClosing(prev => ({ ...prev, [positionKey]: true }));

    try {
      // Get the pay token from custody
      const payToken = tokenAddressToTokenE(positionAccount.custodyConfig.mintKey.toString());
      
      // Get current price with slippage protection
      const currentPrice = prices.get(payToken) ?? 0;
      const priceWithSlippage = isVariant(positionAccount.side, 'long')
        ? new BN(currentPrice * 0.95 * 10 ** PRICE_DECIMALS) // 5% slippage for long
        : new BN(currentPrice * 1.05 * 10 ** PRICE_DECIMALS); // 5% slippage for short

      await closePosition(
        program,
        publicKey,
        signTransaction,
        connection,
        positionAccount.publicKey,
        payToken,
        positionAccount.side,
        priceWithSlippage
      );

      // Refresh positions after closing
      await sleep(3000);
      await fetchPositions();
      
    } catch (error) {
      console.error('Failed to close position:', error);
    } finally {
      setIsClosing(prev => ({ ...prev, [positionKey]: false }));
    }
  };

  const formatCurrency = (amount: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const color = value >= 0 ? 'text-green-400' : 'text-red-400';
    const sign = value >= 0 ? '+' : '';
    return <span className={color}>{sign}{value.toFixed(2)}%</span>;
  };

  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900">
          <TabsTrigger value="positions" className="data-[state=active]:bg-gray-800">
            Positions ({positionAccounts.length})
          </TabsTrigger>
          {/* <TabsTrigger value="orders" className="data-[state=active]:bg-gray-800">Orders</TabsTrigger> */}
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">History</TabsTrigger>
        </TabsList>
        <TabsContent value="positions" className="py-4">
          {positionAccounts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No open positions</div>
          ) : (
            <div className="space-y-3">
              {positionAccounts.map((position) => {
                const positionKey = position.publicKey.toString();
                const pnlUsd = Number(position.pnlUsd) / 1e6; // Convert from microUSD
                const collateralUsd = Number(position.collateralUsd) / 1e6;
                const sizeUsd = Number(position.sizeUsd) / 1e6;
                const pnlPercentage = collateralUsd > 0 ? (pnlUsd / collateralUsd) * 100 : 0;
                const currentPrice = prices.get(tokenAddressToTokenE(position.custodyConfig.mintKey.toString())) ?? 0;
                const entryPrice = Number(position.price) / 1e6;
                
                return (
                  <div key={positionKey} className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{position.custodyConfig.symbol}</span>
                          <Badge 
                            variant={isVariant(position.side, 'long') ? 'default' : 'secondary'}
                            className={`${
                              isVariant(position.side, 'long') 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {isVariant(position.side, 'long') ? 'LONG' : 'SHORT'} {position.leverage}x
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleClosePosition(position)}
                        disabled={isClosing[positionKey]}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isClosing[positionKey] ? 'Closing...' : 'Close'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-400">Size</p>
                        <p className="font-medium">{formatCurrency(sizeUsd)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Collateral</p>
                        <p className="font-medium">{formatCurrency(collateralUsd)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Entry Price</p>
                        <p className="font-medium">{formatCurrency(entryPrice, 4)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Current Price</p>
                        <p className="font-medium">{formatCurrency(currentPrice, 4)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">PnL</p>
                        <p className={`font-medium ${pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(pnlUsd)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">PnL %</p>
                        <p className="font-medium">{formatPercentage(pnlPercentage)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Liq. Price</p>
                        <p className="font-medium text-orange-400">
                          {formatCurrency(Number(position.liquidationPriceUsd) / 1e6, 4)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Opened</p>
                        <p className="font-medium text-gray-300">
                          {new Date(Number(position.openTime) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        {/* <TabsContent value="orders" className="py-4 text-gray-400">No orders</TabsContent> */}
        <TabsContent value="history" className="py-4 text-gray-400">
          <div className="text-center py-8">
            Position history coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PositionsPanel;
