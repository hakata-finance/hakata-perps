import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * Type definitions for the Hakata Perpetuals CLI client
 * 
 * This module provides comprehensive type definitions to improve type safety
 * and developer experience when working with the Hakata Perpetuals protocol.
 */

// =============================================================================
// Core Protocol Types
// =============================================================================

/**
 * Position side enumeration
 */
export type PositionSide = "long" | "short";

/**
 * Trading operation types
 */
export type TradingOperation = 
  | "open_position"
  | "close_position" 
  | "add_collateral"
  | "remove_collateral"
  | "liquidation"
  | "add_liquidity"
  | "remove_liquidity"
  | "swap";

/**
 * Market session types
 */
export type MarketSession = 
  | "closed"
  | "pre_market"
  | "regular"
  | "after_hours"
  | "extended";

/**
 * Asset types for RWA support
 */
export type AssetType = 
  | "crypto"
  | "us_stock"
  | "international_stock"
  | "forex"
  | "commodity"
  | "custom";

// =============================================================================
// Configuration Interfaces
// =============================================================================

/**
 * Oracle configuration parameters
 */
export interface OracleConfig {
  /** Oracle account public key */
  oracleAccount: PublicKey;
  /** Oracle type identifier */
  oracleType?: string;
  /** Maximum acceptable price error in basis points */
  maxPriceError?: number;
  /** Maximum age for price data in seconds */
  maxPriceAgeSec?: number;
  /** EMA oracle account (optional) */
  emaOracleAccount?: PublicKey;
}

/**
 * Pricing configuration parameters
 */
export interface PricingConfig {
  /** Whether to use EMA prices */
  useEma?: boolean;
  /** Whether to include unrealized PnL in AUM calculations */
  useUnrealizedPnlInAum?: boolean;
  /** Trade spread for long positions (basis points) */
  tradeSpreadLong?: number;
  /** Trade spread for short positions (basis points) */
  tradeSpreadShort?: number;
  /** Swap spread (basis points) */
  swapSpread?: number;
  /** Minimum initial leverage (basis points) */
  minInitialLeverage?: number;
  /** Maximum initial leverage (basis points) */
  maxInitialLeverage?: number;
  /** Maximum leverage (basis points) */
  maxLeverage?: number;
  /** Maximum payoff multiplier */
  maxPayoffMult?: number;
  /** Maximum utilization (basis points) */
  maxUtilization?: number;
  /** Maximum position locked USD amount */
  maxPositionLockedUsd?: BN;
  /** Maximum total locked USD amount */
  maxTotalLockedUsd?: BN;
}

/**
 * Fee configuration parameters
 */
export interface FeesConfig {
  /** Fee calculation mode */
  mode?: "fixed" | "linear" | "optimal";
  /** Fee ratio multiplier */
  ratioMult?: number;
  /** Utilization multiplier */
  utilizationMult?: number;
  /** Swap in fee (basis points) */
  swapIn?: number;
  /** Swap out fee (basis points) */
  swapOut?: number;
  /** Stable swap in fee (basis points) */
  stableSwapIn?: number;
  /** Stable swap out fee (basis points) */
  stableSwapOut?: number;
  /** Add liquidity fee (basis points) */
  addLiquidity?: number;
  /** Remove liquidity fee (basis points) */
  removeLiquidity?: number;
  /** Open position fee (basis points) */
  openPosition?: number;
  /** Close position fee (basis points) */
  closePosition?: number;
  /** Liquidation fee (basis points) */
  liquidation?: number;
  /** Protocol fee share (basis points) */
  protocolShare?: number;
  /** Maximum fee for optimal mode */
  feeMax?: number;
  /** Optimal fee for optimal mode */
  feeOptimal?: number;
}

/**
 * Borrow rate configuration parameters
 */
export interface BorrowRateConfig {
  /** Base rate (rate decimals) */
  baseRate?: BN;
  /** Slope 1 (rate decimals) */
  slope1?: BN;
  /** Slope 2 (rate decimals) */
  slope2?: BN;
  /** Optimal utilization (basis points) */
  optimalUtilization?: BN;
}

/**
 * Permissions configuration
 */
export interface PermissionsConfig {
  /** Allow swap operations */
  allowSwap?: boolean;
  /** Allow add liquidity operations */
  allowAddLiquidity?: boolean;
  /** Allow remove liquidity operations */
  allowRemoveLiquidity?: boolean;
  /** Allow open position operations */
  allowOpenPosition?: boolean;
  /** Allow close position operations */
  allowClosePosition?: boolean;
  /** Allow PnL withdrawal operations */
  allowPnlWithdrawal?: boolean;
  /** Allow collateral withdrawal operations */
  allowCollateralWithdrawal?: boolean;
  /** Allow size change operations */
  allowSizeChange?: boolean;
}

/**
 * Token ratio configuration
 */
export interface TokenRatios {
  /** Target ratio (basis points) */
  target: BN;
  /** Minimum ratio (basis points) */
  min: BN;
  /** Maximum ratio (basis points) */
  max: BN;
}

/**
 * Trading hours configuration
 */
