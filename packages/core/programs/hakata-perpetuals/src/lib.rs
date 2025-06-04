#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod math;
pub mod oracle;
pub mod state;
pub mod helpers;

use {
    anchor_lang::prelude::*,
    instructions::*,
    state::perpetuals::{
        AmountAndFee, NewPositionPricesAndFee, PriceAndFee, ProfitAndLoss, SwapAmountAndFees,
    },
};

solana_security_txt::security_txt! {
    name: "Hakata Perps",
    project_url: "https://github.com/hakata-finance/hakata-perps",
    contacts: "email:admin@hakata.fi",
    policy: "",
    preferred_languages: "en"
}

declare_id!("CkawHJw5TVjUt1ggAZtuo3hgHBMptJHtxXk6A6nY5RWg");

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

    // admin instructions
    pub fn init(ctx: Context<Init>, params: InitParams) -> Result<()> {
        instructions::init(ctx, &params)
    }

    pub fn add_pool<'info>(
        ctx: Context<'_, '_, '_, 'info, AddPool<'info>>,
        params: AddPoolParams,
    ) -> Result<u8> {
        instructions::add_pool(ctx, &params)
    }

    // Pools should never be removed from the protocol.
    // pub fn remove_pool<'info>(
    //     ctx: Context<'_, '_, '_, 'info, RemovePool<'info>>,
    //     params: RemovePoolParams,
    // ) -> Result<u8> {
    //     instructions::remove_pool(ctx, &params)
    // }

    pub fn add_custody<'info>(
        ctx: Context<'_, '_, '_, 'info, AddCustody<'info>>,
        params: AddCustodyParams,
    ) -> Result<u8> {
        instructions::add_custody(ctx, &params)
    }

    pub fn set_custody_config<'info>(
        ctx: Context<'_, '_, '_, 'info, SetCustodyConfig<'info>>,
        params: SetCustodyConfigParams,
    ) -> Result<u8> {
        instructions::set_custody_config(ctx, &params)
    }

    pub fn set_permissions<'info>(
        ctx: Context<'_, '_, '_, 'info, SetPermissions<'info>>,
        params: SetPermissionsParams,
    ) -> Result<u8> {
        instructions::set_permissions(ctx, &params)
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
        params: WithdrawFeesParams,
    ) -> Result<u8> {
        instructions::withdraw_fees(ctx, &params)
    }

    pub fn withdraw_sol_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawSolFees<'info>>,
        params: WithdrawSolFeesParams,
    ) -> Result<u8> {
        instructions::withdraw_sol_fees(ctx, &params)
    }

    // test instructions

    pub fn set_test_time<'info>(
        ctx: Context<'_, '_, '_, 'info, SetTestTime<'info>>,
        params: SetTestTimeParams,
    ) -> Result<u8> {
        instructions::set_test_time(ctx, &params)
    }

    // public instructions

    // Should swaps even be enabled?
    pub fn swap(ctx: Context<Swap>, params: SwapParams) -> Result<()> {
        instructions::swap(ctx, &params)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, params: AddLiquidityParams) -> Result<()> {
        instructions::add_liquidity(ctx, &params)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        params: RemoveLiquidityParams,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx, &params)
    }

    pub fn open_position(ctx: Context<OpenPosition>, params: OpenPositionParams) -> Result<()> {
        instructions::open_position(ctx, &params)
    }

    pub fn add_collateral(ctx: Context<AddCollateral>, params: AddCollateralParams) -> Result<()> {
        instructions::add_collateral(ctx, &params)
    }

    pub fn remove_collateral(
        ctx: Context<RemoveCollateral>,
        params: RemoveCollateralParams,
    ) -> Result<()> {
        instructions::remove_collateral(ctx, &params)
    }

    pub fn close_position(ctx: Context<ClosePosition>, params: ClosePositionParams) -> Result<()> {
        instructions::close_position(ctx, &params)
    }

    pub fn liquidate(ctx: Context<Liquidate>, params: LiquidateParams) -> Result<()> {
        instructions::liquidate(ctx, &params)
    }

    pub fn update_pool_aum(ctx: Context<UpdatePoolAum>) -> Result<u128> {
        instructions::update_pool_aum(ctx)
    }

    pub fn get_add_liquidity_amount_and_fee(
        ctx: Context<GetAddLiquidityAmountAndFee>,
        params: GetAddLiquidityAmountAndFeeParams,
    ) -> Result<AmountAndFee> {
        instructions::get_add_liquidity_amount_and_fee(ctx, &params)
    }

    pub fn get_remove_liquidity_amount_and_fee(
        ctx: Context<GetRemoveLiquidityAmountAndFee>,
        params: GetRemoveLiquidityAmountAndFeeParams,
    ) -> Result<AmountAndFee> {
        instructions::get_remove_liquidity_amount_and_fee(ctx, &params)
    }

    pub fn get_entry_price_and_fee(
        ctx: Context<GetEntryPriceAndFee>,
        params: GetEntryPriceAndFeeParams,
    ) -> Result<NewPositionPricesAndFee> {
        instructions::get_entry_price_and_fee(ctx, &params)
    }

    pub fn get_exit_price_and_fee(
        ctx: Context<GetExitPriceAndFee>,
        params: GetExitPriceAndFeeParams,
    ) -> Result<PriceAndFee> {
        instructions::get_exit_price_and_fee(ctx, &params)
    }

    pub fn get_pnl(ctx: Context<GetPnl>, params: GetPnlParams) -> Result<ProfitAndLoss> {
        instructions::get_pnl(ctx, &params)
    }

    pub fn get_liquidation_price(
        ctx: Context<GetLiquidationPrice>,
        params: GetLiquidationPriceParams,
    ) -> Result<u64> {
        instructions::get_liquidation_price(ctx, &params)
    }

    pub fn get_liquidation_state(
        ctx: Context<GetLiquidationState>,
        params: GetLiquidationStateParams,
    ) -> Result<u8> {
        instructions::get_liquidation_state(ctx, &params)
    }

    pub fn get_swap_amount_and_fees(
        ctx: Context<GetSwapAmountAndFees>,
        params: GetSwapAmountAndFeesParams,
    ) -> Result<SwapAmountAndFees> {
        instructions::get_swap_amount_and_fees(ctx, &params)
    }

    pub fn get_assets_under_management(
        ctx: Context<GetAssetsUnderManagement>,
        params: GetAssetsUnderManagementParams,
    ) -> Result<u128> {
        instructions::get_assets_under_management(ctx, &params)
    }

    pub fn get_lp_token_price(
        ctx: Context<GetLpTokenPrice>,
        params: GetLpTokenPriceParams,
    ) -> Result<u64> {
        instructions::get_lp_token_price(ctx, &params)
    }
}
