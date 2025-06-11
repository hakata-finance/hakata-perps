use {
    crate::{
        constants::{LP_TOKEN_MINT_SEED, PERPETUALS_SEED, POOL_SEED},
        helpers::AccountMap,
        math,
        state::{
            perpetuals::Perpetuals,
            pool::{AumCalcMode, Pool},
        },
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Mint,
    num_traits::Zero,
};

#[derive(Accounts)]
pub struct GetLpTokenPrice<'info> {
    #[account(
        seeds = [PERPETUALS_SEED.as_bytes()],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        seeds = [POOL_SEED.as_bytes(),
                 pool.name.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        seeds = [LP_TOKEN_MINT_SEED.as_bytes(),
                 pool.key().as_ref()],
        bump = pool.lp_token_bump
    )]
    pub lp_token_mint: Box<Account<'info, Mint>>,
    // remaining accounts:
    //   pool.tokens.len() custody accounts (read-only, unsigned)
    //   pool.tokens.len() custody oracles (read-only, unsigned)
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetLpTokenPriceParams {}

pub fn get_lp_token_price(
    ctx: Context<GetLpTokenPrice>,
    _params: &GetLpTokenPriceParams,
) -> Result<u64> {
    let accounts_map = AccountMap::from_remaining_accounts(ctx.remaining_accounts);
    let clock = Clock::get()?;
    let aum_usd = math::checked_as_u64(ctx.accounts.pool.get_assets_under_management_usd(
        AumCalcMode::EMA,
        &accounts_map,
        &clock,
    )?)?;

    msg!("aum_usd: {}", aum_usd);

    let lp_supply = ctx.accounts.lp_token_mint.supply;

    msg!("lp_supply: {}", lp_supply);

    if lp_supply.is_zero() {
        return Ok(0);
    }

    let price_usd = math::checked_decimal_div(
        aum_usd,
        -(Perpetuals::USD_DECIMALS as i32),
        lp_supply,
        -(Perpetuals::LP_DECIMALS as i32),
        -(Perpetuals::USD_DECIMALS as i32),
    )?;

    msg!("price_usd: {}", price_usd);

    Ok(price_usd)
}
