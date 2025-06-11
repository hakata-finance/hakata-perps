use {
    crate::{
        constants::{CUSTODY_SEED, CUSTODY_TOKEN_ACCOUNT_SEED, PERPETUALS_SEED, POOL_SEED},
        error::PerpetualsError,
        state::{
            custody::{BorrowRateParams, Custody, Fees, Oracle, PricingParams},
            perpetuals::{Permissions, Perpetuals},
            pool::{Pool, TokenRatios},
        },
    },
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(
    args: AddCustodyParams
)]
pub struct AddCustody<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [
            PERPETUALS_SEED.as_bytes()
        ],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        mut,
        realloc = Pool::LEN + (pool.ratios.len() + 1) * std::mem::size_of::<TokenRatios>(),
        realloc::payer = signer,
        realloc::zero = false,
        seeds = [
            POOL_SEED.as_bytes(),
            &args.pool_id.to_le_bytes()
        ],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init,
        payer = signer,
        space = Custody::LEN,
        seeds = [
            CUSTODY_SEED.as_bytes(),
            pool.key().as_ref(),
            custody_token_mint.key().as_ref()
        ],
        bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    #[account(
        init,
        payer = signer,
        token::mint = custody_token_mint,
        token::authority = custody,
        seeds = [
            CUSTODY_TOKEN_ACCOUNT_SEED.as_bytes(),
            pool.key().as_ref(),
            custody_token_mint.key().as_ref()
        ],
        bump
    )]
    pub custody_token_account: Box<Account<'info, TokenAccount>>,

    #[account()]
    pub custody_token_mint: Box<Account<'info, Mint>>,

    /// CHECK: We're deserializing and validating it later
    #[account()]
    pub oracle_account: AccountInfo<'info>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddCustodyParams {
    pub pool_id: u64,
    pub is_stable: bool,
    pub is_virtual: bool,
    pub pricing: PricingParams,
    pub permissions: Permissions,
    pub fees: Fees,
    pub borrow_rate: BorrowRateParams,
    pub ratios: Vec<TokenRatios>,
}

pub fn add_custody<'info>(
    ctx: Context<'_, '_, '_, 'info, AddCustody<'info>>,
    params: &AddCustodyParams,
) -> Result<u8> {
    if params.ratios.len() != ctx.accounts.pool.ratios.len() + 1 {
        return Err(ProgramError::InvalidArgument.into());
    }

    let pool = ctx.accounts.pool.as_mut();

    pool.custodies.push(ctx.accounts.custody.key());
    // Adding new custody will overwrite `ratios` sitting in the pool.
    // Possibly an attack vector in case of fully permissionless market.
    pool.ratios = params.ratios.clone();
    if !pool.validate() {
        return err!(PerpetualsError::InvalidPoolConfig);
    }

    let clock = Clock::get()?;
    let custody = ctx.accounts.custody.as_mut();
    let oracle_account = &ctx.accounts.oracle_account;

    let oracle = Oracle::from_account_info(oracle_account, &clock)?;
    custody.oracle = oracle;
    custody.pool = pool.key();
    custody.mint = ctx.accounts.custody_token_mint.key();
    custody.token_account = ctx.accounts.custody_token_account.key();
    custody.decimals = ctx.accounts.custody_token_mint.decimals;
    custody.is_stable = params.is_stable;
    custody.is_virtual = params.is_virtual;
    custody.pricing = params.pricing;
    custody.permissions = params.permissions;
    custody.fees = params.fees;
    custody.borrow_rate = params.borrow_rate;
    custody.borrow_rate_state.current_rate = params.borrow_rate.base_rate;
    custody.borrow_rate_state.last_update = ctx.accounts.perpetuals.get_time()?;
    custody.bump = ctx.bumps.custody;
    custody.token_account_bump = ctx.bumps.custody_token_account;

    if !custody.validate() {
        err!(PerpetualsError::InvalidCustodyConfig)
    } else {
        Ok(0)
    }
}
