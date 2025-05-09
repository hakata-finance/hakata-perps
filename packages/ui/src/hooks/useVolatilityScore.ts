import { useEffect, useState } from 'react';

export const useVolatilityScore = (symbol: string = 'AAPL') => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVolatility = async () => {
      try {
        const res = await fetch(`/api/volatility?symbol=${symbol}`);
        const data = await res.json();

        if (!data.volatility) {
          setScore(0);
        } else {
          // Normalize to 0–100 scale — tune this logic based on your market scope
          const annualizedVol = data.volatility; // from API (standard deviation * sqrt(252))
          const normalized = Math.min(Math.round((annualizedVol / 0.8) * 100), 100); // assume 80% is extreme vol
          setScore(normalized);
        }
      } catch (err) {
        console.error('Volatility fetch failed:', err);
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchVolatility();
  }, [symbol]);

  return { score, loading };
};
