
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-gray-900 text-white">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(131,114,242,0.15),transparent_50%)]"></div>
      
      {/* Content */}
      <div className="container-tight relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-6">
              <span className="block text-white">Trade Real-World Assets,</span>
              <span className="block gradient-text">On-Chain. Instant. AI-Enhanced.</span>
            </h1>
            <p className="paragraph mb-8 text-gray-300 text-lg">
              Seamlessly trade stocks (like $AAPL) and FX perpetuals with up to 50x leverage — right on Solana. 
              Get AI-powered event insights, real-time signals, and full self-custody. Zero intermediaries. Zero friction.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-hakata-light-purple hover:bg-hakata-purple text-white px-8 py-6 text-lg">
                Join Waitlist
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Side - Terminal Mockup */}
          <div className="relative">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700">
              {/* Terminal Header */}
              <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400">Hakata Terminal</div>
                <div className="w-4"></div>
              </div>
              
              {/* Terminal Content */}
              <div className="grid grid-cols-4 gap-1 p-2">
                {/* Main Chart Area */}
                <div className="col-span-3 row-span-3 bg-black/30 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-medium">SOL-USD</div>
                    <div className="text-xs text-green-500">$165.24 (+2.3%)</div>
                  </div>
                  
                  {/* Trading Chart */}
                  <div className="h-64 relative">
                    <div className="absolute inset-0">
                      {/* Grid lines */}
                      <div className="absolute w-full h-full grid grid-rows-4 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="border-t border-gray-700/50"></div>
                        ))}
                      </div>
                      
                      {/* Chart line */}
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                        <path 
                          d="M0,50 L20,45 L40,55 L60,40 L80,47 L100,35 L120,50 L140,30 L160,40 L180,25 L200,35 L220,15 L240,25 L260,20 L280,30 L300,15 L320,25 L340,10 L360,20 L380,15 L400,25" 
                          fill="none" 
                          stroke="#8372F2" 
                          strokeWidth="2"
                          className="w-full h-full"
                        />
                      </svg>
                      
                      {/* Gradient area under the line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Chart Labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <div>09:00</div>
                    <div>12:00</div>
                    <div>15:00</div>
                    <div>18:00</div>
                  </div>
                </div>
                
                {/* Right Sidebar */}
                <div className="col-span-1 row-span-2 bg-gray-800/50 rounded-md p-2">
                  <div className="text-xs font-medium mb-2">Market Insight</div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      <span className="text-gray-300">Bullish trend</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
                      <span className="text-gray-300">Event in 2d</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-1.5 h-1.5 bg-hakata-light-purple rounded-full mr-1.5"></div>
                      <span className="text-gray-300">High volume</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Panel */}
                <div className="col-span-4 bg-gray-800/50 rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium">Recent Trades</div>
                    <div className="text-xs text-gray-400">View All</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                    <div className="bg-green-500/20 text-green-400 rounded p-1 text-center">BUY</div>
                    <div className="bg-red-500/20 text-red-400 rounded p-1 text-center">SELL</div>
                    <div className="bg-purple-500/20 text-purple-400 rounded p-1 text-center">LONG</div>
                    <div className="bg-blue-500/20 text-blue-400 rounded p-1 text-center">SHORT</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute -top-6 right-4 bg-black/40 backdrop-blur-md p-3 rounded shadow-lg border border-purple-500/20 text-xs">
              <div className="font-medium text-hakata-light-purple">AI Signal</div>
              <div className="text-white/80">Volatility increasing</div>
            </div>
            
            <div className="absolute -bottom-4 left-4 bg-black/40 backdrop-blur-md p-3 rounded shadow-lg border border-purple-500/20 text-xs" style={{ animationDelay: '1s' }}>
              <div className="font-medium text-hakata-light-purple">Event Alert</div>
              <div className="text-white/80">Earnings in 3 days</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glow Effects */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-hakata-purple/20 rounded-full filter blur-[100px]"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-hakata-light-purple/20 rounded-full filter blur-[80px]"></div>
    </section>
  );
};

export default HeroSection;
