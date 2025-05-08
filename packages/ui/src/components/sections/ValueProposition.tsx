
import React from 'react';

const ValueProposition = () => {
  return (
    <section id="value-proposition" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-tight">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-lg text-center mb-8">
            <span className="gradient-text">Your Edge in RWA Trading,</span>
            <span className="block">Forged on Solana.</span>
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Left side - image/visual */}
              <div className="md:w-1/2 bg-gradient-radial from-hakata-light-purple/20 to-hakata-blue/5 flex items-center justify-center p-8">
                <div className="relative w-full max-w-sm">
                  {/* Main circle with icon */}
                  <div className="w-40 h-40 mx-auto rounded-full bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center border-4 border-hakata-light-purple/30">
                    <div className="text-hakata-light-purple text-5xl font-bold">
                      RWA
                    </div>
                  </div>
                  
                  {/* Connected nodes */}
                  <div className="absolute top-0 left-1/4 w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold">$AAPL</span>
                  </div>
                  
                  <div className="absolute bottom-0 right-1/4 w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold">FX</span>
                  </div>
                  
                  <div className="absolute top-1/4 right-0 w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold">INDICES</span>
                  </div>
                  
                  <div className="absolute bottom-1/4 left-0 w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold">SOLANA</span>
                  </div>
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    <line x1="100" y1="100" x2="60" y2="40" stroke="rgba(134, 104, 252, 0.5)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="160" y2="140" stroke="rgba(134, 104, 252, 0.5)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="160" y2="60" stroke="rgba(134, 104, 252, 0.5)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="40" y2="140" stroke="rgba(134, 104, 252, 0.5)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              
              {/* Right side - text content */}
              <div className="md:w-1/2 p-8 flex items-center">
                <div>
                  <p className="paragraph mb-4">
                    Ditch the delays and limitations of traditional brokers. Hakata grants you instant, transparent access to global assets—starting with U.S. stocks and expanding to FX, indices, and more—directly on Solana.
                  </p>
                  <p className="paragraph mb-6">
                    Experience the future of finance, today.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-hakata-light-purple/10 dark:bg-hakata-light-purple/20 text-hakata-purple dark:text-hakata-light-purple rounded-full text-sm font-medium">
                      Instant Settlement
                    </div>
                    <div className="px-4 py-2 bg-hakata-light-purple/10 dark:bg-hakata-light-purple/20 text-hakata-purple dark:text-hakata-light-purple rounded-full text-sm font-medium">
                      Up to 50x Leverage
                    </div>
                    <div className="px-4 py-2 bg-hakata-light-purple/10 dark:bg-hakata-light-purple/20 text-hakata-purple dark:text-hakata-light-purple rounded-full text-sm font-medium">
                      Self-Custody
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

export default ValueProposition;
