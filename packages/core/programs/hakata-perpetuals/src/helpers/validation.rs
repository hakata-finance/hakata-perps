use anchor_lang::prelude::*;
use crate::constants::*;
use crate::error::PerpetualsError;

/// Common validation functions used throughout the Hakata Perpetuals protocol
/// 
/// This module provides reusable validation logic to ensure consistency
/// across different instructions and reduce code duplication.

/// Validates that a percentage value is within valid bounds (0-100%)
/// 
/// # Arguments
/// * `percentage_bps` - Percentage value in basis points (0-10000)
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if invalid
pub fn validate_percentage_bps(percentage_bps: u64) -> Result<()> {
    require!(
        percentage_bps <= BPS_DENOMINATOR,
        PerpetualsError::InvalidPerpetualsConfig
    );
    Ok(())
}

/// Validates that a timestamp is not too far in the past or future
/// 
/// # Arguments
/// * `timestamp` - Unix timestamp to validate
/// * `current_time` - Current unix timestamp
/// * `max_age_seconds` - Maximum allowed age in seconds
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if too stale
pub fn validate_timestamp_freshness(
    timestamp: i64,
    current_time: i64,
    max_age_seconds: u64,
) -> Result<()> {
    let age = current_time.saturating_sub(timestamp);
    require!(
        age >= 0 && age <= max_age_seconds as i64,
        PerpetualsError::StaleOraclePrice
    );
    Ok(())
}

/// Validates that an amount is within reasonable bounds
/// 
/// # Arguments
/// * `amount` - Amount to validate
/// * `min_amount` - Minimum allowed amount
/// * `max_amount` - Maximum allowed amount
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if out of bounds
pub fn validate_amount_bounds(amount: u64, min_amount: u64, max_amount: u64) -> Result<()> {
    require!(
        amount >= min_amount && amount <= max_amount,
        PerpetualsError::PositionAmountLimit
    );
    Ok(())
}

/// Validates that a leverage value is within acceptable bounds
/// 
/// # Arguments
/// * `leverage_bps` - Leverage in basis points
/// * `min_leverage_bps` - Minimum allowed leverage in basis points
/// * `max_leverage_bps` - Maximum allowed leverage in basis points
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if out of bounds
pub fn validate_leverage(
    leverage_bps: u64,
    min_leverage_bps: u64,
    max_leverage_bps: u64,
) -> Result<()> {
    require!(
        leverage_bps >= min_leverage_bps && leverage_bps <= max_leverage_bps,
        PerpetualsError::MaxLeverage
    );
    Ok(())
}

/// Validates that oracle confidence is within acceptable bounds
/// 
/// # Arguments
/// * `confidence_bps` - Oracle confidence in basis points
/// * `max_confidence_bps` - Maximum allowed confidence in basis points
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if confidence too high
pub fn validate_oracle_confidence(confidence_bps: u64, max_confidence_bps: u64) -> Result<()> {
    require!(
        confidence_bps <= max_confidence_bps,
        PerpetualsError::InvalidOraclePrice
    );
    Ok(())
}

/// Validates that a price is positive and within reasonable bounds
/// 
/// # Arguments
/// * `price` - Price to validate
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if invalid
pub fn validate_price(price: u64) -> Result<()> {
    require!(price > 0, PerpetualsError::InvalidOraclePrice);
    Ok(())
}

/// Validates that a token ratio is within the acceptable range
/// 
/// # Arguments
/// * `current_ratio_bps` - Current ratio in basis points
/// * `min_ratio_bps` - Minimum allowed ratio in basis points
/// * `max_ratio_bps` - Maximum allowed ratio in basis points
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if out of range
pub fn validate_token_ratio(
    current_ratio_bps: u64,
    min_ratio_bps: u64,
    max_ratio_bps: u64,
) -> Result<()> {
    require!(
        current_ratio_bps >= min_ratio_bps && current_ratio_bps <= max_ratio_bps,
        PerpetualsError::TokenRatioOutOfRange
    );
    Ok(())
}

/// Validates that utilization is within acceptable bounds
/// 
/// # Arguments
/// * `utilization_bps` - Current utilization in basis points
/// * `max_utilization_bps` - Maximum allowed utilization in basis points
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if exceeds maximum
pub fn validate_utilization(utilization_bps: u64, max_utilization_bps: u64) -> Result<()> {
    require!(
        utilization_bps <= max_utilization_bps,
        PerpetualsError::MaxUtilization
    );
    Ok(())
}

/// Validates that a minimum position size requirement is met
/// 
/// # Arguments
/// * `position_size_usd` - Position size in USD (with decimals)
/// * `min_position_size_usd` - Minimum required position size in USD
/// 
/// # Returns
/// * `Result<()>` - Ok if valid, Err if too small
pub fn validate_minimum_position_size(
    position_size_usd: u64,
    min_position_size_usd: u64,
) -> Result<()> {
    require!(
        position_size_usd >= min_position_size_usd,
        PerpetualsError::PositionAmountLimit
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_percentage_bps() {
        // Valid percentages
        assert!(validate_percentage_bps(0).is_ok());
        assert!(validate_percentage_bps(5000).is_ok()); // 50%
        assert!(validate_percentage_bps(BPS_DENOMINATOR).is_ok()); // 100%

        // Invalid percentage
        assert!(validate_percentage_bps(BPS_DENOMINATOR + 1).is_err());
    }

    #[test]
    fn test_validate_price() {
        // Valid prices
        assert!(validate_price(1).is_ok());
        assert!(validate_price(1000000).is_ok());

        // Invalid price
        assert!(validate_price(0).is_err());
    }

    #[test]
    fn test_validate_amount_bounds() {
        // Valid amounts
        assert!(validate_amount_bounds(500, 100, 1000).is_ok());
        assert!(validate_amount_bounds(100, 100, 1000).is_ok()); // Min boundary
        assert!(validate_amount_bounds(1000, 100, 1000).is_ok()); // Max boundary

        // Invalid amounts
        assert!(validate_amount_bounds(50, 100, 1000).is_err()); // Below min
        assert!(validate_amount_bounds(1500, 100, 1000).is_err()); // Above max
    }
} 