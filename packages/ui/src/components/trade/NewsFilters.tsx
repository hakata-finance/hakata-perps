
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewsFiltersProps {
  activeTab: string;
}

const NewsFilters = ({ activeTab }: NewsFiltersProps) => {
  return (
    <TabsList className="bg-gray-900 w-full justify-start">
      <TabsTrigger value="all" className="data-[state=active]:bg-gray-800">All</TabsTrigger>
      <TabsTrigger value="bullish" className="data-[state=active]:bg-gray-800">Bullish</TabsTrigger>
      <TabsTrigger value="bearish" className="data-[state=active]:bg-gray-800">Bearish</TabsTrigger>
    </TabsList>
  );
};

export default NewsFilters;
