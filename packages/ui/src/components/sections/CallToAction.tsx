
import React from 'react';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="section-padding hero-gradient text-white">
      <div className="container-tight">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-lg mb-6 text-white">
            Stop Waiting. Start Trading RWAs the Solana Way.
          </h2>
          <p className="text-white/90 text-lg mb-8">
            The future of decentralized RWA trading is here. Secure your spot and be part of the revolution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-hakata-purple hover:bg-gray-100 px-8 py-6 text-lg">
              Join Waitlist
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background Graphics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-hakata-light-purple/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default CallToAction;
