
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface BreakingNewsProps {
  message: string;
  visible: boolean;
}

const BreakingNewsBanner = ({ message, visible }: BreakingNewsProps) => {
  const [isVisible, setIsVisible] = useState(visible);
  
  useEffect(() => {
    setIsVisible(visible);
    
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Hide after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-red-900/80 border border-red-700 text-white px-4 py-2 flex items-center justify-between animate-fade-in">
      <div className="flex items-center">
        <Bell size={16} className="mr-2 animate-pulse" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-white/70 hover:text-white ml-2"
      >
        ✕
      </button>
    </div>
  );
};

export default BreakingNewsBanner;
