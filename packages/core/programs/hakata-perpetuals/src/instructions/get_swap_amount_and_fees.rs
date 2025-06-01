use {
    crate::{
        constants::{CUSTODY_SEED, PERPETUALS_SEED, POOL_SEED},
        oracle::OraclePrice,
        state::{
            custody::Custody,
            perpetuals::{Perpetuals, SwapAmountAndFees},
            pool::Pool,
        },
    },
    anchor_lang::prelude::*,
    solana_program::program_error::ProgramError,
};

#[derive(Accounts)]
pub struct GetSwapAmountAndFees<'info> {
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
        seeds = [CUSTODY_SEED.as_bytes(),
                 pool.key().as_ref(),
                 receiving_custody.mint.as_ref()],
        bump = receiving_custody.bump
    )]
    pub receiving_custody: Box<Account<'info, Custody>>,

    /// CHECK: oracle account for the received token
    #[account(
        constraint = receiving_custody_oracle_account.key() == receiving_custody.oracle.key()
    )]
    pub receiving_custody_oracle_account: AccountInfo<'info>,

    #[account(
        seeds = [CUSTODY_SEED.as_bytes(),
                 pool.key().as_ref(),
                 dispensing_custody.mint.as_ref()],
        bump = dispensing_custody.bump
    )]
    pub dispensing_custody: Box<Account<'info, Custody>>,

    /// CHECK: oracle account for the returned token
    #[account(
        constraint = dispensing_custody_oracle_account.key() == dispensing_custody.oracle.key()
    )]
    pub dispensing_custody_oracle_account: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetSwapAmountAndFeesParams {
    amount_in: u64,
}

pub fn get_swap_amount_and_fees(
    ctx: Context<GetSwapAmountAndFees>,
    params: &GetSwapAmountAndFeesParams,
) -> Result<SwapAmountAndFees> {
    // validate inputs
    msg!("Validate inputs");
    if params.amount_in == 0 {
        return Err(ProgramError::InvalidArgument.into());
    }
    require_keys_neq!(
        ctx.accounts.receiving_custody.key(),
        ctx.accounts.dispensing_custody.key()
    );

    // compute token amount returned to the user
    let clock = Clock::get()?;
    let pool = &ctx.accounts.pool;
    let token_id_in = pool.get_token_id(&ctx.accounts.receiving_custody.key())?;
    let token_id_out = pool.get_token_id(&ctx.accounts.dispensing_custody.key())?;
    let receiving_custody = &ctx.accounts.receiving_custody;
    let dispensing_custody = &ctx.accounts.dispensing_custody;

    let received_token_price = OraclePrice::new_from_oracle(
        &ctx.accounts
            .receiving_custody_oracle_account
            .to_account_info(),
        &clock,
        receiving_custody.oracle,
        false,
    )?;

    let received_token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts
            .receiving_custody_oracle_account
            .to_account_info(),
        &clock,
        receiving_custody.oracle,
        receiving_custody.pricing.use_ema,
    )?;

    let dispensed_token_price = OraclePrice::new_from_oracle(
        &ctx.accounts
            .dispensing_custody_oracle_account
            .to_account_info(),
        &clock,
        dispensing_custody.oracle,
        false,
    )?;

    let dispensed_token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts
            .dispensing_custody_oracle_account
            .to_account_info(),
        &clock,
        dispensing_custody.oracle,
        dispensing_custody.pricing.use_ema,
    )?;

    let amount_out = pool.get_swap_amount(
        &received_token_price,
        &received_token_ema_price,
        &dispensed_token_price,
        &dispensed_token_ema_price,
        receiving_custody,
        dispensing_custody,
        params.amount_in,
    )?;

    // calculate fee
    let fees = pool.get_swap_fees(
        token_id_in,
        token_id_out,
        params.amount_in,
        amount_out,
        receiving_custody,
        &received_token_price,
        dispensing_custody,
        &dispensed_token_price,
    )?;

    Ok(SwapAmountAndFees {
        amount_out,
        fee_in: fees.0,
        fee_out: fees.1,
    })
}
