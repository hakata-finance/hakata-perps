import { BN, IdlAccounts } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";

// Side enum matching Anchor's generated format
export type Side = 
  | { none: unknown }
  | { long: unknown }
  | { short: unknown };

// Accounts
// export type Pool = IdlAccounts<HakataPerpetuals>["pool"];
export type Custody = IdlAccounts<HakataPerpetuals>["custody"];

export interface Pool {
  name: string;
  tokens: Token[];
  aumUsd: BN;
  bump: number;
  lpTokenBump: number;
  inceptionTime: BN;
}

export interface Token {
  custody: PublicKey;
  targetRatio: BN;
  minRatio: BN;
  maxRatio: BN;
}

// Events

// Types
export interface Position {
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
}

//  taken from drift 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isVariant(object: any, type: string) {
	if (!object) {
		return false;
	}
	
	if (typeof object !== 'object') {
		return false;
	}
	
	if (!object.hasOwnProperty) {
		return false;
	}
	
	return object.hasOwnProperty(type);
}

// Custom Frontend Types
