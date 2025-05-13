'use client';

import React from 'react';
import ChartPanel from '@/components/trade/ChartPanel';
import PositionsPanel from '@/components/trade/PositionsPanel';
import OrderForm from '@/components/trade/OrderForm';
import InfoPanel from '@/components/trade/InfoPanel';

interface TradePageProps {
  params: {
    pair: string;
  };
}

const TradePage = ({ params }: TradePageProps) => {
  const { pair } = params;

  return (
    <div className="bg-black text-white h-[calc(100vh-73px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main Chart Area - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart Panel */}
          <ChartPanel pair={pair} />
          {/* Positions/Orders/History Tabs */}
          <PositionsPanel />
        </div>
        {/* Order Panel - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-4">
          {/* Order Form */}
          <OrderForm pair={pair} />
          {/* News and Insights Panel */}
          <InfoPanel />
        </div>
      </div>
    </div>
  );
};

export default TradePage; 