//! OpenPosition instruction handler

use {
    crate::{
        constants::{
            CUSTODY_SEED, CUSTODY_TOKEN_ACCOUNT_SEED, PERPETUALS_SEED, POOL_SEED, POSITION_SEED,
        },
        error::PerpetualsError,
        math,
        oracle::OraclePrice,
        state::{
            custody::Custody,
            perpetuals::Perpetuals,
            pool::Pool,
            position::{Position, Side},
        },
    },
    anchor_lang::prelude::*,
    anchor_spl::token::{Token, TokenAccount},
    solana_program::program_error::ProgramError,
};

#[derive(Accounts)]
#[instruction(params: OpenPositionParams)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        constraint = funding_account.mint == collateral_custody.mint,
        has_one = owner
    )]
    pub funding_account: Box<Account<'info, TokenAccount>>,

    #[account(
        seeds = [
            PERPETUALS_SEED.as_bytes()
        ],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        mut,
        seeds = [
            POOL_SEED.as_bytes(),
            &params.pool_id.to_le_bytes()
        ],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init,
        payer = owner,
        space = Position::LEN,
        seeds = [
            POSITION_SEED.as_bytes(),
            owner.key().as_ref(),
            pool.key().as_ref(),
            custody.key().as_ref(),
            &[params.side as u8]
        ],
        bump
    )]
    pub position: Box<Account<'info, Position>>,

    #[account(
        mut,
        seeds = [
            CUSTODY_SEED.as_bytes(),
            pool.key().as_ref(),
            custody.mint.as_ref()
        ],
        bump = custody.bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    /// CHECK: oracle account for the position token
    #[account(
        address = custody.oracle.key()
    )]
    pub custody_oracle_account: AccountInfo<'info>,

    // If main oracle is Switchboard, EMA is not present in the account by default.
    // We're using separate aggregator account for EMA oracles.
    // This oracle is dependent on the main oracle, so it cant be aggregated in one account.
    #[account(
        mut,
        constraint = custody.ema_oracle.is_none() || Some(custody_ema_oracle_account.key()) == custody.ema_oracle.map(|o| o.key()) @ PerpetualsError::InvalidEmaOracle
    )]
    pub custody_ema_oracle_account: Option<AccountInfo<'info>>,

    #[account(
        mut,
        seeds = [
            CUSTODY_SEED.as_bytes(),
            pool.key().as_ref(),
            collateral_custody.mint.as_ref()
        ],
        bump = collateral_custody.bump
    )]
    pub collateral_custody: Box<Account<'info, Custody>>,

    /// CHECK: oracle account for the collateral token
    #[account(
        address = collateral_custody.oracle.key()
    )]
    pub collateral_custody_oracle_account: AccountInfo<'info>,

    // If main oracle is Switchboard, EMA is not present in the account by default.
    // We're using separate aggregator account for EMA oracles.
    // This oracle is dependent on the main oracle, so it cant be aggregated in one account.
    #[account(
        mut,
        constraint = collateral_custody.ema_oracle.is_none() || Some(collateral_custody_ema_oracle_account.key()) == collateral_custody.ema_oracle.map(|o| o.key()) @ PerpetualsError::InvalidEmaOracle
    )]
    pub collateral_custody_ema_oracle_account: Option<AccountInfo<'info>>,

    #[account(
        mut,
        seeds = [
            CUSTODY_TOKEN_ACCOUNT_SEED.as_bytes(),
            pool.key().as_ref(),
            collateral_custody.mint.as_ref()
        ],
        bump = collateral_custody.token_account_bump
    )]
    pub collateral_custody_token_account: Box<Account<'info, TokenAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct OpenPositionParams {
    pub pool_id: u64,
    pub price: u64,
    pub collateral: u64,
    pub size: u64,
    pub side: Side,
}

