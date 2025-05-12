import { Cluster, PublicKey } from "@solana/web3.js";
import IDL from "@/target/idl/hakata_perpetuals.json";
import { PoolConfig } from "./PoolConfig";

export const RPC_URL: string = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
export const CLUSTER: Cluster = process.env.NEXT_CLUSTER as Cluster || 'devnet';
export const DEFAULT_POOL: string = process.env.NEXT_DEFAULT_POOL || 'TestHakataPool1';

// Program ID
export const PROGRAM_ID = new PublicKey(IDL.address);

// Number constants from IDL

// String constants from IDL stored as byte arrays
// export const GAME_STATE_SEED = getStringFromByteArray(getConstantOrThrow("GAME_STATE_SEED"));
export const POOL_SEED = "Pool";

// PDAs
export const [poolPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(POOL_SEED)],
  PROGRAM_ID
);
export const perpetualsAddress = PublicKey.findProgramAddressSync(
  [Buffer.from("perpetuals")],
  PROGRAM_ID
)[0];
export const transferAuthorityAddress = PublicKey.findProgramAddressSync(
  [Buffer.from("transfer_authority")],
  PROGRAM_ID
)[0];

// Internal constants
export const PERCENTAGE_DECIMALS = 4; // stableCoinPercentage
export const PRICE_DECIMALS = 6;
export const USD_DECIMALS = 6;
export const POOL_CONFIG = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);

// Addresses
export const SOL_MINT_ADDRESS =  POOL_CONFIG.tokens.find(i => i.symbol=='SOL')?.mintKey?.toBase58() ?? "NOT_FOUND_IN_CONFIG";
export const USDC_MINT_ADDRESS = POOL_CONFIG.tokens.find(i => i.symbol=='USDC')?.mintKey?.toBase58() ?? "NOT_FOUND_IN_CONFIG";
