
import { Bell } from 'lucide-react';

const HighImpactNews = () => {  
  return (
    <>
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Bell size={14} className="mr-2" />
        High Impact News
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {/* {news.map((item, index) => (
          <div key={index} className="p-2 border border-gray-800 rounded bg-black/40">
            <div className="text-xs text-[#C8FF00] mb-1">POSITIVE</div>
          <p className="text-xs">SOL Reports Strong Q2 Earnings, Beats Expectations</p>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>10:30 AM</span>
              <span>Bloomberg</span>
            </div>
          </div>
        ))} */}

          {/* <div className="p-2 border border-gray-800 rounded bg-black/40">
            <div className="text-xs text-[#C8FF00] mb-1">Impact: Low</div>
            <p className="text-xs">5-Year JGB Auction</p>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>10:30 AM</span>
              <span>JP</span>
            </div>
          </div> */}

          <p>Coming soon</p>
        </div>
    </>
  );
};

export default HighImpactNews;
