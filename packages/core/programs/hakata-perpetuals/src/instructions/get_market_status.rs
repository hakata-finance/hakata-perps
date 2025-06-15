//! GetMarketStatus instruction handler
//! 
//! This instruction returns the current market status for a given asset,
//! including whether the market is open, closed, or in extended hours,
//! and whether trading operations are allowed.

use {
    crate::state::{
        custody::Custody,
        market_hours::MarketStatus,
        perpetuals::Perpetuals,
        pool::Pool,
    },
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct GetMarketStatus<'info> {
    #[account(
        seeds = [b"perpetuals"],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        seeds = [b"pool",
                 pool.name.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        seeds = [b"custody",
                 pool.key().as_ref(),
                 custody.mint.as_ref()],
        bump = custody.bump
    )]
    pub custody: Box<Account<'info, Custody>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetMarketStatusParams {}

/// Get current market status for an asset
/// Returns MarketStatus containing session type, trading permissions, and timing information
pub fn get_market_status(
    ctx: Context<GetMarketStatus>,
    _params: &GetMarketStatusParams,
) -> Result<MarketStatus> {
    let custody = &ctx.accounts.custody;
    let current_time = ctx.accounts.perpetuals.get_time()?;
    
    // Get market status from the custody's trading hours configuration
    let market_status = custody.get_market_status(current_time)?;
    
    msg!(
        "Market status for asset: session={:?}, allow_open={}, allow_close={}, trading_allowed={}",
        market_status.session,
        market_status.allow_open_position,
        market_status.allow_close_position,
        market_status.is_trading_allowed
    );
    
    if market_status.seconds_to_open > 0 {
        msg!("Market opens in {} seconds", market_status.seconds_to_open);
    }
    
    if market_status.seconds_to_close > 0 && market_status.seconds_to_close != u32::MAX {
        msg!("Market closes in {} seconds", market_status.seconds_to_close);
    }

    Ok(market_status)
} 