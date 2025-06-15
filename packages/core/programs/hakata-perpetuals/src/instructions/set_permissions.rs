use {
    crate::{
        constants::PERPETUALS_SEED,
        error::PerpetualsError,
        state::{
            admin::{Admin, Permissions},
            perpetuals::Perpetuals,
        },
    },
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct SetPermissions<'info> {
    #[account()]
    pub signer: Signer<'info>,

    #[account(
        constraint = admin.has_permissions(Permissions::ChangePermissions)
    )]
    pub admin: Account<'info, Admin>,

    #[account(
        mut,
        seeds = [
            PERPETUALS_SEED.as_bytes()
        ],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetPermissionsParams {
    pub allow_swap: bool,
    pub allow_add_liquidity: bool,
    pub allow_remove_liquidity: bool,
    pub allow_open_position: bool,
    pub allow_close_position: bool,
    pub allow_pnl_withdrawal: bool,
    pub allow_collateral_withdrawal: bool,
    pub allow_size_change: bool,
}

pub fn set_permissions<'info>(
    ctx: Context<'_, '_, '_, 'info, SetPermissions<'info>>,
    params: &SetPermissionsParams,
) -> Result<u8> {
    // update permissions
    let perpetuals = ctx.accounts.perpetuals.as_mut();
    perpetuals.permissions.allow_swap = params.allow_swap;
    perpetuals.permissions.allow_add_liquidity = params.allow_add_liquidity;
    perpetuals.permissions.allow_remove_liquidity = params.allow_remove_liquidity;
    perpetuals.permissions.allow_open_position = params.allow_open_position;
    perpetuals.permissions.allow_close_position = params.allow_close_position;
    perpetuals.permissions.allow_pnl_withdrawal = params.allow_pnl_withdrawal;
    perpetuals.permissions.allow_collateral_withdrawal = params.allow_collateral_withdrawal;
    perpetuals.permissions.allow_size_change = params.allow_size_change;

    if !perpetuals.validate() {
        err!(PerpetualsError::InvalidPerpetualsConfig)
    } else {
        Ok(0)
    }
}
