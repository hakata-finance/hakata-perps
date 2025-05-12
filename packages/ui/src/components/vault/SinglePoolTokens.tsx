'use client';

import { BN } from "@coral-xyz/anchor";
import { cloneElement, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useConnection } from "@solana/wallet-adapter-react";
import { getTokenEIcon, getTokenELabel, tokenAddressToTokenE , getTokenSymbol} from "@/lib/TokenUtils";
import { PERCENTAGE_DECIMALS, POOL_CONFIG } from "@/lib/constants";
import { usePoolData } from "@/hooks/usePoolData";
import { usePythPrices } from "@/hooks/usePythPrices";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { toUiDecimals } from "@/lib/utils";
import { useGlobalStore } from "@/stores/store";
import { ViewHelper } from "@/lib/ViewHelpers";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";

interface PoolFeeData {
  symbol : string,
  addAmount : BN,
  addFee : BN,
  removeAmount : BN,
  removeFee :BN,
}

export default function SinglePoolTokens() {
  const stats = useDailyPriceStats();
  const { prices } = usePythPrices();

  const poolData = usePoolData();
  const { connection } = useConnection();
  const provider = useAnchorProvider();

  const inputTokenAmtGlobal = useGlobalStore(state => state.inputTokenAmt);
  const inputLPTokenAmtGlobal = useGlobalStore(state => state.inputLPTokenAmt);

  const [poolFeesObj, setPoolFeesObj] = useState<PoolFeeData[]>([])

  useEffect(() => {
    (async () => {
      if(!inputTokenAmtGlobal || !inputLPTokenAmtGlobal) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poolFees: any = [];
      for (const token of POOL_CONFIG.tokens) {
        const viewHelper = new ViewHelper(connection, provider!);
        const positionTokenCustody = POOL_CONFIG.custodies.find(i => i.symbol=== token.symbol);
       
        console.log("positionTokenCustody :",positionTokenCustody?.symbol, positionTokenCustody, inputTokenAmtGlobal, inputLPTokenAmtGlobal )
        const addObj = await viewHelper.getAddLiquidityAmountAndFee(
          new BN(inputTokenAmtGlobal * 10**(positionTokenCustody?.decimals!)), 
          POOL_CONFIG.poolAddress, 
          positionTokenCustody?.custodyAccount!
        )
        console.log('addObj :>> ', addObj);

        const removeObj = await viewHelper.getRemoveLiquidityAmountAndFee(
          new BN(inputLPTokenAmtGlobal * 10**(positionTokenCustody?.decimals!)), 
          POOL_CONFIG.poolAddress, 
          positionTokenCustody?.custodyAccount!
        )
        console.log('removeObj :>> ', removeObj);

        const obj : PoolFeeData = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          symbol : positionTokenCustody?.symbol!,
          addAmount : addObj.amount,
          addFee : addObj.fee,
          removeAmount : removeObj.amount,
          removeFee : removeObj.fee
        }
        poolFees.push(obj);
      }
      setPoolFeesObj(poolFees)

    })()
  }, [inputTokenAmtGlobal, inputLPTokenAmtGlobal])
  

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div className="w-full">
        <div className="bg-[#121212] p-4 border border-gray-800 rounded-lg">
          <table className={twMerge("table-auto", "text-white", "w-full")}>
            <thead className={twMerge("text-xs", "text-zinc-500", "p-10")}>
              <tr className="text-gray-400">
                <td className="pb-5">Pool Tokens</td>
                <td className="pb-5">Deposit Fee</td>
                <td className="pb-5">Withdraw Fee</td>
                <td className="pb-5">Liquidity</td>
                <td className="pb-5">Price</td>
                <td className="pb-5">Amount</td>
                <td className="pb-5">Current/Target Weight</td>
                <td className="pb-5">Utilization</td>
                <td className="pb-5"></td>
              </tr>
            </thead>
            <tbody className={twMerge("text-xs")}>
              {POOL_CONFIG.custodies.map((custody, index) => {
                const token = tokenAddressToTokenE(custody.mintKey.toBase58());
                const icon = getTokenEIcon(token);
                return (
                  <tr key={custody.mintKey.toBase58()} className="border-t border-zinc-700">
                    <td className="pt-4">
                      <div className="flex flex-row items-center space-x-2">
                        {cloneElement(icon, {
                          className: "h-7 w-7",
                        })}
                        <div className="flex flex-col">
                          <p className="font-medium">
                            {tokenAddressToTokenE(custody.mintKey.toBase58())}
                          </p>
                          <p className={twMerge("text-xs", "text-zinc-500")}>
                            {getTokenELabel(token)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      {
                        poolFeesObj && poolFeesObj.length ? toUiDecimals(poolFeesObj[index]!.addFee, custody.decimals,4): 0
                      }
                    </td>
                    <td className="pt-4">
                      {
                        poolFeesObj && poolFeesObj.length ? toUiDecimals(poolFeesObj[index]!.removeFee, custody.decimals,4) : 0
                      }
                    </td>
                    <td className="pt-4">
                      ${
                        poolData.custodyDetails.find(i => i.symbol== getTokenSymbol(token))?.totalUsdAmountUi ?? 0
                      }
                    </td>
                    <td className="pt-4">${prices.get(token)?.toFixed(2)}</td>
                    <td className="pt-4">
                      {
                        poolData.custodyDetails.find(i => i.symbol== getTokenSymbol(token))?.assetsAmountUi ?? 0
                      }
                    </td>
                    <td className="pt-4">
                    { toUiDecimals(poolData.custodyDetails.find(i => i.symbol== getTokenSymbol(token))?.currentWeight ?? 0, PERCENTAGE_DECIMALS -2 , 2) ?? 0 }%
                      {" "}/{" "}
                    { toUiDecimals(poolData.custodyDetails.find(i => i.symbol== getTokenSymbol(token))?.targetWeight ?? 0, PERCENTAGE_DECIMALS -2 , 2 ) ?? 0 }%
                    </td>
                    <td className="pt-4">
                      {
                        poolData.custodyDetails.find(i => i.symbol == getTokenSymbol(token))?.utilization.toString() ?? 0
                      }%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
