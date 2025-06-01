use {
    crate::{
        constants::{PERPETUALS_SEED, POOL_SEED},
        helpers::AccountMap,
        state::{
            perpetuals::Perpetuals,
            pool::{AumCalcMode, Pool},
        },
    },
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct UpdatePoolAum<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [PERPETUALS_SEED.as_bytes()],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes(),
                 pool.name.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,
    // remaining accounts:
    //   pool.tokens.len() custody accounts (read-only, unsigned)
    //   pool.tokens.len() custody oracles (read-only, unsigned)
}

pub fn update_pool_aum(ctx: Context<UpdatePoolAum>) -> Result<u128> {
    let pool = ctx.accounts.pool.as_mut();

    let clock = Clock::get()?;

    // update pool stats
    msg!("Update pool asset under management");

    msg!("Previous value: {}", pool.aum_usd);

    let accounts_map = AccountMap::from_remaining_accounts(ctx.remaining_accounts);
    pool.aum_usd = pool.get_assets_under_management_usd(AumCalcMode::EMA, &accounts_map, &clock)?;

    msg!("Updated value: {}", pool.aum_usd);

    Ok(pool.aum_usd)
}
