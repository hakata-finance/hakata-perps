use anchor_lang::prelude::*;

/// Custom error codes for the Hakata Perpetuals protocol
/// 
/// Each error includes both a human-readable message and a unique error code
/// for programmatic error handling and debugging.
#[error_code]
pub enum PerpetualsError {
    // =============================================================================
    // Multisig Errors (Code range: 6000-6099)
    // =============================================================================
    
    #[msg("Account is not authorized to sign this instruction")]
    MultisigAccountNotAuthorized, // 6000
    
    #[msg("Account has already signed this instruction")]
    MultisigAlreadySigned, // 6001
    
    #[msg("This instruction has already been executed")]
    MultisigAlreadyExecuted, // 6002

    // =============================================================================
    // Math and Computation Errors (Code range: 6100-6199)
    // =============================================================================
    
    #[msg("Overflow in arithmetic operation")]
    MathOverflow, // 6003

    // =============================================================================
    // Oracle Errors (Code range: 6200-6299)
    // =============================================================================
    
    #[msg("Unsupported price oracle type")]
    UnsupportedOracle, // 6004
    
    #[msg("Invalid oracle account provided")]
    InvalidOracleAccount, // 6005
    
    #[msg("Oracle is in an invalid state")]
    InvalidOracleState, // 6006
    
    #[msg("Oracle price is too stale and exceeds maximum age threshold")]
    StaleOraclePrice, // 6007
    
    #[msg("Oracle price is invalid or outside acceptable bounds")]
    InvalidOraclePrice, // 6008

    #[msg("Oracle price feed returned an error or is unavailable")]
    PriceError, // 6009

    #[msg("Invalid EMA oracle configuration or data")]
    InvalidEmaOracle, // 6010
    
    #[msg("EMA oracle is required for this operation but not provided")]
    EmaOracleRequired, // 6011

    // =============================================================================
    // Environment and Configuration Errors (Code range: 6300-6399)
    // =============================================================================
    
    #[msg("This instruction is not allowed in the current environment")]
    InvalidEnvironment, // 6012

    // =============================================================================
    // State Validation Errors (Code range: 6400-6499)
    // =============================================================================
    
    #[msg("Pool is in an invalid state for this operation")]
    InvalidPoolState, // 6013
    
    #[msg("Custody account is in an invalid state")]
    InvalidCustodyState, // 6014
    
    #[msg("Invalid collateral custody specified")]
    InvalidCollateralCustody, // 6015
    
    #[msg("Position is in an invalid state for this operation")]
    InvalidPositionState, // 6016

    // =============================================================================
    // Configuration Errors (Code range: 6500-6599)
    // =============================================================================
    
    #[msg("Perpetuals configuration contains invalid parameters")]
    InvalidPerpetualsConfig, // 6017
    
    #[msg("Pool configuration contains invalid parameters")]
    InvalidPoolConfig, // 6018
    
    #[msg("Custody configuration contains invalid parameters")]
    InvalidCustodyConfig, // 6019

    // =============================================================================
    // Trading and Position Errors (Code range: 6600-6699)
    // =============================================================================
    
    #[msg("Insufficient token amount returned from the operation")]
    InsufficientAmountReturned, // 6020
    
    #[msg("Price slippage exceeds the maximum allowed limit")]
    MaxPriceSlippage, // 6021
    
    #[msg("Position leverage exceeds the maximum allowed limit")]
    MaxLeverage, // 6022
    
    #[msg("Position amount exceeds the maximum allowed limit for this custody")]
    PositionAmountLimit, // 6023

    // =============================================================================
    // Custody and Pool Limits (Code range: 6700-6799)
    // =============================================================================
    
    #[msg("Custody amount limit exceeded - operation would exceed maximum allowed amount")]
    CustodyAmountLimit, // 6024
    
    #[msg("Token ratio is outside the acceptable range for pool balance")]
    TokenRatioOutOfRange, // 6025
    
    #[msg("Token utilization exceeds the maximum allowed threshold")]
    MaxUtilization, // 6026

    // =============================================================================
    // Token and Asset Errors (Code range: 6800-6899)
    // =============================================================================
    
    #[msg("Token is not supported in this pool or operation")]
    UnsupportedToken, // 6027

    // =============================================================================
    // Permission and Access Errors (Code range: 6900-6999)
    // =============================================================================
    
    #[msg("This instruction is not allowed at this time due to permissions or market conditions")]
    InstructionNotAllowed, // 6028

    // =============================================================================
    // Market Hours and Trading Window Errors (Code range: 7000-7099)
    // =============================================================================
    
    #[msg("Market is currently closed - trading is not permitted outside market hours")]
    MarketClosed, // 6029
    
    #[msg("Trading hours configuration is invalid or malformed")]
    InvalidTradingHours, // 6030

    // =============================================================================
    // Permissionless Oracle Errors (Code range: 7100-7199)
    // =============================================================================
    
    #[msg("Permissionless oracle update requires Ed25519 signature verification instruction")]
    PermissionlessOracleMissingSignature, // 6031
    
    #[msg("Ed25519 signature verification data format is invalid or malformed")]
    PermissionlessOracleMalformedEd25519Data, // 6032
    
    #[msg("Ed25519 signature was not signed by the authorized oracle authority")]
    PermissionlessOracleSignerMismatch, // 6033
    
    #[msg("Signed message does not match the instruction parameters provided")]
    PermissionlessOracleMessageMismatch, // 6034

    // =============================================================================
    // Account and Data Errors (Code range: 7200-7299)
    // =============================================================================
    
    #[msg("Required account entry is missing from the account map")]
    AccountMapMissingEntry, // 6035
}
