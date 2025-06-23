import { useEffect, useState, useCallback } from 'react';

/**
 * Volatility analysis result interface
 */
interface VolatilityData {
  /** Volatility score normalized to 0-100 scale */
  score: number | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * API response interface for volatility data
 */
interface VolatilityApiResponse {
  volatility?: number;
  symbol?: string;
  timestamp?: string;
}

/**
 * Custom hook for fetching and calculating volatility scores for financial symbols
 * 
 * @param symbol - The financial symbol to analyze volatility for (default: 'AAPL')
 * @param refreshInterval - Optional refresh interval in milliseconds
 * @param maxVolatility - Maximum volatility threshold for normalization (default: 0.8 = 80%)
 * @returns Object containing volatility score, loading state, and error
 * 
 * @example
 * ```tsx
 * const { score, loading, error } = useVolatilityScore('AAPL');
 * const { score: btcScore } = useVolatilityScore('BTC', 30000); // Auto-refresh every 30 seconds
 * ```
 */
export const useVolatilityScore = (
  symbol: string = 'AAPL',
  refreshInterval?: number,
  maxVolatility: number = 0.8
): VolatilityData => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeVolatility = useCallback((volatility: number, maxVol: number): number => {
    // Normalize annualized volatility to 0-100 scale
    const normalized = (volatility / maxVol) * 100;
    return Math.min(Math.round(normalized), 100);
  }, []);

  const fetchVolatility = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/volatility?symbol=${encodeURIComponent(symbol)}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch volatility data: ${res.status} ${res.statusText}`);
      }

      const data: VolatilityApiResponse = await res.json();

      if (typeof data.volatility !== 'number') {
        setScore(0);
      } else {
        const normalizedScore = normalizeVolatility(data.volatility, maxVolatility);
        setScore(normalizedScore);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Failed to fetch volatility for ${symbol}`;
      console.error('Volatility fetch error:', err);
      setError(errorMessage);
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, maxVolatility, normalizeVolatility]);

  useEffect(() => {
    fetchVolatility();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchVolatility, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchVolatility, refreshInterval]);

  return { score, loading, error };
};
