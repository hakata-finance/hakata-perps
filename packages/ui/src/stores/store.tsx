import { BN } from "@coral-xyz/anchor";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Custody, Pool } from "../lib/types";

interface StoreState {
  // positions: Map<string, Position>;
  // setPositions: (positions: Map<string, Position>) => void;
  // addPosition: (positionPk: string, position: Position) => void;
  // removePosition: (positionPk: string) => void;


  userLpTokensBalance: BN;
  setUserLpTokensBalance: (lpTokens: BN) => void;

  pool?: Pool;
  setPool: (pool: Pool) => void
  lpMintData?: any;
  setLpMintData: (mint: any) => void 

  custodies: Map<string, Custody>;
  setCustodies: (custodies: Map<string, Custody>) => void;
  addCustody: (custodyPk: string, custody: Custody) => void;

  // simple inputs
  inputTokenAmt: number;
  setInputTokenAmt: (amt: number) => void;
  inputLPTokenAmt: number;
  setInputLPTokenAmt: (amt: number) => void;
}

export const useGlobalStore = create<StoreState>()(
  devtools((set, _get) => ({
    devtools: false,
    // positions: new Map<string, Position>(),
    // setPositions: (positions: Map<string, Position>) => set({ positions }),
    // addPosition: (positionPk: string, position: Position) => set((state) => {
    //   const positions = new Map<string, Position>(state.positions);
    //   positions.set(positionPk, position)
    //   return { positions: positions }
    // }),
    // removePosition: (positionPk: string) => set((state) => {
    //   let positions = new Map<string, Position>(state.positions);
    //   positions.delete(positionPk)
    //   return { positions: positions }
    // }),
    
    userLpTokensBalance: new BN(0),
    setUserLpTokensBalance: (lpTokens : BN) => set({ userLpTokensBalance: lpTokens }),

    pool: undefined,
    setPool: (pool: Pool) => set({ pool: pool }),
   
    lpMintData: undefined,
    setLpMintData: (lpMintData: any) => set({ lpMintData }),

    custodies: new Map<string, Custody>(),
    setCustodies: (custodies: Map<string, Custody>) => set({ custodies }),
    addCustody: (custodyPk: string, custody: Custody) => set((state) => {
      const custodies = new Map<string, Custody>(state.custodies);
      custodies.set(custodyPk, custody)
      return { custodies: custodies }
    }),

    inputTokenAmt: 1,
    setInputTokenAmt: (amt : number) => set({ inputTokenAmt: amt }),
    inputLPTokenAmt: 1,
    setInputLPTokenAmt: (amt : number) => set({ inputLPTokenAmt: amt }),
    
  }),
    {
      serialize: {
        options: {
          map: true,
          set : true,
          function : true,
          date : true
        }
      } as any
    }
  )
);
