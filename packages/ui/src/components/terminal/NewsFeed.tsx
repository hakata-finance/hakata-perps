
import { useEffect, useState } from 'react';
import { Tabs } from "@/components/ui/tabs";
import NewsFilters from './NewsFilters';
import NewsContainer from './NewsContainer';
import { useNewsFiltering } from '@/hooks/useNewsFiltering';
import { NewsItemProps } from './NewsItem';

interface TickerSentiment {
  ticker: string;
  // TODO: Filter by relevance score
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
}

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  source: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
}

const mapSentimentToLabel = (label: string): 'positive' | 'neutral' | 'negative' => {
  if (label.toLowerCase().includes('bullish')) return 'positive';
  if (label.toLowerCase().includes('bearish')) return 'negative';
  return 'neutral';
};

const mapNewsToProps = (item: NewsItem): NewsItemProps => ({
  title: item.title,
  timestamp: new Date(item.time_published).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: item.source,
  sentiment: mapSentimentToLabel(item.overall_sentiment_label),
  // TODO: Add impact
  // impact: 'high',
  url: item.url,
});


const NewsFeed = () => {
  const [news, setNews] = useState<NewsItemProps[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetch('/api/news/all')
      .then(res => res.json())
      .then((data: NewsItem[]) => {
        const transformed = data.map(mapNewsToProps);
        setNews(transformed);
      });
  }, []);

  const filteredNews = useNewsFiltering(news, activeTab);
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <NewsFilters activeTab={activeTab} />
      </Tabs>
      <NewsContainer news={filteredNews} />
    </div>
  );
};

export default NewsFeed;
