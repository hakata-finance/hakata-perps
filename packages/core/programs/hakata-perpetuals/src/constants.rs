use anchor_lang::prelude::*;

// Seeds

#[constant]
pub const ADMIN_SEED: &str = "admin";

#[constant]
pub const PERPETUALS_SEED: &str = "perpetuals";

#[constant]
pub const POOL_SEED: &str = "pool";

#[constant]
pub const LP_TOKEN_MINT_SEED: &str = "lp_token_mint";

#[constant]
pub const CUSTODY_SEED: &str = "custody";

#[constant]
pub const CUSTODY_TOKEN_MINT_SEED: &str = "custody_token_mint";

#[constant]
pub const CUSTODY_TOKEN_ACCOUNT_SEED: &str = "custody_token_account";

#[constant]
pub const POSITION_SEED: &str = "position";

// Oracle

#[constant]
pub const ORACLE_MAXIMUM_AGE: u64 = 60; // seconds, should be lowered in prod