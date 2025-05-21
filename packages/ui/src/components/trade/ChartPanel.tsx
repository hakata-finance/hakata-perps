'use client';

import React, { useEffect, useRef } from 'react';
// import { Settings } from "lucide-react";
import { usePythPrices } from '@/hooks/usePythPrices';
import VolatilityScore from './VolatilityScore';
import SentimentScore from './SentimentScore';
import { useDailyPriceStats } from '@/hooks/useDailyPriceStats';
import { asTokenE } from '@/lib/TokenUtils';
import { twMerge } from 'tailwind-merge';

function formatNumber(number: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
  
  return formatter.format(number);
}

interface ChartPanelProps {
  symbol?: string;
  currency?: string;
}

const ChartPanel = ({ symbol = 'AAPL', currency = 'usd' }: ChartPanelProps) => {
  const stats = useDailyPriceStats(asTokenE(symbol));
  const { prices } = usePythPrices();
  const tradingViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any previous widget
    if (tradingViewRef.current) {
      tradingViewRef.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error Error with TradingView
      if (window.TradingView) {
        // @ts-expect-error Error with TradingView
        new window.TradingView.widget({
          autosize: true,
          symbol: `PYTH:${symbol}`,
          interval: '60',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#121212',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: 'tradingview_aapl_usd',
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [symbol]);

  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{symbol} / {currency.toUpperCase()}</span>
          {/* <span className="text-[#C8FF00] font-bold">230.54</span> */}
          <span className="text-[#C8FF00] font-bold">{prices.get(symbol)?.toFixed(3)}</span>
          {/* <span
            className={twMerge(
              "text-sm",
              stats.change24hr < 0 && "text-rose-400",
              stats.change24hr === 0 && "text-white",
              stats.change24hr > 0 && "text-emerald-400"
            )}
          >
            {formatNumber(stats.change24hr)}
          </span> */}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <VolatilityScore />
          <SentimentScore />
          {/* <button className="p-2 rounded-full hover:bg-gray-800" tabIndex={0} aria-label="Info" onClick={() => {}} onKeyDown={() => {}}>
            <Settings size={20} />
          </button> */}
        </div>
      </div>
      {/* <div className="flex items-center gap-2 mb-4 text-sm">
        <div className="flex space-x-1">
          {timeFrames.map((tf) => (
            <button 
              key={tf}
              className={`px-2 py-1 rounded hover:bg-gray-800 ${activeTimeFrame === tf ? 'bg-gray-800' : ''}`}
              onClick={() => setActiveTimeFrame(tf)}
              tabIndex={0}
              aria-label={`Set time frame to ${tf}`}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveTimeFrame(tf); }}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button className="p-1 rounded hover:bg-gray-800" tabIndex={0} aria-label="Chart Style 1" onClick={() => {}} onKeyDown={() => {}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 3, 21 3, 21 21, 3 21"></polygon></svg>
          </button>
          <button className="p-1 rounded hover:bg-gray-800" tabIndex={0} aria-label="Chart Style 2" onClick={() => {}} onKeyDown={() => {}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
          </button>
          <button className="p-1 rounded hover:bg-gray-800" tabIndex={0} aria-label="Chart Style 3" onClick={() => {}} onKeyDown={() => {}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </button>
        </div>
        <button className="p-1 rounded hover:bg-gray-800 ml-4" tabIndex={0} aria-label="Add" onClick={() => {}} onKeyDown={() => {}}>
          <Plus size={18} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button className="p-1 rounded hover:bg-gray-800" tabIndex={0} aria-label="Maximize" onClick={() => {}} onKeyDown={() => {}}>
            <Maximize2 size={18} />
          </button>
          <button className="p-1 rounded hover:bg-gray-800" tabIndex={0} aria-label="Minimize" onClick={() => {}} onKeyDown={() => {}}>
            <Minimize2 size={18} />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 px-3" tabIndex={0} aria-label="Indicators" onClick={() => {}} onKeyDown={() => {}}>
            Indicators
          </button>
        </div>
      </div> */}
      <div className="h-[400px] relative bg-[#0D0D0D] rounded" aria-label="TradingView Chart" tabIndex={0}>
        <div
          id="tradingview_aapl_usd"
          ref={tradingViewRef}
          className="w-full h-full"
          style={{ minHeight: 400 }}
        />
      </div>
    </div>
  );
};

export default ChartPanel;
