
import React from 'react';
import { Button } from '@/components/ui/button';

const AIInsights = () => {
  return (
    <section id="ai-insights" className="section-padding bg-gradient-to-br from-hakata-blue to-hakata-purple text-white">
      <div className="container-tight">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div>
            <h2 className="heading-lg mb-6 text-white">
              Trade Smarter with AI-Driven Insights.
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Stay ahead with Hakata's intuitive interface. Our AI Radar surfaces news sentiment, upcoming economic events, and anomaly alerts—helping you identify opportunities and trade with greater confidence. Don't just trade, out-trade.
            </p>
            <Button className="bg-white text-hakata-purple hover:bg-gray-100 px-8 py-6 text-lg">
              Join Waitlist
            </Button>
          </div>
          
          {/* Right Side - Visual Representation */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
            <div className="bg-black/30 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-black/50 px-4 py-3 flex justify-between items-center">
                <div className="text-white font-medium">AI Insights Dashboard</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="w-2 h-2 rounded-full bg-hakata-light-purple"></div>
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-4">
                {/* News Sentiment */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">News Sentiment</div>
                    <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Positive</div>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full">
                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                {/* Recent Events */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Recent Events</div>
                  <div className="space-y-2">
                    <div className="bg-white/10 p-3 rounded">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                        <div className="text-xs">Earnings announcement in 2 days</div>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                        <div className="text-xs">New product launch detected</div>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                        <div className="text-xs">Positive analyst coverage (+2)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Anomaly Detection */}
                <div>
                  <div className="text-sm font-medium mb-2">Anomaly Detection</div>
                  <div className="bg-white/10 p-3 rounded flex items-center justify-between">
                    <div className="text-xs">Unusual options activity detected</div>
                    <div className="px-2 py-0.5 bg-hakata-light-purple/30 text-hakata-light-purple rounded text-xs">Alert</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Indicators */}
            <div className="relative h-20 mt-4">
              <div className="absolute top-0 left-4 bg-white/20 backdrop-blur-sm p-2 rounded text-xs animate-float">
                Market sentiment: Bullish
              </div>
              <div className="absolute bottom-0 right-4 bg-white/20 backdrop-blur-sm p-2 rounded text-xs animate-float" style={{ animationDelay: '1s' }}>
                Volatility alert: Moderate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsights;
