use {
    crate::{
        constants::{
            ADMIN_SEED, CUSTODY_SEED, CUSTODY_TOKEN_ACCOUNT_SEED, PERPETUALS_SEED, POOL_SEED,
        },
        state::{admin::Admin, custody::Custody, perpetuals::Perpetuals, pool::Pool},
    },
    anchor_lang::prelude::*,
    anchor_spl::token::{Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(
    args: WithdrawFeesParams
)]
pub struct WithdrawFees<'info> {
    #[account()]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            ADMIN_SEED.as_bytes(),
            signer.key().as_ref()
        ],
        bump = admin.bump,
    )]
    pub admin: Account<'info, Admin>,

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
           & args.pool_id.to_le_bytes()
        ],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        mut,
        seeds = [
            CUSTODY_SEED.as_bytes(),
            pool.key().as_ref(),
            custody.mint.key().as_ref()
        ],
        bump = custody.bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    #[account(
        mut,
        seeds = [
            CUSTODY_TOKEN_ACCOUNT_SEED.as_bytes(),
            pool.key().as_ref(),
            custody.mint.as_ref()
        ],
        bump = custody.token_account_bump
    )]
    pub custody_token_account: Box<Account<'info, TokenAccount>>,

    /// Should we add token constraints here to be owned by admin?
    #[account(
        mut,
        constraint = receiving_token_account.mint == custody_token_account.mint
    )]
    pub receiving_token_account: Box<Account<'info, TokenAccount>>,

    token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WithdrawFeesParams {
    pub pool_id: u64,
}

pub fn withdraw_fees<'info>(
    ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
    _params: &WithdrawFeesParams,
) -> Result<u8> {
    // transfer token fees from the custody to the receiver
    ctx.accounts.custody.withdraw_fees(
        ctx.accounts.custody_token_account.to_account_info(),
        ctx.accounts.receiving_token_account.to_account_info(),
        ctx.accounts.custody.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    )?;

    // ctx.accounts.perpetuals.transfer_tokens(
    //     ctx.accounts.custody_token_account.to_account_info(),
    //     ctx.accounts.receiving_token_account.to_account_info(),
    //     ctx.accounts.transfer_authority.to_account_info(),
    //     ctx.accounts.token_program.to_account_info(),
    //     custody.assets.protocol_fees,
    // )?;

    Ok(0)
}
