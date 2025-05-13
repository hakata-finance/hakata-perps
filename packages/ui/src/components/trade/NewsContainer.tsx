
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import NewsItem, { NewsItemProps } from './NewsItem';

interface NewsContainerProps {
  news: NewsItemProps[];
}

const NewsContainer = ({ news }: NewsContainerProps) => {
  return (
    <ScrollArea className="flex-grow mt-2">
      <div className="space-y-2 pr-2">
        {news.length > 0 ? (
          news.map((newsItem, index) => (
            <NewsItem key={index} {...newsItem} />
          ))
        ) : (
          <div className="p-3 text-center text-gray-400">No news items to display</div>
        )}
      </div>
    </ScrollArea>
  );
};

export default NewsContainer;
