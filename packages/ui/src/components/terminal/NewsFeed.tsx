
import React, { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NewsFilters from './NewsFilters';
import NewsContainer from './NewsContainer';
import { useNewsFiltering } from '@/hooks/useNewsFiltering';
import { NewsItemProps } from './NewsItem';

// Mock data for news items
const allNews: NewsItemProps[] = [
  {
    title: "Federal Reserve Raises Interest Rates by 25 Basis Points",
    timestamp: "12:45 PM",
    source: "Financial Times",
    impact: 'high',
    sentiment: 'negative',
    url: "#"
  },
  {
    title: "SOL Reports Strong Q2 Earnings, Beats Expectations",
    timestamp: "10:30 AM",
    source: "Bloomberg",
    impact: 'high',
    sentiment: 'positive',
    url: "#"
  },
  {
    title: "Market Volatility Increases as Geopolitical Tensions Rise",
    timestamp: "9:15 AM",
    source: "Reuters",
    impact: 'medium',
    sentiment: 'negative',
    url: "#"
  },
  {
    title: "New Technology Partnership Announced for Blockchain Scaling",
    timestamp: "8:20 AM",
    source: "CoinDesk",
    impact: 'medium',
    sentiment: 'positive',
    url: "#"
  },
  {
    title: "Regulatory Body Issues New Guidelines for Crypto Trading",
    timestamp: "Yesterday",
    source: "WSJ",
    impact: 'high',
    sentiment: 'neutral',
    url: "#"
  },
  {
    title: "Technical Analysis: SOL Approaches Key Resistance Level",
    timestamp: "Yesterday",
    source: "TradingView",
    impact: 'low',
    sentiment: 'neutral',
    url: "#"
  },
];

const NewsFeed = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const filteredNews = useNewsFiltering(allNews, activeTab);
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <NewsFilters activeTab={activeTab} />
      </Tabs>
      
      <NewsContainer news={filteredNews} />
    </div>
  );
};

export default NewsFeed;
