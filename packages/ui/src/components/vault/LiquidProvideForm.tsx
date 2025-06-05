'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { addLiquidity } from '@/actions/addLiquidity';
import { removeLiquidity } from '@/actions/removeLiquidity';
import { tokenAddressToTokenE } from '@/lib/TokenUtils';
import { POOL_CONFIG, PRICE_DECIMALS } from '@/lib/constants';
import { toUiDecimals } from '@/lib/utils';
import { useGlobalStore } from '@/stores/store';
import { fetchTokenBalance } from '@/lib/retrieveData';
import { useProgram } from '@/hooks/useProgram';
import { UsdcIconCircle } from './UsdcIconCircle';
import { usePythPrices } from '@/hooks/usePythPrices';
import { BN } from '@coral-xyz/anchor';
import { usePoolData } from '@/hooks/usePoolData';
import { useFirstTimeAirdrop } from '@/hooks/useFirstTimeAirdrop';
import { toast } from 'react-toastify';

enum Tab {
  Add,
  Remove,
}

const TOKEN_E_LIST = POOL_CONFIG.tokens.map((token) => {
  return tokenAddressToTokenE(token.mintKey.toBase58());
});

const LiquidProvideForm = () => {
  const perpetual_program = useProgram();
  const {prices} = usePythPrices();
  const poolData = usePoolData();
  const { wallet, publicKey, signTransaction, connected} = useWallet();
  const { connection } = useConnection();
  const { 
    hasAddedLiquidity, 
    hasRemovedLiquidity, 
    isAirdropping, 
    trackAddLiquidity, 
    trackRemoveLiquidity 
  } = useFirstTimeAirdrop();

  const [inputTokenAmount, setInputTokenAmount] = useState('');
  const [inputLpTokenAmount, setInputLpTokenAmount] = useState('');
  const [payToken] = useState(TOKEN_E_LIST[0]);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Add);
  const [isProcessing, setIsProcessing] = useState(false);

  const [payTokenBalance, setPayTokenBalance] = useState(0);
  const userLpTokensBalance = useGlobalStore(state => state.userLpTokensBalance);
  
  const setInputTokenAmtGlobal = useGlobalStore(state => state.setInputTokenAmt);
  const setInputLPTokenAmtGlobal = useGlobalStore(state => state.setInputLPTokenAmt);

  async function changeLiquidity() {
    console.log("before change", activeTab === Tab.Remove, inputLpTokenAmount);
    
    // Prevent multiple simultaneous processing
    if (isProcessing || isAirdropping) return;
    
    setIsProcessing(true);
    
    try {
      const slippage = 10;

      // Add Liquidity flow
      if (activeTab === Tab.Add) {
        await addLiquidity(
          perpetual_program,
          wallet!,
          publicKey!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signTransaction as any,
          connection,
          payToken!,
          parseFloat(inputTokenAmount),
          parseFloat(inputLpTokenAmount),
          slippage
        );
        
        // Check if this is the first time adding liquidity and airdrop cXP if so
        if (!hasAddedLiquidity) {
          await trackAddLiquidity();
        }
      } 
      // Remove Liquidity flow
      else {
        await removeLiquidity(
          perpetual_program,
          wallet!,
          publicKey!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signTransaction as any,
          connection,
          payToken!,
          parseFloat(inputLpTokenAmount),
          parseFloat(inputTokenAmount),
          slippage
        );
        
        // Check if this is the first time removing liquidity and airdrop cXP if so
        if (!hasRemovedLiquidity) {
          await trackRemoveLiquidity();
        }
      }
      
      // Show success message
      toast.success(activeTab === Tab.Add ? 'Successfully added liquidity!' : 'Successfully removed liquidity!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error in liquidity operation:", error);
      toast.error(activeTab === Tab.Add ? 'Failed to add liquidity' : 'Failed to remove liquidity', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleAddLiqUpdate = (inputTokenAmount: string) => {
    if (!payToken || !prices.get(payToken!)) {
      console.log("no paytoken price", payToken, prices.get(payToken!))
      return;
    }

    setInputTokenAmount(inputTokenAmount);

    // Convert string input to number for comparison and setting global state
    const numericAmount = parseFloat(inputTokenAmount);
    if(isNaN(numericAmount) || numericAmount < 1){
      // Set a minimum value of 1 if input is invalid or less than 1
      setInputTokenAmtGlobal(1);
    } else {
      // Set the parsed numeric value to maintain proper type
      setInputTokenAmtGlobal(numericAmount);
    }
    // console.log("price", payToken,prices.get(payToken!) )

    const payTokenPriceBN = new BN(prices.get(payToken!)! * 10 ** PRICE_DECIMALS); // already handled above

    const poolAumUsd = poolData.lpStats.totalPoolValue;
    const lpTokenSupply = poolData.lpStats.lpTokenSupply;
    if (poolAumUsd.toString() !== '0' && lpTokenSupply.toString() !== '0') {
      // Convert inputTokenAmount to BN to avoid type error in arithmetic operation
      // Use the token's decimals for proper scaling
      const inputAmountBN = new BN(parseFloat(inputTokenAmount) * 10 ** 6);
      const depositUsd = inputAmountBN.mul(payTokenPriceBN).div(new BN(10 ** 6));
      // console.log("depositUsd:",depositUsd.toString(), inputTokenAmount, payTokenPriceBN.toString())
      const shareBN = depositUsd.mul(new BN(10 ** 6)).div(poolAumUsd);
      // console.log("shareBN:",shareBN.toNumber())

      const userLPtokensRecieveBN = lpTokenSupply.mul(shareBN).div(new BN(10 ** 6)); // div share decimals
      const useLPTokenUi = toUiDecimals(userLPtokensRecieveBN, POOL_CONFIG.lpDecimals, 4);
      // console.log("useLPTokenUi:",useLPTokenUi)
      setInputLpTokenAmount(useLPTokenUi)
    }
  }

  const handleRemoveLiqUpdate = (inputLPTokenAmount: string) => {
    if (!payToken || !prices.get(payToken!)) {
      console.log("no paytoken price", payToken, prices.get(payToken!))
      return;
    }

    setInputLpTokenAmount(inputLPTokenAmount);

    // Convert string input to number for comparison and setting global state
    const numericAmount = parseFloat(inputLPTokenAmount);
    if(isNaN(numericAmount) || numericAmount < 1){
      // Set a minimum value of 1 if input is invalid or less than 1
      setInputTokenAmtGlobal(1);
    } else {
      // Set the parsed numeric value to maintain proper type
      setInputTokenAmtGlobal(numericAmount);
    }

    const payTokenCustody = POOL_CONFIG.custodies.find(i => i.symbol=== payToken);

    if(!payTokenCustody) {
      throw "payTokenCustody not found";
    }

    const payTokenPriceBN = new BN(prices.get(payToken!)! * 10 ** PRICE_DECIMALS); // already handled above
    const poolAumUsd = poolData.lpStats.totalPoolValue;
    const lpTokenSupply = poolData.lpStats.lpTokenSupply;

    if (poolAumUsd.toString() !== '0' && lpTokenSupply.toString() !== '0') {
      const lpTokenPrice = poolAumUsd.div(lpTokenSupply);
      console.log("lpTokenPrice:", lpTokenPrice.toString())
      // Convert inputLPTokenAmount to BN to avoid type error in arithmetic operation
      // Use the LP token decimals for proper scaling
      const inputLPAmountBN = new BN(parseFloat(inputLPTokenAmount) * 10 ** POOL_CONFIG.lpDecimals);
      const depositUsd = inputLPAmountBN.mul(lpTokenPrice).div(new BN(10 ** POOL_CONFIG.lpDecimals));
      console.log("depositUsd:", depositUsd.toString(), inputLPTokenAmount, payTokenPriceBN.toString())
      // const shareBN = depositUsd.mul(new BN(10 ** 6)).div(poolAumUsd);
      // console.log("shareBN:",shareBN.toNumber())

      const usertokensRecieveBN = depositUsd.mul(new BN(10 ** payTokenCustody.decimals)).div(payTokenPriceBN); // div share decimals
      const useTokenUi = toUiDecimals(usertokensRecieveBN, payTokenCustody.decimals, 4);
      // console.log("useLPTokenUi:",useLPTokenUi)
      setInputTokenAmount(useTokenUi)
    } else {
      console.error("error  lpTokenSupply zero ", lpTokenSupply.toString());
    }
  }

  useEffect(() => {
    async function fetchData() {
      const tokenBalance = await fetchTokenBalance(
        payToken!,
        publicKey!,
        connection
      );
      setPayTokenBalance(tokenBalance);

      // TODO: Сreating LP POSITION FIRST TIME MAKE SURE TO SET IN STORE 
      // let lpBalance = await fetchLPBalance(
      //   POOL_CONFIG.lpTokenMint,
      //   publicKey!,
      //   connection
      // );
      // setUserLpTokenBalance(lpBalance);
    }

    if (publicKey && payToken) {
      fetchData();
    }
  }, [connection,payToken, publicKey]);
  
  return (
    <div className="rounded-lg bg-[#121212] p-4 border border-gray-800">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            className={`${activeTab === Tab.Add ? 'bg-[#18211D] text-[#C8FF00]' : 'border-gray-700 text-white'} hover:bg-[#213026]`}
            variant={activeTab === Tab.Add ? 'default' : 'outline'}
            onClick={() => setActiveTab(Tab.Add)}
          >
            Add
          </Button>
          <Button 
            className={`${activeTab === Tab.Remove ? 'bg-[#211818] text-[#FF6666]' : 'border-gray-700 text-white'} hover:bg-[#302121]`}
            variant={activeTab === Tab.Remove ? 'default' : 'outline'}
            onClick={() => setActiveTab(Tab.Remove)}
          >
            Remove
          </Button>
        </div>
        
        {/* First-time user bonus notification for liquidity operations */}
        {connected && activeTab === Tab.Add && !hasAddedLiquidity && (
          <div className="p-3 bg-[#1A1A1A] border border-emerald-800 rounded-lg">
            <p className="text-emerald-400 text-sm font-medium">
              First-time liquidity providers receive 1 cXP point as a bonus! 🎁
            </p>
          </div>
        )}
        
        {connected && activeTab === Tab.Remove && !hasRemovedLiquidity && (
          <div className="p-3 bg-[#1A1A1A] border border-emerald-800 rounded-lg">
            <p className="text-emerald-400 text-sm font-medium">
              First-time liquidity removal earns you 1 cXP point as a bonus! 🎁
            </p>
          </div>
        )}
        
        <div>
          <p className="mb-2 text-gray-400 flex justify-between">
            You {activeTab === Tab.Add ? 'Add' : 'Remove'}
            {connected && 
              activeTab === Tab.Add ? (
                <span>Balance: {payTokenBalance.toFixed(2)}</span>
              ) : (
                <span>Balance: {toUiDecimals(userLpTokensBalance, POOL_CONFIG.lpDecimals, 2)}</span>
              )
            }
          </p>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              {activeTab === Tab.Add ? (
                <Input 
                  type="text"
                  placeholder="0.00"
                  inputMode='decimal'
                  value={inputTokenAmount} 
                  onChange={(e) => {
                    handleAddLiqUpdate(e.currentTarget.value); // on changeing here set in setTokenAmt() hook
                  }}
                  className="bg-[#1E1E1E] border-gray-700"
                />
              ) : (
                <Input 
                  type="text"
                  placeholder="0.00"
                  inputMode='decimal'
                  value={inputLpTokenAmount} 
                  onChange={(e) => {
                    handleRemoveLiqUpdate(e.currentTarget.value); // on changeing here set in setTokenAmt() hook
                  }}
                  className="bg-[#1E1E1E] border-gray-700"
                />
              )}
            </div>
            {/* TODO: Add token icon */}
            {activeTab === Tab.Add ? (
              <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                <UsdcIconCircle className="h-5 w-5 mr-2" />
                <span>USDC</span>
              </div>
            ) : (
              <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
                <span>LP</span>
              </div>
            )}
          </div>
        </div>
        <div>
        <p className="mb-2 text-gray-400 flex justify-between">
            You Receive
            {connected && 
              activeTab === Tab.Add ? (
                <span>Balance: {toUiDecimals(userLpTokensBalance, POOL_CONFIG.lpDecimals, 2)}</span>
              ) : (
                <span>Balance: {payTokenBalance.toFixed(2)}</span>
              )
            }
          </p>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              { activeTab === Tab.Add ? (
                <Input 
                  placeholder="0.00"
                  value={inputTokenAmount} 
                  className="bg-[#1E1E1E] border-gray-700 pr-16"
                  disabled
                />
              ) : (
                <Input 
                  placeholder="0.00"
                  value={inputLpTokenAmount} 
                  className="bg-[#1E1E1E] border-gray-700 pr-16"
                  disabled
                />
              )}
            </div>
            <div className="flex items-center px-4 py-2 bg-[#1E1E1E] rounded-md">
              {activeTab === Tab.Add ? (
                <span>LP</span>
              ) : (
                <>
                  <UsdcIconCircle className="h-5 w-5 mr-2" />
                  <span>USDC</span>
                </>
              )}
            </div>
          </div>
        </div>
        {connected ? (
          <Button 
            onClick={changeLiquidity}
            disabled={isProcessing || isAirdropping}
            className={`w-full font-bold py-6 ${
            activeTab === Tab.Add 
              ? 'bg-[#C8FF00] hover:bg-[#BDFF00] text-black' 
              : 'bg-[#FF6666] hover:bg-[#FF5555] text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing || isAirdropping ? 'Processing...' : 'Confirm'}
          </Button>
        ) : (
          <div className="orderform-wallet-btn">
            <WalletMultiButton className="w-full font-bold py-6 !bg-[#23262B] !text-white !rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidProvideForm;
