#![allow(unexpected_cfgs)]

pub mod error;
pub mod math;
pub mod state;

use anchor_lang::prelude::*;

declare_id!("6wCkVSLvphXyQphT8xDemkx92caLJXcaFF9qjxxL2o8Q");

#[macro_export]
macro_rules! try_from {
    // https://github.com/coral-xyz/anchor/pull/2770
    ($ty: ty, $acc: expr) => {
        <$ty>::try_from(unsafe { core::mem::transmute::<_, &AccountInfo<'_>>($acc.as_ref()) })
    };
}

#[program]
pub mod hakata_perpetuals {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
