import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/base64";
import {
  Connection,
  PublicKey,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";
import IDL from "@/target/idl/hakata_perpetuals.json";
import { PoolConfig } from "./PoolConfig";
import {
  CLUSTER,
  DEFAULT_PERPS_USER,
  DEFAULT_POOL,
  PROGRAM_ID,
  POOL_CONFIG,
} from "./constants";
import { IdlCoder } from "./IdlCoder";
import { Side } from "./types";

export type PositionSide = "long" | "short";

export interface PriceAndFee {
  price: BN;
  fee: BN;
}

export interface NewPositonPricesAndFee {
  price: BN;
  fee: BN;
  liquidationPrice: BN
}

export interface ProfitAndLoss {
  profit: BN;
  loss: BN;
}

export interface SwapAmountAndFees {
   amountOut: BN;
   feeIn: BN;
   feeOut: BN;
}

export interface AmountAndFee {
  amount: BN;
  fee: BN;
}

export class ViewHelper {
  program: Program<HakataPerpetuals>;
  connection: Connection;
  provider: AnchorProvider;
  poolConfig: PoolConfig;

  constructor(connection: Connection, provider: AnchorProvider) {
    this.connection = connection;
    this.provider = provider;
    this.program = new Program<HakataPerpetuals>(IDL, provider);
    this.poolConfig = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
  }

  // may need to add blockhash and also probably use VersionedTransactions
  simulateTransaction = async (
    transaction: Transaction
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> => {
    transaction.feePayer = DEFAULT_PERPS_USER.publicKey;
    const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');

    const messageV0 = new TransactionMessage({
      payerKey: this.provider.publicKey ?? DEFAULT_PERPS_USER.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: transaction.instructions
    }).compileToV0Message();

    const transaction2 = new VersionedTransaction(messageV0)
    return this.connection.simulateTransaction(transaction2, { sigVerify: false, replaceRecentBlockhash: true })
  };

  decodeLogs<T>(
    data: RpcResponseAndContext<SimulatedTransactionResponse>,
    instructionNumber: number
  ): T {
    const returnPrefix = `Program return: ${PROGRAM_ID} `;
    // console.log("Data:",data); 
    if (data.value.logs && data.value.err === null) {
      const returnLog = data.value.logs.find((l: any) =>
        l.startsWith(returnPrefix)
      );
      if (!returnLog) {
        throw new Error("View expected return log");
      }
      const returnData = decode(returnLog.slice(returnPrefix.length));
      console.log("returnType :>> ", IDL.instructions);
      console.log("instructionNumber :>> ", instructionNumber);
      const returnType = IDL.instructions[instructionNumber].returns;

      if (!returnType) {
        throw new Error("View expected return type");
      }
      const coder = IdlCoder.fieldLayout(
        { type: returnType },
        Array.from([...(IDL.accounts ?? []), ...(IDL.types ?? [])])
      );
      // return coder.decode(returnData);
      // console.log("coder.decode(returnData); ::: ", coder.decode(returnData));
      return coder.decode(returnData);
    } else {
       console.error("No Logs Found : data:",data); 
      throw new Error(`No Logs Found `,{cause: data});
    }
  }

  getAssetsUnderManagement = async (
    poolKey: PublicKey,
  ): Promise<BN> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);
    const custodies = POOL_CONFIG.custodies;
    const custodyMetas = [];
    for (const token of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: token.custodyAccount,
      });
    }
    for (const custody of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody.oracleAddress,
      });
    }

    const transaction = await program.methods
      .getAssetsUnderManagement({})
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
      })
      .remainingAccounts([...custodyMetas])
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getAssetsUnderManagement"
    );
    return this.decodeLogs(result, index);
  };

  getEntryPriceAndFee = async (
    collateral: BN,
    size: BN,
    side: Side,
    poolKey: PublicKey,
    custodyKey: PublicKey
  ): Promise<NewPositonPricesAndFee> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);
    // console.log("fee payer : ",DEFAULT_PERPS_USER.publicKey.toBase58())

    const transaction : Transaction = await program.methods
      // @ts-ignore
      .getEntryPriceAndFee({
        collateral,
        size,
        side: side,
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        custody: custodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "get_entry_price_and_fee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      price: res.entryPrice,
      fee: res.fee,
      liquidationPrice: res.liquidationPrice
    };
  };

  getExitPriceAndFee = async (
    poolKey: PublicKey,
    custodyKey: PublicKey,
    position: PublicKey
  ): Promise<PriceAndFee> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);
    // console.log("fee payer : ",DEFAULT_PERPS_USER.publicKey.toBase58())

    const transaction = await program.methods
      .getExitPriceAndFee({})
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        position: position,
        custody: custodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getExitPriceAndFee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      price: res.price,
      fee: res.fee,
    };
  };

  getLiquidationPrice = async (
    poolKey: PublicKey,
    custodyKey: PublicKey,
    position: PublicKey
  ): Promise<BN> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);

    // console.log("fee payer : ",DEFAULT_PERPS_USER.publicKey.toBase58())
    const transaction = await program.methods
      .getLiquidationPrice({
        // addCollateral, // need to update new code 
        // removeCollateral,
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        position: position,
        custody: custodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getLiquidationPrice"
    );
    return this.decodeLogs(result, index);
  };

  getLiquidationState = async (
    poolKey: PublicKey,
    custodyKey: PublicKey,
    position: PublicKey
  ): Promise<BN> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);

    const transaction = await program.methods
      .getLiquidationState({})
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        position: position,
        custody: custodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getLiquidationState"
    );
    return this.decodeLogs(result, index);
  };

  getOraclePrice = async (
    poolKey: PublicKey,
    ema: boolean,
    custodyKey: PublicKey
  ): Promise<BN> => {
    const transaction = await this.program.methods
      .getOraclePrice({
        ema,
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        custody: custodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getOraclePrice"
    );
    return this.decodeLogs<BN>(result, index);
  };

  getPnl = async (
    poolKey: PublicKey,
    custodyKey: PublicKey,
    position: PublicKey
  ): Promise<ProfitAndLoss> => {
    const transaction = await this.program.methods
      .getPnl({})
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        position: position,
        custody: custodyKey,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex((f) => f.name === "getPnl");
    const res: any = this.decodeLogs<BN>(result, index);
    return {
      profit: res.profit,
      loss: res.loss,
    };
  };

  getSwapAmountAndFees = async (
    amountIn: BN,
    poolKey: PublicKey,
    receivingCustodyKey: PublicKey,
    dispensingCustodykey : PublicKey,
  ): Promise<SwapAmountAndFees> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);

    const transaction = await program.methods
      .getSwapAmountAndFees({
        amountIn
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        receivingCustody: receivingCustodyKey,
        receivingCustodyOracleAccount:
          PoolConfig.getCustodyConfig(receivingCustodyKey)?.oracleAddress,
        dispensingCustody : dispensingCustodykey,
        dispensingCustodyOracleAccount : PoolConfig.getCustodyConfig(dispensingCustodykey)?.oracleAddress,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getSwapAmountAndFees"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      amountOut: res.amountOut,
      feeIn: res.feeIn,
      feeOut : res.feeOut
    };
  };

  getAddLiquidityAmountAndFee = async (
    amount: BN,
    poolKey: PublicKey,
    depositCustodyKey: PublicKey,
  ): Promise<AmountAndFee> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);

    const custodies = POOL_CONFIG.custodies;
    const custodyMetas = [];
    for (const token of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: token.custodyAccount,
      });
    }
    for (const custody of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody.oracleAddress,
      });
    }

    const transaction = await program.methods
      .getAddLiquidityAmountAndFee({
        amountIn : amount
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        custody: depositCustodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(depositCustodyKey)?.oracleAddress,
        lpTokenMint: this.poolConfig.lpTokenMint,  
      })
      .remainingAccounts([...custodyMetas])
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getAddLiquidityAmountAndFee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      amount: res.amount,
      fee : res.fee
    };
  };

  getRemoveLiquidityAmountAndFee = async (
    amount: BN,
    poolKey: PublicKey,
    removeTokenCustodyKey: PublicKey,
  ): Promise<AmountAndFee> => {
    const program = new Program<HakataPerpetuals>(IDL, this.provider);

    const custodies = POOL_CONFIG.custodies;
    const custodyMetas = [];
    for (const token of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: token.custodyAccount,
      });
    }
    for (const custody of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody.oracleAddress,
      });
    }

    const transaction = await program.methods
      .getRemoveLiquidityAmountAndFee({
        lpAmountIn : amount
      })
      .accounts({
        perpetuals: this.poolConfig.perpetuals,
        pool: poolKey,
        custody: removeTokenCustodyKey,
        custodyOracleAccount:
          PoolConfig.getCustodyConfig(removeTokenCustodyKey)?.oracleAddress,
        lpTokenMint: this.poolConfig.lpTokenMint,  
      })
      .remainingAccounts([...custodyMetas])
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getRemoveLiquidityAmountAndFee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      amount: res.amount,
      fee : res.fee
    };
  };
}
