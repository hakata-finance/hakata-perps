import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, AlertCircle } from "lucide-react";
import { useVolatilityScore } from '@/hooks/useVolatilityScore';

/**
 * Volatility level classification with corresponding display properties
 */
interface VolatilityLevel {
  label: string;
  color: string;
  iconColor: string;
}

/**
 * Props for the VolatilityScore component
 */
interface VolatilityScoreProps {
  /** The financial symbol to display volatility for (default: 'AAPL') */
  symbol?: string;
  /** Custom className for styling */
  className?: string;
  /** Size of the icons (default: 14) */
  iconSize?: number;
  /** Custom thresholds for volatility levels */
  thresholds?: {
    low: number;
    moderate: number;
  };
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
}

/**
 * VolatilityScore component
 * 
 * Displays the market volatility score for a given financial symbol with visual indicators.
 * Shows volatility classification (Low/Moderate/High) based on configurable thresholds.
 * 
 * @param {VolatilityScoreProps} props - Component props
 * @returns {JSX.Element} Rendered volatility score component
 * 
 * @example
 * ```tsx
 * <VolatilityScore symbol="AAPL" />
 * <VolatilityScore symbol="BTC" thresholds={{ low: 20, moderate: 60 }} />
 * ```
 */
const VolatilityScore: React.FC<VolatilityScoreProps> = React.memo(({
  symbol = 'AAPL',
  className = '',
  iconSize = 14,
  thresholds = { low: 30, moderate: 70 },
  refreshInterval
}) => {
  const { score, loading, error } = useVolatilityScore(symbol, refreshInterval);

  /**
   * Determines volatility level classification based on score and thresholds
   */
  const getVolatilityLevel = React.useCallback((volatilityScore: number): VolatilityLevel => {
    if (volatilityScore < thresholds.low) {
      return { 
        label: 'Low', 
        color: 'bg-green-500/20 text-green-400',
        iconColor: 'text-green-400'
      };
    }
    
    if (volatilityScore < thresholds.moderate) {
      return { 
        label: 'Moderate', 
        color: 'bg-orange-500/20 text-orange-400',
        iconColor: 'text-orange-400'
      };
    }
    
    return { 
      label: 'High', 
      color: 'bg-red-500/20 text-red-400',
      iconColor: 'text-red-400'
    };
  }, [thresholds]);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm text-gray-500">Loading volatility...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help text-red-400">
              <AlertCircle size={iconSize} />
              <span className="text-sm">Volatility Error</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Failed to load volatility data</p>
            <p className="text-xs mt-1 text-red-300">{error}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // No data state
  if (score === null) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-500">No volatility data</span>
      </div>
    );
  }

  const volatility = getVolatilityLevel(score);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <Activity size={iconSize} className={volatility.iconColor} />
            <span className="text-sm">Volatility</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Market volatility indicator for {symbol.toUpperCase()} based on price movements and trading volume
          </p>
          <p className="text-xs mt-1">
            Thresholds: Low &lt;{thresholds.low}%, Moderate &lt;{thresholds.moderate}%, High ≥{thresholds.moderate}%
          </p>
        </TooltipContent>
      </Tooltip>
      <Badge className={`${volatility.color} ml-1 text-xs`}>
        {volatility.label} ({score}%)
      </Badge>
    </div>
  );
});

VolatilityScore.displayName = 'VolatilityScore';

export default VolatilityScore;
