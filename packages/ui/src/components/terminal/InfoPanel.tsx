
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell } from "lucide-react";
import NewsFeed from './NewsFeed';
import MarketInsightsPanel from './MarketInsightsPanel';

const InfoPanel = () => {
  const [activeTab, setActiveTab] = useState<string>("news");

  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 mb-3 w-full">
          <TabsTrigger value="news" className="data-[state=active]:bg-gray-800">
            Latest News
          </TabsTrigger>
          <TabsTrigger value="newsfeed" className="data-[state=active]:bg-gray-800">
            News Feed
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-gray-800">
            Insights
          </TabsTrigger>
        </TabsList>
        
        {/* Latest News Tab */}
        <TabsContent value="news">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Bell size={14} className="mr-2" />
            High Impact News
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div className="p-2 border border-gray-800 rounded bg-black/40">
              <div className="text-xs text-[#C8FF00] mb-1">POSITIVE</div>
              <p className="text-xs">SOL Reports Strong Q2 Earnings, Beats Expectations</p>
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>10:30 AM</span>
                <span>Bloomberg</span>
              </div>
            </div>
            <div className="p-2 border border-gray-800 rounded bg-black/40">
              <div className="text-xs text-red-400 mb-1">NEGATIVE</div>
              <p className="text-xs">Federal Reserve Raises Interest Rates by 25 Basis Points</p>
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>12:45 PM</span>
                <span>Financial Times</span>
              </div>
            </div>
            <div className="p-2 border border-gray-800 rounded bg-black/40">
              <div className="text-xs text-gray-400 mb-1">NEUTRAL</div>
              <p className="text-xs">Regulatory Body Issues New Guidelines for Crypto Trading</p>
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>Yesterday</span>
                <span>WSJ</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* News Feed Tab */}
        <TabsContent value="newsfeed" className="h-[350px]">
          <NewsFeed />
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights">
          <MarketInsightsPanel className="border-0 shadow-none bg-transparent" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoPanel;
