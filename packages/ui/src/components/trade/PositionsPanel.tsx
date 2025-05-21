
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PositionsPanel = () => {
  const [activeTab, setActiveTab] = useState<string>("positions");

  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900">
          <TabsTrigger value="positions" className="data-[state=active]:bg-gray-800">Positions</TabsTrigger>
          {/* <TabsTrigger value="orders" className="data-[state=active]:bg-gray-800">Orders</TabsTrigger> */}
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">History</TabsTrigger>
        </TabsList>
        <TabsContent value="positions" className="py-4">
          <div className="text-gray-400">No open positions</div>
        </TabsContent>
        {/* <TabsContent value="orders" className="py-4 text-gray-400">No orders</TabsContent> */}
        <TabsContent value="history" className="py-4 text-gray-400">No history</TabsContent>
      </Tabs>
    </div>
  );
};

export default PositionsPanel;
