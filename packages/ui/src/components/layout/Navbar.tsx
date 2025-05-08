
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
      <div className="container-tight flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="#" className="flex items-center space-x-2">
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-hakata-purple to-hakata-light-purple">
              HAKATA
            </span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-hakata-light-purple transition-colors">
            Platform
          </a>
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-hakata-light-purple transition-colors">
            Products
          </a>
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-hakata-light-purple transition-colors">
            AI Insights
          </a>
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-hakata-light-purple transition-colors">
            Documentation
          </a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button className="bg-hakata-light-purple hover:bg-hakata-purple text-white">
            Join Waitlist
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="text-gray-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="px-4 pt-2 pb-5 space-y-4 bg-gray-900">
          <a href="#" className="block py-2 text-sm font-medium text-gray-300 hover:text-hakata-light-purple">
            Platform
          </a>
          <a href="#" className="block py-2 text-sm font-medium text-gray-300 hover:text-hakata-light-purple">
            Products
          </a>
          <a href="#" className="block py-2 text-sm font-medium text-gray-300 hover:text-hakata-light-purple">
            AI Insights
          </a>
          <a href="#" className="block py-2 text-sm font-medium text-gray-300 hover:text-hakata-light-purple">
            Documentation
          </a>
          <Button className="w-full bg-hakata-light-purple hover:bg-hakata-purple text-white">
            Join Waitlist
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
