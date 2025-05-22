'use client';
export const runtime = "edge";
export const dynamic = 'force-dynamic';


import { useParams } from 'next/navigation';
import ChartPanel from '@/components/trade/ChartPanel';
import PositionsPanel from '@/components/trade/PositionsPanel';
import OrderForm from '@/components/trade/OrderForm';
import InfoPanel from '@/components/trade/InfoPanel';

const TradePage = () => {
  const params = useParams();
  const { pair } = params;

  const [symbol, currency] = ['AAPL', 'usd'];

  return (
    <div className="bg-black text-white h-[calc(100vh-73px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-full">
        {/* Main Chart Area - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart Panel */}
          <ChartPanel symbol={symbol} currency={currency} />
          {/* Positions/Orders/History Tabs */}
          <PositionsPanel />
        </div>
        {/* Order Panel - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-4 h-full overflow-y-auto">
          {/* Order Form */}
          <OrderForm symbol={symbol} />
          {/* News and Insights Panel */}
          <InfoPanel />
        </div>
      </div>
    </div>
  );
};

export default TradePage; 