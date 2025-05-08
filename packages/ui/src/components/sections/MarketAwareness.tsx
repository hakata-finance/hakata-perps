
import React from 'react';

const MarketAwareness = () => {
  const radarCategories = [
    { name: "News Analysis", percentage: 85 },
    { name: "Market Sentiment", percentage: 70 },
    { name: "Economic Events", percentage: 90 },
    { name: "Technical Analysis", percentage: 65 },
    { name: "Social Media", percentage: 75 },
  ];

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-tight">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-lg text-center mb-6">
            Know What Moves Your Market, Instantly.
          </h2>
          <p className="paragraph text-center mb-12 max-w-2xl mx-auto">
            Our real-time AI analyzes news sentiment, macro headlines, and key economic events. Get actionable insights, seamlessly integrated into your trading workflow, giving you the clarity to act decisively.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 lg:p-8">
              {/* Radar Visualization */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Left - Radar Chart */}
                <div className="w-full lg:w-1/2 aspect-square relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Concentric circles */}
                    <div className="w-full h-full rounded-full border border-gray-200 dark:border-gray-700 opacity-20"></div>
                    <div className="absolute w-3/4 h-3/4 rounded-full border border-gray-200 dark:border-gray-700 opacity-40"></div>
                    <div className="absolute w-1/2 h-1/2 rounded-full border border-gray-200 dark:border-gray-700 opacity-60"></div>
                    <div className="absolute w-1/4 h-1/4 rounded-full border border-gray-200 dark:border-gray-700 opacity-80"></div>
                    
                    {/* Center circle */}
                    <div className="absolute w-12 h-12 rounded-full bg-hakata-light-purple flex items-center justify-center text-white text-xs font-medium">
                      AI Radar
                    </div>
                    
                    {/* Data points */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">N</div>
                    </div>
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">E</div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg">S</div>
                    </div>
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">W</div>
                    </div>
                    
                    {/* Connecting lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                      <line x1="100" y1="100" x2="100" y2="0" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" />
                      <line x1="100" y1="100" x2="200" y2="100" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="1" />
                      <line x1="100" y1="100" x2="100" y2="200" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1" />
                      <line x1="100" y1="100" x2="0" y2="100" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1" />
                    </svg>
                    
                    {/* Pulse animation */}
                    <div className="absolute w-full h-full rounded-full bg-hakata-light-purple/5 animate-ping"></div>
                  </div>
                </div>
                
                {/* Right - Score Categories */}
                <div className="w-full lg:w-1/2 space-y-4">
                  {radarCategories.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm font-bold">{category.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-hakata-light-purple rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mr-3">
                        <span className="text-sm">!</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Market Alert</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Fed announcement tomorrow could impact market volatility. AI predicting 75% chance of positive response.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketAwareness;
