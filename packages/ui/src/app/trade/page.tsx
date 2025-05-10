'use client';

import React, { useState } from 'react';
import BreakingNewsBanner from '@/components/terminal/BreakingNewsBanner';
import Navbar from '@/components/layout/Navbar';
import ChartPanel from '@/components/terminal/ChartPanel';
import PositionsPanel from '@/components/terminal/PositionsPanel';
import OrderForm from '@/components/terminal/OrderForm';
import InfoPanel from '@/components/terminal/InfoPanel';

const TradePage = () => {
  const [showBreakingNews] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Navbar */}
      <Navbar />
      {/* Breaking News Banner */}
      <BreakingNewsBanner 
        message="BREAKING: Federal Reserve announces unexpected 50 basis point rate cut" 
        visible={showBreakingNews} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main Chart Area - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart Panel */}
          <ChartPanel />
          {/* Positions/Orders/History Tabs */}
          <PositionsPanel />
        </div>
        {/* Order Panel - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-4">
          {/* Order Form */}
          <OrderForm />
          {/* News and Insights Panel */}
          <InfoPanel />
        </div>
      </div>
    </div>
  );
};

export default TradePage; 