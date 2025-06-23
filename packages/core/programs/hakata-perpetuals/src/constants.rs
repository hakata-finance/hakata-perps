use anchor_lang::prelude::*;

//! Constants used throughout the Hakata Perpetuals protocol
//! 
//! This module contains all the constant values used for:
//! - Program Derived Address (PDA) seeds
//! - Oracle configuration parameters
//! - Time and validation constants
//! - Protocol-specific limits and thresholds

// =============================================================================
// PDA Seeds - Used for generating program-derived addresses
// =============================================================================

/// Seed for the admin account PDA
#[constant]
pub const ADMIN_SEED: &str = "admin";

/// Seed for the perpetuals global state PDA
#[constant]
pub const PERPETUALS_SEED: &str = "perpetuals";

/// Seed for pool account PDAs
#[constant]
pub const POOL_SEED: &str = "pool";

/// Seed for LP token mint PDAs
#[constant]
pub const LP_TOKEN_MINT_SEED: &str = "lp_token_mint";

/// Seed for custody account PDAs
#[constant]
pub const CUSTODY_SEED: &str = "custody";

/// Seed for custody token mint PDAs
#[constant]
pub const CUSTODY_TOKEN_MINT_SEED: &str = "custody_token_mint";

/// Seed for custody token account PDAs
#[constant]
pub const CUSTODY_TOKEN_ACCOUNT_SEED: &str = "custody_token_account";

/// Seed for position account PDAs
#[constant]
pub const POSITION_SEED: &str = "position";

/// Seed for multisig account PDA
#[constant]
pub const MULTISIG_SEED: &str = "multisig";

/// Seed for transfer authority PDA
#[constant]
pub const TRANSFER_AUTHORITY_SEED: &str = "transfer_authority";

/// Seed for oracle account PDAs (custom oracles)
#[constant]
pub const ORACLE_ACCOUNT_SEED: &str = "oracle_account";

// =============================================================================
// Oracle Configuration
// =============================================================================

/// Maximum age for oracle prices in seconds
/// Note: Should be lowered in production environment
#[constant]
pub const ORACLE_MAXIMUM_AGE: u64 = 60;

/// Default confidence threshold for oracle prices (in basis points)
#[constant]
pub const ORACLE_CONFIDENCE_THRESHOLD_BPS: u64 = 1000; // 10%

/// Maximum staleness for EMA oracle prices in seconds
#[constant]
pub const EMA_ORACLE_MAX_STALENESS: u64 = 300; // 5 minutes

// =============================================================================
// Protocol Limits and Thresholds
// =============================================================================

/// Maximum number of admin signers in multisig
#[constant]
pub const MAX_ADMIN_SIGNERS: usize = 6;

/// Maximum number of custodies per pool
#[constant]
pub const MAX_CUSTODIES_PER_POOL: usize = 16;

/// Basis points denominator (100% = 10000 BPS)
#[constant]
pub const BPS_DENOMINATOR: u64 = 10000;

/// Default minimum position size in USD (6 decimals)
#[constant]
pub const MIN_POSITION_SIZE_USD: u64 = 10_000_000; // $10

/// Grace period for position closure after market close (in seconds)
#[constant]
pub const MARKET_CLOSE_GRACE_PERIOD: u32 = 300; // 5 minutes

// =============================================================================
// Time Constants
// =============================================================================

/// Seconds per day
#[constant]
pub const SECONDS_PER_DAY: i64 = 86_400;

/// Seconds per hour
#[constant]
pub const SECONDS_PER_HOUR: i64 = 3_600;

/// Seconds per minute
#[constant]
pub const SECONDS_PER_MINUTE: i64 = 60;

// =============================================================================
// Precision and Decimal Constants
// =============================================================================

/// Number of decimal places for USD amounts
#[constant]
pub const USD_DECIMALS: u8 = 6;

/// Number of decimal places for basis points calculations
#[constant]
pub const BPS_DECIMALS: u8 = 4;

/// Number of decimal places for rate calculations
#[constant]
pub const RATE_DECIMALS: u8 = 9;

/// Number of decimal places for price calculations
#[constant]
pub const PRICE_DECIMALS: u8 = 6;

// =============================================================================
// Account Size Constants
// =============================================================================

/// Standard size for Position accounts
#[constant]
pub const POSITION_ACCOUNT_SIZE: usize = 200;

/// Buffer size for account reallocations
#[constant]
pub const ACCOUNT_REALLOC_BUFFER: usize = 128;