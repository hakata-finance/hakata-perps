import LiquidProvideForm from "@/components/vault/LiquidProvideForm";
import PoolStats from "@/components/vault/PoolStats";
import TitleHeader from "@/components/vault/TitleHeader";
import SinglePoolTokens from "@/components/vault/SinglePoolTokens";

const VaultPage = () => (
  <div className="h-[calc(100vh-73px)] bg-black text-white">
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
      {/* Main Chart Area - 3/4 width on large screens */}
      <div className="lg:col-span-3 space-y-4">
        <TitleHeader iconClassName="w-10 h-10" />
        <PoolStats />
        <SinglePoolTokens />
      </div>
      {/* Order Panel - 1/4 width on large screens */}
      <div className="lg:col-span-1">
        {/* Liquid Provide Form */}
        <LiquidProvideForm />
      </div>
    </div>
  </div>
);

export default VaultPage; 