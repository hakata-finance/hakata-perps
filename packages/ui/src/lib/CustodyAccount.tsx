import { PublicKey } from "@solana/web3.js";
import { Assets, FeesStats, Custody, Fees,  PricingParams, TradeStats, Permissions, BorrowRateParams, OracleParams, VolumeStats, PositionStats, BorrowRateState } from "../types";


export class CustodyAccount {

    static from(
        publicKey: PublicKey,
        obj: {
          pool: PublicKey;
          mint: PublicKey;
          tokenAccount: PublicKey;
          decimals: number;
          isStable: boolean;
          oracle: OracleParams;
          pricing: PricingParams;
          permissions: Permissions;
          fees: Fees;
          borrowRate: BorrowRateParams;

          assets: Assets;
          collectedFees: FeesStats;
          volumeStats: VolumeStats;
          tradeStats: TradeStats;

          longPositions: PositionStats;
          shortPositions: PositionStats;
          borrowRateState: BorrowRateState;
        },
      ): CustodyAccount {
        return new CustodyAccount(
          publicKey,
          obj.pool,
          obj.mint,
          obj.tokenAccount,
          obj.decimals,
          obj.isStable,
          obj.oracle,
          obj.pricing,
          obj.permissions,
          obj.fees,
          obj.borrowRate,

          obj.assets,
          obj.collectedFees,
          obj.volumeStats,
          obj.tradeStats,

          obj.longPositions,
          obj.shortPositions,
          obj.borrowRateState,

        );
      }
  
    constructor(
        public publicKey: PublicKey, 

        public pool: PublicKey, 
        public mint: PublicKey,
        public tokenAccount: PublicKey,
        public decimals: number,
        public isStable: boolean,
        public oracle: OracleParams,
        public pricing: PricingParams,
        public permissions: Permissions,
        public fees: Fees,
        public borrowRate: BorrowRateParams,

        public assets: Assets,
        public collectedFees: FeesStats,
        public volumeStats: VolumeStats,
        public tradeStats: TradeStats,

        public longPositions: PositionStats,
        public shortPositions: PositionStats,
        public borrowRateState: BorrowRateState,

      ) {
      }

      updateCustodyData(custody: Custody) {
            Object.assign(this,{...custody})
      }

      getUtilization(){

      }

      getCuurentAndTargetWeights(){
        
      }

      getDepositFee(){

      }

      getLiquidity(){

      }

  }