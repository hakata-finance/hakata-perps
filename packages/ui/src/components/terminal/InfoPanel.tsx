import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NewsFeed from './NewsFeed';
import HighImpactNews from './HighImpactNews';

const InfoPanel = () => {
  const [activeTab, setActiveTab] = useState<string>("news");

  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 mb-3 w-full">
          <TabsTrigger value="news" className="data-[state=active]:bg-gray-800">
            Latest News
          </TabsTrigger>
          <TabsTrigger value="newsfeed" className="data-[state=active]:bg-gray-800">
            News Feed
          </TabsTrigger>
        </TabsList>
        
        {/* Latest News Tab */}
        <TabsContent value="news">
          <HighImpactNews />
        </TabsContent>
        
        {/* News Feed Tab */}
        <TabsContent value="newsfeed" className="h-[350px]">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoPanel;
