import { useEffect, useState } from 'react';

// TODO: Add dynamic symbol
export const useAaplSentimentScore = () => {
  const [score, setScore] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await fetch('/api/news/all');
        const data = await res.json();

        const aaplScores: number[] = [];
        let aaplMentions = 0;

        data.forEach((item: any) => {
          const aaplSentiment = item.ticker_sentiment?.find((t: any) => t.ticker === 'AAPL');
          if (aaplSentiment) {
            aaplMentions += 1;
            const score = parseFloat(aaplSentiment.ticker_sentiment_score);
            if (!isNaN(score)) aaplScores.push(score * 100); // convert from 0-1 to 0-100 scale
          }
        });

        if (aaplScores.length === 0) {
          setScore(0);
          setConfidence(0);
        } else {
          aaplScores.sort((a, b) => a - b);
          const mid = Math.floor(aaplScores.length / 2);
          const median =
            aaplScores.length % 2 !== 0
              ? aaplScores[mid]
              : (aaplScores[mid - 1] + aaplScores[mid]) / 2;

          const conf = Math.round((aaplMentions / data.length) * 100);

          setScore(median);
          setConfidence(conf);
        }
      } catch (error) {
        console.error('Failed to fetch AAPL sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  return { score, confidence, loading };
};
