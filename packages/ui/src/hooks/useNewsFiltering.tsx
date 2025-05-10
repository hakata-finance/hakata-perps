
import { useMemo } from 'react';
import { NewsItemProps } from '../components/terminal/NewsItem';

export const useNewsFiltering = (allNews: NewsItemProps[], activeTab: string) => {
  const filteredNews = useMemo(() => {
    switch(activeTab) {
      case 'high':
        return allNews.filter(news => news.impact === 'high');
      case 'bullish':
        return allNews.filter(news => news.sentiment === 'positive');
      case 'bearish':
        return allNews.filter(news => news.sentiment === 'negative');
      default:
        return allNews;
    }
  }, [allNews, activeTab]);

  return filteredNews;
};
