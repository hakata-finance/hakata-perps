import { useEffect, useState, useCallback } from 'react';

/**
 * Sentiment analysis result interface
 */
interface SentimentData {
  /** Median sentiment score (0-100) */
  score: number | null;
  /** Confidence percentage based on number of mentions */
  confidence: number | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Raw ticker sentiment data from API
 */
interface TickerSentiment {
  ticker: string;
  ticker_sentiment_score: string;
  relevance_score: string;
}

/**
 * Raw news item from API
 */
interface NewsItem {
  ticker_sentiment?: TickerSentiment[];
}

/**
 * Custom hook for fetching and calculating sentiment scores for financial symbols
 * 
 * @param symbol - The financial symbol to analyze sentiment for (default: 'AAPL')
 * @param refreshInterval - Optional refresh interval in milliseconds
 * @returns Object containing sentiment score, confidence, loading state, and error
 * 
 * @example
 * ```tsx
 * const { score, confidence, loading, error } = useSentimentScore('AAPL');
 * ```
 */
export const useSentimentScore = (
  symbol: string = 'AAPL', 
  refreshInterval?: number
): SentimentData => {
  const [score, setScore] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSentiment = useCallback((scores: number[]): number => {
    if (scores.length === 0) return 0;
    
    scores.sort((a, b) => a - b);
    const mid = Math.floor(scores.length / 2);
    
    return scores.length % 2 !== 0
      ? scores[mid]
      : (scores[mid - 1] + scores[mid]) / 2;
  }, []);

  const fetchSentiment = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/news/all');
      
      if (!res.ok) {
        throw new Error(`Failed to fetch sentiment data: ${res.status} ${res.statusText}`);
      }
      
      const data: NewsItem[] = await res.json();

      const symbolScores: number[] = [];
      let symbolMentions = 0;

      data.forEach((item) => {
        const symbolSentiment = item.ticker_sentiment?.find(
          (t) => t.ticker === symbol.toUpperCase()
        );
        
        if (symbolSentiment) {
          symbolMentions += 1;
          const sentimentScore = parseFloat(symbolSentiment.ticker_sentiment_score);
          
          if (!isNaN(sentimentScore)) {
            // Convert from -1 to 1 scale to 0-100 scale
            symbolScores.push((sentimentScore + 1) * 50);
          }
        }
      });

      if (symbolScores.length === 0) {
        setScore(0);
        setConfidence(0);
      } else {
        const medianScore = calculateSentiment(symbolScores);
        const confidencePercentage = Math.round((symbolMentions / data.length) * 100);

        setScore(Math.round(medianScore));
        setConfidence(confidencePercentage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${symbol} sentiment`;
      console.error('Sentiment fetch error:', err);
      setError(errorMessage);
      setScore(null);
      setConfidence(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, calculateSentiment]);

  useEffect(() => {
    fetchSentiment();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchSentiment, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSentiment, refreshInterval]);

  return { score, confidence, loading, error };
};

/**
 * @deprecated Use useSentimentScore instead
 * Legacy hook for AAPL sentiment - maintained for backward compatibility
 */
export const useAaplSentimentScore = () => {
  return useSentimentScore('AAPL');
};
