import LiquidProvideForm from "@/components/vault/LiquidProvideForm";
import PoolStats from "@/components/vault/PoolStats";
import TitleHeader from "@/components/vault/TitleHeader";

const VaultPage = () => (
  <div className="min-h-screen bg-black text-white">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
      {/* Main Chart Area - 3/4 width on large screens */}
      <div className="lg:col-span-3 space-y-4">
        <TitleHeader iconClassName="w-10 h-10" />
        <PoolStats />
      </div>
      {/* Order Panel - 1/4 width on large screens */}
      <div className="lg:col-span-1 space-y-4">
        {/* Liquid Provide Form */}
        <LiquidProvideForm />
      </div>
    </div>
  </div>
);

export default VaultPage; 