import { POOL_CONFIG } from "./constants";
import { CustodyConfig } from "./PoolConfig";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Position, Side } from "./types";
import { ViewHelper } from "./ViewHelpers";


// export interface PositionDisplayData {

//   publicKey: PublicKey,

//   owner: PublicKey,
//   pool: PublicKey,
//   custody: PublicKey,
//   // lockCustody: PublicKey,

//   openTime: BN,
//   updateTime: BN,

//   side: Side,
//   price: BN,
//   sizeUsd: BN,
//   collateralUsd: BN,
//   unrealizedProfitUsd: BN,
//   unrealizedLossUsd: BN,
//   cumulativeInterestSnapshot: BN,
//   lockedAmount: BN,
//   collateralAmount: BN,
  
//   // variable data
//   liquidationPriceUsd : BN,
//   pnlUsd : BN, 

// }

export class PositionAccount {

  static async from(
    View : ViewHelper,
    publicKey: PublicKey,
    obj: {
      owner: PublicKey,
      pool: PublicKey,
      custody: PublicKey,
      // lockCustody: PublicKey,
      openTime: BN,
      updateTime: BN,
      side: Side,
      price: BN,
      sizeUsd: BN,
      collateralUsd: BN,
      unrealizedProfitUsd: BN,
      unrealizedLossUsd: BN,
      cumulativeInterestSnapshot: BN,
      lockedAmount: BN,
      collateralAmount: BN,
    },
  ): Promise<PositionAccount> {

    // console.log("PositionAccount from:",obj , obj.side , isVariant(obj.side, 'long') , isVariant(obj.side, 'short'))
    
    const custodyConfig  =  POOL_CONFIG.custodies.find(i => i.custodyAccount.toBase58() == obj.custody.toBase58());
    const liquidationPriceUsd = await this.getLiquidationPrice(View, obj.pool,obj.custody, publicKey);
    const pnlUsd = await this.getPnl(View, obj.pool,obj.custody, publicKey);
    const leverage = Number(obj.sizeUsd.div(obj.collateralUsd).toNumber().toFixed(2))

    return new PositionAccount(
      publicKey,
      obj.owner,
      obj.pool,
      obj.custody,
      // obj.lockCustody,
      obj.openTime,
      obj.updateTime,

      obj.side,
      obj.price,
      obj.sizeUsd,
      obj.collateralUsd,
      obj.unrealizedProfitUsd,
      obj.unrealizedLossUsd,
      obj.cumulativeInterestSnapshot,
      obj.lockedAmount,
      obj.collateralAmount,
      // display
      custodyConfig!,
      // variable data
     liquidationPriceUsd,
      pnlUsd,
      leverage
    );
  }

  constructor(
    public publicKey: PublicKey,
    public owner: PublicKey,
    public pool: PublicKey,
    public custody: PublicKey,
    //public  lockCustody: PublicKey,

    public openTime: BN,
    public updateTime: BN,

    public side: Side,
    public price: BN,
    public sizeUsd: BN,
    public collateralUsd: BN,
    public unrealizedProfitUsd: BN,
    public unrealizedLossUsd: BN,
    public cumulativeInterestSnapshot: BN,
    public lockedAmount: BN,
    public collateralAmount: BN,
    // extra 
    public custodyConfig : CustodyConfig,
    // dyanmic data
    public liquidationPriceUsd : BN,
    public pnlUsd : BN, 
    public leverage :number,
  ) {
  }

  updatePositionData(position: Position) {
    Object.assign(this, { ...position })
  }

  static async getLiquidationPrice(View : ViewHelper,  poolKey: PublicKey, custodyKey: PublicKey, position: PublicKey) {
   
    try {
      return await View.getLiquidationPrice( poolKey , custodyKey, position);
    } catch (error) {
       return new BN(0);
    }
  }

  static async getPnl(View : ViewHelper, poolKey: PublicKey, custodyKey: PublicKey, position: PublicKey) {
    try {
      const x = await View.getPnl(poolKey , custodyKey, position);
      if(x.profit){
        return x.profit;
      } else {
        return x.loss.mul(new BN(-1));
      }
    } catch (error) {
       return new BN(0);
      
    }
  }

}