pub fn open_position(ctx: Context<OpenPosition>, params: &OpenPositionParams) -> Result<()> {
    // check permissions
    msg!("Check permissions");
    let perpetuals = ctx.accounts.perpetuals.as_mut();
    let custody = ctx.accounts.custody.as_mut();
    let collateral_custody = ctx.accounts.collateral_custody.as_mut();
    require!(
        perpetuals.permissions.allow_open_position
            && custody.permissions.allow_open_position
            && !custody.is_stable, // can't long/short stablecoins i guess?
        PerpetualsError::InstructionNotAllowed
    );

    // Validate ema oracle
    if custody.needs_ema_oracle() {
        let custody_ema_oracle = &ctx.accounts.custody_ema_oracle_account;

        require!(
            custody_ema_oracle.is_some(),
            PerpetualsError::EmaOracleRequired
        );
    }

    // validate inputs
    msg!("Validate inputs");
    if params.price == 0 || params.collateral == 0 || params.size == 0 || params.side == Side::None
    {
        return Err(ProgramError::InvalidArgument.into());
    }
    // If short, always use collateral custody. Otherwise:
    // What does `is_virtual` mean? Claude says it's virtual representation of pre-approved
    // wallet spendings, not sure if this exists.
    let use_collateral_custody = params.side == Side::Short || custody.is_virtual;

    // Collateral custody will be used:
    // - always if trader is short,
    // - if they're long, only if the collateral is virtual.

    if use_collateral_custody {
        // Collateral cant be the same as market
        require_keys_neq!(custody.key(), collateral_custody.key());
        require!(
            // Collateral must be a stablecoin and can't be virtual.
            collateral_custody.is_stable && !collateral_custody.is_virtual,
            PerpetualsError::InvalidCollateralCustody
        );
        // Only if trader's long and collateral custody is virtual.
    } else {
        require_keys_eq!(custody.key(), collateral_custody.key());
    };
    let position = ctx.accounts.position.as_mut();
    let pool = ctx.accounts.pool.as_mut();

    // compute position price
    let curtime = perpetuals.get_time()?;

    let clock = &Clock::get()?;

    let (token_price, token_ema_price) = custody.oracle.extract_prices(
        &ctx.accounts.custody_oracle_account,
        &ctx.accounts.custody_ema_oracle_account,
        clock,
    )?;

    let (collateral_price, collateral_ema_price) = custody.oracle.extract_prices(
        &ctx.accounts.collateral_custody_oracle_account,
        &ctx.accounts.collateral_custody_ema_oracle_account,
        clock,
    )?;

    let min_collateral_price =
        collateral_price.get_min_price(&collateral_ema_price, collateral_custody.is_stable)?;

    let position_price =
        pool.get_entry_price(&token_price, &token_ema_price, params.side, custody)?;

    if params.side == Side::Long {
        require_gte!(
            params.price,
            position_price,
            PerpetualsError::MaxPriceSlippage
        );
    } else {
        require_gte!(
            position_price,
            params.price,
            PerpetualsError::MaxPriceSlippage
        );
    }

    // compute position parameters
    let position_oracle_price = OraclePrice {
        price: position_price,
        exponent: -(Perpetuals::PRICE_DECIMALS as i32),
    };
    let size_usd = position_oracle_price.get_asset_amount_usd(params.size, custody.decimals)?;
    let collateral_usd = min_collateral_price
        .get_asset_amount_usd(params.collateral, collateral_custody.decimals)?;

    let locked_amount = if use_collateral_custody {
        custody.get_locked_amount(
            min_collateral_price.get_token_amount(size_usd, collateral_custody.decimals)?,
            params.side,
        )?
    } else {
        custody.get_locked_amount(params.size, params.side)?
    };

    // Sort out the max_payoff
    let borrow_size_usd = if custody.pricing.max_payoff_mult as u128 != Perpetuals::BPS_POWER {
        if use_collateral_custody {
            let max_collateral_price = if collateral_price < collateral_ema_price {
                collateral_ema_price
            } else {
                collateral_price
            };
            max_collateral_price.get_asset_amount_usd(locked_amount, collateral_custody.decimals)?
        } else {
            position_oracle_price.get_asset_amount_usd(locked_amount, custody.decimals)?
        }
    } else {
        size_usd
    };

    // compute fee
    let mut fee_amount = pool.get_entry_fee(
        custody.fees.open_position,
        params.size,
        locked_amount,
        collateral_custody,
    )?;
    let fee_amount_usd = token_ema_price.get_asset_amount_usd(fee_amount, custody.decimals)?;
    if use_collateral_custody {
        fee_amount =
            collateral_ema_price.get_token_amount(fee_amount_usd, collateral_custody.decimals)?;
    }
    msg!("Collected fee: {}", fee_amount);

    // compute amount to transfer
    let transfer_amount = math::checked_add(params.collateral, fee_amount)?;
    msg!("Amount in: {}", transfer_amount);

    // init new position
    msg!("Initialize new position");
    position.owner = ctx.accounts.owner.key();
    position.pool = pool.key();
    position.custody = custody.key();
    position.collateral_custody = collateral_custody.key();
    position.open_time = perpetuals.get_time()?;
    position.update_time = 0;
    position.side = params.side;
    position.price = position_price;
    position.size_usd = size_usd;
    position.borrow_size_usd = borrow_size_usd;
    position.collateral_usd = collateral_usd;
    position.unrealized_profit_usd = 0;
    position.unrealized_loss_usd = 0;
    position.cumulative_interest_snapshot = collateral_custody.get_cumulative_interest(curtime)?;
    position.locked_amount = locked_amount;
    position.collateral_amount = params.collateral;
    position.bump = ctx.bumps.position;

    // check position risk
    msg!("Check position risks");
    require!(
        position.locked_amount > 0,
        PerpetualsError::InsufficientAmountReturned
    );
    require!(
        pool.check_leverage(
            position,
            &token_price,
            &token_ema_price,
            custody,
            &collateral_price,
            &collateral_ema_price,
            collateral_custody,
            curtime,
            true
        )?,
        PerpetualsError::MaxLeverage
    );

    // lock funds for potential profit payoff
    collateral_custody.lock_funds(position.locked_amount)?;

    // transfer tokens
    msg!("Transfer tokens");
    perpetuals.transfer_tokens_from_user(
        ctx.accounts.funding_account.to_account_info(),
        ctx.accounts
            .collateral_custody_token_account
            .to_account_info(),
        ctx.accounts.owner.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        transfer_amount,
    )?;

    // update custody stats
    msg!("Update custody stats");
    collateral_custody.collected_fees.open_position_usd = collateral_custody
        .collected_fees
        .open_position_usd
        .wrapping_add(fee_amount_usd);

    collateral_custody.assets.collateral =
        math::checked_add(collateral_custody.assets.collateral, params.collateral)?;

    let protocol_fee = Pool::get_fee_amount(custody.fees.protocol_share, fee_amount)?;
    collateral_custody.assets.protocol_fees =
        math::checked_add(collateral_custody.assets.protocol_fees, protocol_fee)?;

    // if custody and collateral_custody accounts are the same, ensure that data is in sync
    if position.side == Side::Long && !custody.is_virtual {
        collateral_custody.volume_stats.open_position_usd = collateral_custody
            .volume_stats
            .open_position_usd
            .wrapping_add(size_usd);

        if params.side == Side::Long {
            collateral_custody.trade_stats.oi_long_usd =
                math::checked_add(collateral_custody.trade_stats.oi_long_usd, size_usd)?;
        } else {
            collateral_custody.trade_stats.oi_short_usd =
                math::checked_add(collateral_custody.trade_stats.oi_short_usd, size_usd)?;
        }

        collateral_custody.add_position(position, &token_ema_price, curtime, None)?;
        collateral_custody.update_borrow_rate(curtime)?;
        *custody = collateral_custody.clone();
    } else {
        custody.volume_stats.open_position_usd = custody
            .volume_stats
            .open_position_usd
            .wrapping_add(size_usd);

        if params.side == Side::Long {
            custody.trade_stats.oi_long_usd =
                math::checked_add(custody.trade_stats.oi_long_usd, size_usd)?;
        } else {
            custody.trade_stats.oi_short_usd =
                math::checked_add(custody.trade_stats.oi_short_usd, size_usd)?;
        }

        custody.add_position(
            position,
            &token_ema_price,
            curtime,
            Some(collateral_custody),
        )?;
        collateral_custody.update_borrow_rate(curtime)?;
    }

    Ok(())
}
