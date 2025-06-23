//@ts-nocheck
import {
  setProvider,
  Program,
  AnchorProvider,
  workspace,
  utils,
  BN,
} from "@coral-xyz/anchor";
import {
  PublicKey,
  TransactionInstruction,
  Transaction,
  SystemProgram,
  AccountMeta,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import JSBI from "jsbi";
import fetch from "node-fetch";
import { sha256 } from "js-sha256";
import { encode } from "bs58";
import { readFileSync } from "fs";
import { resolveOrCreateAssociatedTokenAddress } from "@orca-so/sdk";
import { HakataPerpetuals } from "../../target/types/hakata_perpetuals";

// Constants
const DEFAULT_RATIO_BASE = 10000;
const PROVIDER_CONFIG = {
  commitment: "confirmed" as const,
  preflightCommitment: "confirmed" as const,
  skipPreflight: true,
};

export type PositionSide = "long" | "short";

/**
 * Configuration for oracle settings
 */
export interface OracleConfig {
  oracleAccount: PublicKey;
  oracleType?: string;
  maxPriceError?: number;
  maxPriceAgeSec?: number;
}

/**
 * Configuration for pricing parameters
 */
export interface PricingConfig {
  useEma?: boolean;
  tradeSpreadLong?: number;
  tradeSpreadShort?: number;
  swapSpread?: number;
  minInitialLeverage?: number;
  maxInitialLeverage?: number;
  maxLeverage?: number;
}

/**
 * Main client for interacting with Hakata Perpetuals protocol
 */
export class PerpetualsClient {
  provider: AnchorProvider;
  program: Program<HakataPerpetuals>;
  admin: Keypair;

  // pdas
  multisig: { publicKey: PublicKey; bump: number };
  authority: { publicKey: PublicKey; bump: number };
  perpetuals: { publicKey: PublicKey; bump: number };

  /**
   * Creates a new PerpetualsClient instance
   * @param clusterUrl - The Solana cluster URL to connect to
   * @param adminKey - Path to the admin keypair file
   */
  constructor(clusterUrl: string, adminKey: string) {
    this.provider = AnchorProvider.local(clusterUrl, PROVIDER_CONFIG);
    setProvider(this.provider);
    this.program = workspace.hakataPerpetuals as Program<HakataPerpetuals>;

    this.admin = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(readFileSync(adminKey).toString()))
    );

    this.multisig = this.findProgramAddress("multisig");
    this.authority = this.findProgramAddress("transfer_authority");
    this.perpetuals = this.findProgramAddress("perpetuals");

    BN.prototype.toJSON = function () {
      return this.toString(10);
    };
  }

  /**
   * Finds a program-derived address for a given label and optional extra seeds
   * @param label - The string label for the PDA
   * @param extraSeeds - Optional additional seeds for PDA derivation
   * @returns Object containing the public key and bump seed
   */
  findProgramAddress = (label: string, extraSeeds = null) => {
    let seeds = [Buffer.from(utils.bytes.utf8.encode(label))];
    if (extraSeeds) {
      for (let extraSeed of extraSeeds) {
        if (typeof extraSeed === "string") {
          seeds.push(Buffer.from(utils.bytes.utf8.encode(extraSeed)));
        } else if (Array.isArray(extraSeed)) {
          seeds.push(Buffer.from(extraSeed));
        } else {
          seeds.push(extraSeed.toBuffer());
        }
      }
    }
    let res = PublicKey.findProgramAddressSync(seeds, this.program.programId);
    return { publicKey: res[0], bump: res[1] };
  };

  /**
   * Adjusts token ratios to ensure they sum to 100% (10000 basis points)
   * @param ratios - Array of token ratio objects to adjust
   * @returns Adjusted ratios array
   */
  adjustTokenRatios = (ratios) => {
    if (ratios.length == 0) {
      return ratios;
    }
    let target = Math.floor(DEFAULT_RATIO_BASE / ratios.length);

    for (let ratio of ratios) {
      ratio.target = new BN(target);
    }

    if (DEFAULT_RATIO_BASE % ratios.length !== 0) {
      ratios[ratios.length - 1].target = new BN(
        target + (DEFAULT_RATIO_BASE % ratios.length)
      );
    }

    return ratios;
  };

  /**
   * Fetches the perpetuals global state
   * @returns Promise resolving to the perpetuals account data
   */
  getPerpetuals = async () => {
    return this.program.account.perpetuals.fetch(this.perpetuals.publicKey);
  };

  /**
   * Gets the public key for a pool by name
   * @param name - The pool name
   * @returns The pool's public key
   */
  getPoolKey = (name: string) => {
    return this.findProgramAddress("pool", name).publicKey;
  };

  /**
   * Fetches pool data by name
   * @param name - The pool name
   * @returns Promise resolving to the pool account data
   */
  getPool = async (name: string) => {
    return this.program.account.pool.fetch(this.getPoolKey(name));
  };

  /**
   * Fetches all pools registered in the protocol
   * @returns Promise resolving to array of pool account data
   */
  getPools = async () => {
    let perpetuals = await this.getPerpetuals();
    return this.program.account.pool.fetchMultiple(perpetuals.pools);
  };

  /**
   * Gets the LP token mint public key for a pool
   * @param name - The pool name
   * @returns The LP token mint public key
   */
  getPoolLpTokenKey = (name: string) => {
    return this.findProgramAddress("lp_token_mint", [this.getPoolKey(name)])
      .publicKey;
  };

  /**
   * Gets the custody account public key for a token in a pool
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns The custody account public key
   */
  getCustodyKey = (poolName: string, tokenMint: PublicKey) => {
    return this.findProgramAddress("custody", [
      this.getPoolKey(poolName),
      tokenMint,
    ]).publicKey;
  };

  /**
   * Gets the custody token account public key for a token in a pool
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns The custody token account public key
   */
  getCustodyTokenAccountKey = (poolName: string, tokenMint: PublicKey) => {
    return this.findProgramAddress("custody_token_account", [
      this.getPoolKey(poolName),
      tokenMint,
    ]).publicKey;
  };

  /**
   * Gets the oracle account public key for a custody
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns Promise resolving to the oracle account public key
   */
  getCustodyOracleAccountKey = async (
    poolName: string,
    tokenMint: PublicKey
  ) => {
    return (await this.getCustody(poolName, tokenMint)).oracle.oracleAccount;
  };

  /**
   * Gets the test oracle account public key for a custody
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns The test oracle account public key
   */
  getCustodyTestOracleAccountKey = (poolName: string, tokenMint: PublicKey) => {
    return this.findProgramAddress("oracle_account", [
      this.getPoolKey(poolName),
      tokenMint,
    ]).publicKey;
  };

  /**
   * Fetches custody data for a token in a pool
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns Promise resolving to the custody account data
   */
  getCustody = async (poolName: string, tokenMint: PublicKey) => {
    return this.program.account.custody.fetch(
      this.getCustodyKey(poolName, tokenMint)
    );
  };

  /**
   * Fetches all custody accounts for a pool
   * @param poolName - The pool name
   * @returns Promise resolving to array of custody account data
   */
  getCustodies = async (poolName: string) => {
    return this.program.account.custody.all();
  };

  /**
   * Gets custody and oracle account metas for a pool (used in transaction building)
   * @param poolName - The pool name
   * @returns Promise resolving to array of account metas
   */
  getCustodyMetas = async (poolName: string) => {
    let pool = await this.getPool(poolName);
    let custodies = await this.program.account.custody.fetchMultiple(
      pool.tokens.map((t) => t.custody)
    );
    let custodyMetas = [];
    for (const token of pool.tokens) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: token.custody,
      });
    }
    for (const custody of custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody.oracle.oracleAccount,
      });
    }
    return custodyMetas;
  };

  /**
   * Fetches the multisig account data
   * @returns Promise resolving to the multisig account data
   */
  getMultisig = async () => {
    return this.program.account.multisig.fetch(this.multisig.publicKey);
  };

  /**
   * Gets the position account public key for a user's position
   * @param wallet - The user's wallet public key
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @param side - The position side ("long" or "short")
   * @returns The position account public key
   */
  getPositionKey = (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide
  ) => {
    let pool = this.getPoolKey(poolName);
    let custody = this.getCustodyKey(poolName, tokenMint);
    return this.findProgramAddress("position", [
      wallet,
      pool,
      custody,
      side === "long" ? [1] : [0],
    ]).publicKey;
  };

  /**
   * Fetches a specific user position
   * @param wallet - The user's wallet public key
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @param side - The position side ("long" or "short")
   * @returns Promise resolving to the position account data
   */
  getUserPosition = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide
  ) => {
    return this.program.account.position.fetch(
      this.getPositionKey(wallet, poolName, tokenMint, side)
    );
  };

  /**
   * Fetches all positions for a given wallet
   * @param wallet - The user's wallet public key
   * @returns Promise resolving to array of position account data
   */
  getUserPositions = async (wallet: PublicKey) => {
    let data = encode(
      Buffer.concat([
        this.getAccountDiscriminator("Position"),
        wallet.toBuffer(),
      ])
    );
    let positions = await this.provider.connection.getProgramAccounts(
      this.program.programId,
      {
        filters: [{ dataSize: 200 }, { memcmp: { bytes: data, offset: 0 } }],
      }
    );
    return Promise.all(
      positions.map((position) => {
        return this.program.account.position.fetch(position.pubkey);
      })
    );
  };

  /**
   * Fetches all positions for a specific token in a pool
   * @param poolName - The pool name
   * @param tokenMint - The token mint public key
   * @returns Promise resolving to array of position account data for the token
   */
  getPoolTokenPositions = async (poolName: string, tokenMint: PublicKey) => {
    let poolKey = this.getPoolKey(poolName);
    let custodyKey = this.getCustodyKey(poolName, tokenMint);
    let data = encode(
      Buffer.concat([poolKey.toBuffer(), custodyKey.toBuffer()])
    );
    let positions = await this.provider.connection.getProgramAccounts(
      this.program.programId,
      {
        filters: [{ dataSize: 200 }, { memcmp: { bytes: data, offset: 40 } }],
      }
    );
    return Promise.all(
      positions.map((position) => {
        return this.program.account.position.fetch(position.pubkey);
      })
    );
  };

  /**
   * Fetches all positions across the entire protocol
   * @returns Promise resolving to array of all position account data
   */
  getAllPositions = async () => {
    return this.program.account.position.all();
  };

  /**
   * Gets the account discriminator for a given account type
   * @param name - The account type name
   * @returns Buffer containing the 8-byte discriminator
   */
  getAccountDiscriminator = (name: string) => {
    return Buffer.from(sha256.digest(`account:${name}`)).slice(0, 8);
  };

  /**
   * Logs a timestamped message to console
   * @param message - Messages to log
   */
  log = (...message: string) => {
    let date = new Date();
    let date_str = date.toDateString();
    let time = date.toLocaleTimeString();
    console.log(`[${date_str} ${time}] ${message}`);
  };

  /**
   * Pretty prints an object to console with formatting
   * @param object - Object to print
   */
  prettyPrint = (object: object) => {
    console.log(JSON.stringify(object, null, 2));
  };

  ///////
  // instructions

  init = async (admins: Publickey[], config) => {
    let perpetualsProgramData = PublicKey.findProgramAddressSync(
      [this.program.programId.toBuffer()],
      new PublicKey("BPFLoaderUpgradeab1e1111111111111111111111111")
    )[0];

    let adminMetas = [];
    for (const admin of admins) {
      adminMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: admin,
      });
    }

    await this.program.methods
      .init(config)
      .accounts({
        upgradeAuthority: this.provider.wallet.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        perpetualsProgram: this.program.programId,
        perpetualsProgramData,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(adminMetas)
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  setAdminSigners = async (admins: Publickey[], minSignatures: number) => {
    let adminMetas = [];
    for (const admin of admins) {
      adminMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: admin,
      });
    }
    try {
      await this.program.methods
        .setAdminSigners({
          minSignatures,
        })
        .accounts({
          admin: this.admin.publicKey,
          multisig: this.multisig.publicKey,
        })
        .remainingAccounts(adminMetas)
        .signers([this.admin])
        .rpc();
    } catch (err) {
      if (this.printErrors) {
        console.log(err);
      }
      throw err;
    }
  };

  addPool = async (name: string) => {
    await this.program.methods
      .addPool({ name })
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(name),
        lpTokenMint: this.getPoolLpTokenKey(name),
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  removePool = async (name: string) => {
    await this.program.methods
      .removePool({})
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(name),
        systemProgram: SystemProgram.programId,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  addCustody = async (
    poolName: string,
    tokenMint: PublicKey,
    isStable: boolean,
    oracleConfig,
    pricingConfig,
    permissions,
    fees,
    borrowRate,
    ratios
  ) => {
    console.log("CustodyKey",  this.getCustodyKey(poolName, tokenMint).toBase58())
    console.log("getCustodyTokenAccountKey",  this.getCustodyTokenAccountKey(poolName, tokenMint).toBase58())
    
    const trx_id =  await this.program.methods
      .addCustody({
        isStable,
        oracle: oracleConfig,
        pricing: pricingConfig,
        permissions,
        fees,
        borrowRate,
        ratios,
      })
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyTokenAccount: this.getCustodyTokenAccountKey(
          poolName,
          tokenMint
        ),
        custodyTokenMint: tokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });

      console.log("trx_id:", `https://explorer.solana.com/tx/${trx_id}?cluster=devnet`)

  };

  editCustody = async (
    poolName: string,
    tokenMint: PublicKey,
    isStable: boolean,
    oracleConfig,
    pricingConfig,
    permissions,
    fees,
    borrowRate,
    ratios
  ) => {
    console.log("CustodyKey",  this.getCustodyKey(poolName, tokenMint).toBase58())
    console.log("getCustodyTokenAccountKey",  this.getCustodyTokenAccountKey(poolName, tokenMint).toBase58())

   const trx_id =  await this.program.methods
      .testingEditCustody({
        isStable,
        oracle: oracleConfig,
        pricing: pricingConfig,
        permissions,
        fees,
        borrowRate,
        targetRatio: ratios.target,
        minRatio: ratios.min,
        maxRatio: ratios.max,
      })
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyTokenAccount: this.getCustodyTokenAccountKey(
          poolName,
          tokenMint
        ),
        custodyTokenMint: tokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
      console.log("trx_id:", `https://explorer.solana.com/tx/${trx_id}?cluster=devnet`)
  };

  removeCustody = async (poolName: string, tokenMint: PublicKey, ratios) => {
    await this.program.methods
      .removeCustody({ ratios })
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyTokenAccount: this.getCustodyTokenAccountKey(
          poolName,
          tokenMint
        ),
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  upgradeCustody = async (poolName: string, tokenMint: PublicKey) => {
    await this.program.methods
      .upgradeCustody({})
      .accounts({
        admin: this.admin.publicKey,
        multisig: this.multisig.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        systemProgram: SystemProgram.programId,
      })
      .signers([this.admin])
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  liquidate = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide,
    receivingAccount: PublicKey,
    rewardsReceivingAccount: PublicKey
  ) => {
    return await this.program.methods
      .liquidate({})
      .accounts({
        signer: this.provider.wallet.publicKey,
        receivingAccount,
        rewardsReceivingAccount,
        transferAuthority: this.authority.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
        custodyTokenAccount: this.getCustodyTokenAccountKey(
          poolName,
          tokenMint
        ),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getOraclePrice = async (
    poolName: string,
    tokenMint: PublicKey,
    ema: boolean
  ) => {
    return await this.program.methods
      .getOraclePrice({
        ema,
      })
      .accounts({
        // signer: this.provider.wallet.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getAddLiquidityAmountAndFee = async (
    poolName: string,
    tokenMint: PublicKey,
    amount: typeof BN
  ) => {
    return await this.program.methods
      .getAddLiquidityAmountAndFee({
        amountIn: amount,
      })
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
        lpTokenMint: this.getPoolLpTokenKey(poolName),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getRemoveLiquidityAmountAndFee = async (
    poolName: string,
    tokenMint: PublicKey,
    lpAmount: typeof BN
  ) => {
    return await this.program.methods
      .getRemoveLiquidityAmountAndFee({
        lpAmountIn: lpAmount,
      })
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
        lpTokenMint: this.getPoolLpTokenKey(poolName),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getEntryPriceAndFee = async (
    poolName: string,
    tokenMint: PublicKey,
    collateral: typeof BN,
    size: typeof BN,
    side: PositionSide
  ) => {
    console.log("perps: ", this.perpetuals.publicKey.toBase58())

    console.log("poolKey: ", this.getPoolKey(poolName).toBase58())
    console.log("custody key : ",this.getCustodyKey(poolName, tokenMint).toBase58());
    console.log("orcalve: ",  (await this.getCustodyOracleAccountKey(poolName,tokenMint)).toBase58())

    return await this.program.methods
      .getEntryPriceAndFee({
        collateral,
        size,
        side: side === "long" ? { long: {} } : { short: {} },
      })
      .accounts({
        // signer: this.provider.wallet.publicKey,
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
        lockCustody: this.getCustodyKey(poolName, tokenMint),
        lockCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getExitPriceAndFee = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide
  ) => {
    return await this.program.methods
      .getExitPriceAndFee({})
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getLiquidationPrice = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide,
    addCollateral: typeof BN,
    removeCollateral: typeof BN
  ) => {
    return await this.program.methods
      .getLiquidationPrice({
        addCollateral,
        removeCollateral,
      })
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getLiquidationState = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide
  ) => {
    return await this.program.methods
      .getLiquidationState({})
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getPnl = async (
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: PositionSide
  ) => {
    return await this.program.methods
      .getPnl({})
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        custody: this.getCustodyKey(poolName, tokenMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getSwapAmountAndFees = async (
    poolName: string,
    tokenMintIn: PublicKey,
    tokenMintOut: PublicKey,
    amountIn: BN
  ) => {
    return await this.program.methods
      .getSwapAmountAndFees({
        amountIn,
      })
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
        receivingCustody: this.getCustodyKey(poolName, tokenMintIn),
        receivingCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMintIn
        ),
        dispensingCustody: this.getCustodyKey(poolName, tokenMintOut),
        dispensingCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMintOut
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  getAum = async (poolName: string) => {
    return await this.program.methods
      .getAssetsUnderManagement({})
      .accounts({
        perpetuals: this.perpetuals.publicKey,
        pool: this.getPoolKey(poolName),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };
}
