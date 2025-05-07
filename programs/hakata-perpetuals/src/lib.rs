#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("6wCkVSLvphXyQphT8xDemkx92caLJXcaFF9qjxxL2o8Q");

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
