
import React from 'react';
import { X, FolderGit, MessageSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 pb-6">
      <div className="container-tight">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Navigation */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-hakata-light-purple transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-hakata-light-purple transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-hakata-light-purple transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-hakata-light-purple transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Column 2 - Social Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-hakata-light-purple transition-colors">
                <X size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-hakata-light-purple transition-colors">
                <MessageSquare size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-hakata-light-purple transition-colors">
                <FolderGit size={20} />
              </a>
            </div>
            <div className="mt-4">
              <a href="#" className="inline-block px-4 py-2 bg-hakata-purple text-white rounded-md hover:bg-hakata-light-purple transition-colors">
                Join Discord
              </a>
            </div>
          </div>
          
          {/* Column 3 - Disclaimer */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <p className="text-sm mb-2">
              © Hakata Finance {currentYear}. All Rights Reserved.
            </p>
            <p className="text-sm mb-2">
              Hakata Finance is a proud participant in the Solana Colosseum Breakout Hackathon.
            </p>
            <p className="text-sm">
              This is a devnet showcase. Trading involves risk.
            </p>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm">
          <p>Built with ❤️ for the Solana ecosystem</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
