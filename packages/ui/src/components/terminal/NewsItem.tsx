
import React from 'react';
import { ExternalLink, ArrowUp, ArrowDown, Clock } from 'lucide-react';

export interface NewsItemProps {
  title: string;
  timestamp: string;
  source: string;
  // TODO: Add impact
  // impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  url?: string;
}

const NewsItem = ({ title, timestamp, source, sentiment, url }: NewsItemProps) => {
  return (
    <div className="p-3 border border-gray-800 rounded-md bg-black/40 hover:bg-gray-900/40 transition-colors">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium mb-1 pr-2">{title}</h4>
        {sentiment === 'positive' && <ArrowUp size={16} className="text-green-400 shrink-0" />}
        {sentiment === 'negative' && <ArrowDown size={16} className="text-red-400 shrink-0" />}
        {sentiment === 'neutral' && <div className="w-4 h-0.5 bg-gray-400 shrink-0 self-center" />}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{timestamp}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>{source}</span>
          {/* <div className={cn(
            "px-1.5 py-0.5 rounded text-[10px]",
            impact === 'high' ? "bg-red-900/40 text-red-300" :
            impact === 'medium' ? "bg-yellow-900/40 text-yellow-300" :
            "bg-blue-900/40 text-blue-300"
          )}>
            {impact.toUpperCase()}
          </div> */}
          
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsItem;
