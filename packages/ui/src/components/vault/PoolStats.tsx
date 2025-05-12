'use client';
  
import { BN } from "@coral-xyz/anchor";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { PERCENTAGE_DECIMALS, PRICE_DECIMALS , USD_DECIMALS } from "@/lib/constants";
import { usePoolData } from "@/hooks/usePoolData";
import { useGlobalStore } from "@/stores/store";
import { toUiDecimals } from "@/lib/utils";

interface Props {
  className?: string;
}

export default function PoolStats(props: Props) {
  const stats = useDailyPriceStats();

  const poolData = usePoolData();

  const userLpTokensBalance = useGlobalStore( state => state.userLpTokensBalance);


  const [liquidityBalanceValueUsd, setLiquidityBalanceValueUsd] = useState('0');
  const [liquidityShare, setLiquidityShare] = useState('0');


   function getLiquidityBalanceValueUsd() {

    if(poolData.lpStats.lpTokenSupply.toString()=='0'){
      return;
    }

    // console.log("poolData.lpStats.totalPoolValue.toNumber():",poolData.lpStats.totalPoolValue.toString())
    const userShareInPool = userLpTokensBalance.mul(new BN(10**PERCENTAGE_DECIMALS)).div(poolData.lpStats.lpTokenSupply)
    setLiquidityShare(toUiDecimals(userShareInPool,PERCENTAGE_DECIMALS -2, 2));

    const userLiquidityAmtUSD = userShareInPool.mul(poolData.lpStats.totalPoolValue).div(new BN(10**PERCENTAGE_DECIMALS))
    // let userLiquidityAmtUSD = ((userLpTokensBalance / lpSupply.toNumber()) * poolData.lpStats.totalPoolValue.toNumber())/ 10**6;

    setLiquidityBalanceValueUsd(toUiDecimals(userLiquidityAmtUSD, PRICE_DECIMALS, 2, true));
  }


  useEffect(() => {
    if(userLpTokensBalance){
      getLiquidityBalanceValueUsd();
    }
   
  }, [userLpTokensBalance, poolData])
  

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div
        className={twMerge(
          "grid",
          "grid-cols-4",
          "gap-x-4",
          "gap-y-8",
          props.className
        )}
      >
        {[
          {
            label: "Liquidity",
            value: `$${ toUiDecimals(poolData.lpStats.totalPoolValue, 6, 2, true)}`,
          },
          {
            label: "Volume",
            value: `$${poolData.poolStats.totalVolume.toNumber().toLocaleString()}`,
          },
          {
            label: "OI Long",
            value: (
              <>
                {`$${poolData.oiLong.toNumber().toLocaleString()} `}
                <span className="text-zinc-500"> </span>
              </>
            ),
          },
          {
            label: "OI Short",
            value: `$${poolData.oiShort.toNumber().toLocaleString()}`,
          },
          {
            label: "Fees",
            value: `$${ toUiDecimals(poolData.poolStats.totalFees, USD_DECIMALS, 2, true)}`,

          },
          {
            label: "Your Liquidity Value",
            value: `$${liquidityBalanceValueUsd ?? '0'}`,
          },
          {
            label: "Your Share",
            value: `${liquidityShare ?? '0'}%`,
          },
        ].map(({ label, value }, i) => (
          <div
            className={twMerge("border-gray-800", "border-t", "pt-3")}
            key={i}
          >
            <div className="text-sm text-gray-400">{label}</div>
            <div className="text-sm text-white">{value}</div>
          </div>
        ))}
      </div>
    );
  }
}
