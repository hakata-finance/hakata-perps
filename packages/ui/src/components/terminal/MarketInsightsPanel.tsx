
import React from 'react';
import { ChartBarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SentimentIndicator from './SentimentIndicator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface MarketInsightsPanelProps {
  className?: string;
}

const MarketInsightsPanel = ({ className }: MarketInsightsPanelProps) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className={className}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                <CardTitle className="text-sm flex items-center">
                  <ChartBarIcon className="mr-2 h-4 w-4" />
                  Market Insights
                  <span className="ml-2 text-xs text-gray-400">
                    {isOpen ? '(click to collapse)' : '(click to expand)'}
                  </span>
                </CardTitle>
              </Button>
            </CollapsibleTrigger>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-3 w-3" />
                  <span className="sr-only">Info</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="text-sm">
                  <p className="font-medium mb-2">About Market Insights</p>
                  <p className="text-muted-foreground text-xs">
                    Market insights are derived from analysis of news sentiment, 
                    social media activity, and trading volumes. Updated every 5 minutes.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="py-2 px-4">
            <div className="space-y-4">
              <SentimentIndicator sentiment="bullish" />
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Key Metrics</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-900/50 p-2 rounded-md">
                    <div className="text-xs text-gray-400">Open Interest</div>
                    <div className="text-sm font-medium text-green-400">+12.3%</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-md">
                    <div className="text-xs text-gray-400">24h Volume</div>
                    <div className="text-sm font-medium">$1.2B</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-md">
                    <div className="text-xs text-gray-400">Long/Short</div>
                    <div className="text-sm font-medium text-green-400">1.23</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Major Events</div>
                <div className="bg-gray-900/50 p-2 rounded-md">
                  <div className="text-xs">SOL Earnings Report in 2 days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MarketInsightsPanel;
