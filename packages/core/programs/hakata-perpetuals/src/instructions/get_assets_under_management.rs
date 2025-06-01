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
pub struct GetAssetsUnderManagement<'info> {
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
    // remaining accounts:
    //   pool.tokens.len() custody accounts (read-only, unsigned)
    //   pool.tokens.len() custody oracles (read-only, unsigned)
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetAssetsUnderManagementParams {}

pub fn get_assets_under_management(
    ctx: Context<GetAssetsUnderManagement>,
    _params: &GetAssetsUnderManagementParams,
) -> Result<u128> {
    let accounts_map = AccountMap::from_remaining_accounts(ctx.remaining_accounts);
    let clock = Clock::get()?;
    ctx.accounts
        .pool
        .get_assets_under_management_usd(AumCalcMode::EMA, &accounts_map, &clock)
}
