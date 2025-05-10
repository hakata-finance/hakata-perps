'use client';

import { BN } from "@coral-xyz/anchor";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { CLUSTER, DEFAULT_POOL } from "@/lib/constants";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolConfig } from "@/lib/PoolConfig";
import { usePythPrices } from "./usePythPrices";

export interface ViewPoolData {
  oiLong : BN,
  oiShort : BN,
  poolStats : {
    totalVolume : BN,
    totalFees : BN,
    currentLongPositionsUsd : BN,
    currentShortPositionsUsd : BN,
  },
  custodyDetails : {
    symbol: string,
    price: BN,
    targetWeight: BN,
    currentWeight: BN,
    utilization: string,
    assetsAmountUi : string,
    totalUsdAmountUi : string,
  }[],
  lpStats : {
    lpTokenSupply : BN,
    decimals : number,
    totalPoolValue : BN,
    price : BN,
    stableCoinPercentage : BN,
    marketCap : BN,
    // totalStaked : BN,
  },
}
const ZERO_BN = new BN(0);
export const defaultData : ViewPoolData = {
  oiLong : ZERO_BN,
  oiShort : ZERO_BN,
  poolStats : {
    totalVolume : ZERO_BN,
    totalFees : ZERO_BN,
    currentLongPositionsUsd : ZERO_BN,
    currentShortPositionsUsd : ZERO_BN,
  },
  custodyDetails : [{
    symbol: '',
    price: ZERO_BN,
    targetWeight: ZERO_BN,
    currentWeight: ZERO_BN,
    utilization: '0',
    assetsAmountUi : '0',
    totalUsdAmountUi : '0'
  }],
  lpStats : {
    lpTokenSupply : ZERO_BN,
    decimals : 0,
    totalPoolValue : ZERO_BN,
    price : ZERO_BN,
    stableCoinPercentage : ZERO_BN,
    marketCap : ZERO_BN,
    // totalStaked : BN,
  },
} 

export function usePoolData() {

  // const [timer, setTimer] = useState(0);

  const custodies = useGlobalStore(state => state.custodies);
  const pool = useGlobalStore(state => state.pool);
  const lpMintData = useGlobalStore(state => state.lpMintData);

  const {prices} = usePythPrices();

  const [poolData, setPoolData] = useState<ViewPoolData>(defaultData)


  const getPoolData = () => {
    const poolConfig = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
    if(!pool || !lpMintData || !prices.size || !custodies) {
      return ;
    }
    // const pool = new PoolAccount(poolConfig, poolData, lpMintData, Array.from([custodies.keys(), custodies.values()]).map(t => CustodyAccount.from(new PublicKey(t), {...(custodies.get(t))}))
    const poolAccount = new PoolAccount(
      poolConfig, 
      pool, 
      lpMintData,
      Array.from(custodies, ([key, value]) => CustodyAccount.from(new PublicKey(key), {...value}))
    )
    // console.log("prices:",prices)
    const lpStats = poolAccount.getLpStats(prices);
    const custodyDetails = poolAccount.getCustodyDetails(prices);
    const r : ViewPoolData =  {
      oiLong: poolAccount.getOiLongUI(),
      oiShort: poolAccount.getOiShortUI(),
      poolStats: poolAccount.getPoolStats(),
      lpStats : lpStats,
      custodyDetails: custodyDetails,
    }
    // console.log("usePooldata:",r)
    setPoolData(r);
  }


  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTimer(Date.now())
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    getPoolData();
      // console.log(" getPoolData called on change")

    // const interval = setInterval(() => {
    //   console.log(" getPoolData timer again")
    //   getPoolData()
    //   }, 30000);
    //   return () => clearInterval(interval);
  }, [custodies, prices])

  // return useMemo(() => {

  //   if (custodies) {
  //     return  getPoolData();
  //   } else {
  //     return defaultData;
  //   }

  // }, [custodies, timer , prices])

  return poolData;

}
