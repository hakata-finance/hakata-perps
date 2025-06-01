use {
    crate::{
        constants::{ADMIN_SEED, PERPETUALS_SEED},
        error::PerpetualsError,
        state::{admin::{Admin, Permissions}, multisig::Multisig, perpetuals::Perpetuals},
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Token,
};

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = Admin::SIZE,
        seeds = [
            ADMIN_SEED.as_bytes(),
            signer.key().as_ref(),
        ],
        bump
    )]
    pub superadmin: Account<'info, Admin>,

    #[account(
        init,
        payer = signer,
        space = Perpetuals::LEN,
        seeds = [
            PERPETUALS_SEED.as_bytes()
        ],
        bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone)]
pub struct InitParams {
    pub allow_swap: bool,
    pub allow_add_liquidity: bool,
    pub allow_remove_liquidity: bool,
    pub allow_open_position: bool,
    pub allow_close_position: bool,
    pub allow_pnl_withdrawal: bool,
    pub allow_collateral_withdrawal: bool,
    pub allow_size_change: bool,
}

pub fn init(
    ctx: Context<Init>, 
    params: &InitParams
) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let perpetuals = &mut ctx.accounts.perpetuals;
    let superadmin = &mut ctx.accounts.superadmin;

    superadmin.permissions = Permissions::Superadmin;
    superadmin.address = signer.key();

    perpetuals.permissions.allow_swap = params.allow_swap;
    perpetuals.permissions.allow_add_liquidity = params.allow_add_liquidity;
    perpetuals.permissions.allow_remove_liquidity = params.allow_remove_liquidity;
    perpetuals.permissions.allow_open_position = params.allow_open_position;
    perpetuals.permissions.allow_close_position = params.allow_close_position;
    perpetuals.permissions.allow_pnl_withdrawal = params.allow_pnl_withdrawal;
    perpetuals.permissions.allow_collateral_withdrawal = params.allow_collateral_withdrawal;
    perpetuals.permissions.allow_size_change = params.allow_size_change;
    perpetuals.perpetuals_bump = ctx.bumps.perpetuals;
    perpetuals.inception_time = perpetuals.get_time()?;

    if !perpetuals.validate() {
        return err!(PerpetualsError::InvalidPerpetualsConfig);
    }

    Ok(())
}
