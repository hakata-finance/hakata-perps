import { BN } from "@coral-xyz/anchor";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Custody, Pool } from "../lib/types";
import { PublicKey } from "@solana/web3.js";

/**
 * Interface representing LP token mint data
 */
interface MintData {
  /** Mint address */
  address: PublicKey;
  /** Mint authority (if present) */
  mintAuthority: PublicKey | null;
  /** Token supply */
  supply: BN;
  /** Token decimals */
  decimals: number;
  /** Whether the mint is initialized */
  isInitialized: boolean;
  /** Freeze authority (if present) */
  freezeAuthority: PublicKey | null;
}

/**
 * Global store state interface
 * Defines the shape of the application's global state and actions
 */
interface StoreState {
  /**
   * User's LP token balance
   */
  userLpTokensBalance: BN;
  
  /**
   * Set user's LP token balance
   * @param lpTokens - The new LP token balance
   */
  setUserLpTokensBalance: (lpTokens: BN) => void;

  /**
   * Pool data containing information about the liquidity pool
   */
  pool?: Pool;
  
  /**
   * Set pool data
   * @param pool - The pool data to set
   */
  setPool: (pool: Pool) => void;
  
  /**
   * LP token mint data
   */
  lpMintData?: MintData;
  
  /**
   * Set LP token mint data
   * @param mint - The mint data to set
   */
  setLpMintData: (mint: MintData) => void; 

  /**
   * Custody accounts map (key is the custody account public key)
   */
  custodies: Map<string, Custody>;
  
  /**
   * Set all custody accounts
   * @param custodies - Map of custody accounts
   */
  setCustodies: (custodies: Map<string, Custody>) => void;
  
  /**
   * Add a single custody account
   * @param custodyPk - Custody account public key (as base58 string)
   * @param custody - Custody account data
   */
  addCustody: (custodyPk: string, custody: Custody) => void;

  /**
   * Input token amount for operations
   */
  inputTokenAmt: number;
  
  /**
   * Set input token amount
   * @param amt - The token amount to set
   */
  setInputTokenAmt: (amt: number) => void;
  
  /**
   * Input LP token amount for operations
   */
  inputLPTokenAmt: number;
  
  /**
   * Set input LP token amount
   * @param amt - The LP token amount to set
   */
  setInputLPTokenAmt: (amt: number) => void;
}

/**
 * Global store implementation using Zustand
 * Provides state management for the entire application
 */
export const useGlobalStore = create<StoreState>()(
  devtools((set) => ({
    devtools: false,
    
    // LP token balance
    userLpTokensBalance: new BN(0),
    setUserLpTokensBalance: (lpTokens: BN) => set({ userLpTokensBalance: lpTokens }),

    // Pool data
    pool: undefined,
    setPool: (pool: Pool) => set({ pool }),
   
    // LP mint data
    lpMintData: undefined,
    setLpMintData: (lpMintData: MintData) => set({ lpMintData }),

    // Custody accounts
    custodies: new Map<string, Custody>(),
    setCustodies: (custodies: Map<string, Custody>) => set({ custodies }),
    addCustody: (custodyPk: string, custody: Custody) => set((state) => {
      // Create a new map to ensure state updates trigger correctly
      const custodies = new Map<string, Custody>(state.custodies);
      custodies.set(custodyPk, custody);
      return { custodies };
    }),

    // Input values for UI operations
    inputTokenAmt: 1,
    setInputTokenAmt: (amt: number) => set({ inputTokenAmt: amt }),
    inputLPTokenAmt: 1,
    setInputLPTokenAmt: (amt: number) => set({ inputLPTokenAmt: amt }),
  }),
  {
    serialize: {
      options: {
        map: true,
        set: true,
        function: true,
        date: true
      }
    } 
  })
);