export interface TradingHours {
  /** Asset type */
  assetType: AssetType;
  /** Primary exchange */
  exchange: string;
  /** Market open time (seconds from midnight UTC) */
  marketOpenUtc: number;
  /** Market close time (seconds from midnight UTC) */
  marketCloseUtc: number;
  /** Pre-market open time (0 if not supported) */
  premarketOpenUtc?: number;
  /** After-hours close time (0 if not supported) */
  afterhoursCloseUtc?: number;
  /** Allow trading during holidays */
  allowHolidayTrading?: boolean;
  /** Grace period for position closure (seconds) */
  closingGracePeriod?: number;
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * Price and fee response
 */
export interface PriceAndFee {
  /** Calculated price */
  price: BN;
  /** Associated fee */
  fee: BN;
}

/**
 * Amount and fee response
 */
export interface AmountAndFee {
  /** Calculated amount */
  amount: BN;
  /** Associated fee */
  fee: BN;
}

/**
 * New position prices and fee response
 */
export interface NewPositionPricesAndFee {
  /** Entry price */
  entryPrice: BN;
  /** Liquidation price */
  liquidationPrice: BN;
  /** Associated fee */
  fee: BN;
}

/**
 * Swap amount and fees response
 */
export interface SwapAmountAndFees {
  /** Output amount */
  amountOut: BN;
  /** Input fee */
  feeIn: BN;
  /** Output fee */
  feeOut: BN;
}

/**
 * Profit and loss response
 */
export interface ProfitAndLoss {
  /** Profit amount */
  profit: BN;
  /** Loss amount */
  loss: BN;
}

/**
 * Market status response
 */
export interface MarketStatus {
  /** Current market session */
  session: MarketSession;
  /** Whether new positions can be opened */
  allowOpenPosition: boolean;
  /** Whether existing positions can be closed */
  allowClosePosition: boolean;
  /** Whether trading is currently allowed */
  isTradingAllowed: boolean;
  /** Time until next market open (seconds) */
  secondsToOpen: number;
  /** Time until market close (seconds) */
  secondsToClose: number;
}

// =============================================================================
// Transaction Parameters
// =============================================================================

/**
 * Parameters for adding a pool
 */
export interface AddPoolParams {
  /** Pool name */
  name: string;
}

/**
 * Parameters for adding custody
 */
export interface AddCustodyParams {
  /** Pool ID */
  poolId: BN;
  /** Token mint */
  tokenMint: PublicKey;
  /** Is stable token */
  isStable: boolean;
  /** Is virtual token */
  isVirtual?: boolean;
  /** Oracle configuration */
  oracleConfig: OracleConfig;
  /** Pricing configuration */
  pricingConfig: PricingConfig;
  /** Permissions configuration */
  permissions: PermissionsConfig;
  /** Fees configuration */
  fees: FeesConfig;
  /** Borrow rate configuration */
  borrowRate: BorrowRateConfig;
  /** Token ratios */
  ratios: TokenRatios[];
}

/**
 * Parameters for opening a position
 */
export interface OpenPositionParams {
  /** Pool ID */
  poolId: BN;
  /** Entry price */
  price: BN;
  /** Collateral amount */
  collateral: BN;
  /** Position size */
  size: BN;
  /** Position side */
  side: PositionSide;
}

/**
 * Parameters for adding liquidity
 */
export interface AddLiquidityParams {
  /** Pool ID */
  poolId: BN;
  /** Input amount */
  amountIn: BN;
  /** Minimum LP tokens out */
  minLpAmountOut: BN;
}

/**
 * Parameters for removing liquidity
 */
export interface RemoveLiquidityParams {
  /** LP token amount in */
  lpAmountIn: BN;
  /** Minimum amount out */
  minAmountOut: BN;
}

/**
 * Parameters for swap operations
 */
export interface SwapParams {
  /** Input amount */
  amountIn: BN;
  /** Minimum output amount */
  minAmountOut: BN;
}

// =============================================================================
// Account Data Types
// =============================================================================

/**
 * Position account data structure
 */
export interface PositionData {
  /** Position owner */
  owner: PublicKey;
  /** Pool public key */
  pool: PublicKey;
  /** Custody public key */
  custody: PublicKey;
  /** Collateral custody public key */
  collateralCustody: PublicKey;
  /** Position open time */
  openTime: BN;
  /** Last update time */
  updateTime: BN;
  /** Position side */
  side: PositionSide;
  /** Entry price */
  price: BN;
  /** Position size in USD */
  sizeUsd: BN;
  /** Borrow size in USD */
  borrowSizeUsd: BN;
  /** Collateral in USD */
  collateralUsd: BN;
  /** Unrealized profit in USD */
  unrealizedProfitUsd: BN;
  /** Unrealized loss in USD */
  unrealizedLossUsd: BN;
  /** Cumulative interest snapshot */
  cumulativeInterestSnapshot: BN;
  /** Locked amount */
  lockedAmount: BN;
  /** Collateral amount */
  collateralAmount: BN;
  /** Account bump seed */
  bump: number;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Account meta for transaction building
 */
export interface AccountMeta {
  /** Account public key */
  pubkey: PublicKey;
  /** Is signer */
  isSigner: boolean;
  /** Is writable */
  isWritable: boolean;
}

/**
 * PDA result
 */
export interface PDAResult {
  /** Program derived address */
  publicKey: PublicKey;
  /** Bump seed */
  bump: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  /** Transaction signature */
  signature: string;
  /** Transaction slot */
  slot?: number;
  /** Confirmation status */
  confirmationStatus?: string;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Protocol error with code
 */
export interface ProtocolError {
  /** Error code */
  code: number;
  /** Error message */
  message: string;
  /** Error name */
  name: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Basis points denominator (100% = 10000 BPS) */
export const BPS_DENOMINATOR = 10000;

/** Default slippage tolerance in basis points (1%) */
export const DEFAULT_SLIPPAGE_BPS = 100;

/** Minimum position size in USD (with 6 decimals) */
export const MIN_POSITION_SIZE_USD = 10_000_000; // $10 