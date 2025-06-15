//! Market Hours Demo
//! 
//! This example demonstrates how to use the market hours functionality
//! for Real World Assets in the Hakata Finance perpetual trading platform.

use {
    hakata_perpetuals::state::market_hours::{
        AssetType, Exchange, MarketSession, TradingHours, TradingOperation,
    },
    std::time::{SystemTime, UNIX_EPOCH},
};

fn main() {
    println!("🕐 Hakata Finance - Market Hours Demo");
    println!("=====================================\n");

    // Get current timestamp
    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() as i64;

    // Demo US Stock Market Hours
    demo_us_stock_hours(current_time);
    
    // Demo Crypto Market Hours (24/7)
    demo_crypto_hours(current_time);
    
    // Demo Forex Market Hours
    demo_forex_hours(current_time);
    
    // Demo trading operation validation
    demo_trading_operations(current_time);
}

fn demo_us_stock_hours(current_time: i64) {
    println!("📈 US Stock Market (NYSE/NASDAQ) Demo");
    println!("=====================================");
    
    let us_stock_hours = TradingHours::us_stock();
    
    match us_stock_hours.get_market_status(current_time) {
        Ok(status) => {
            println!("Asset Type: {:?}", us_stock_hours.asset_type);
            println!("Exchange: {:?}", us_stock_hours.exchange);
            println!("Current Session: {:?}", status.session);
            println!("Trading Allowed: {}", status.is_trading_allowed);
            println!("Can Open Positions: {}", status.allow_open_position);
            println!("Can Close Positions: {}", status.allow_close_position);
            
            if status.seconds_to_open > 0 {
                let hours = status.seconds_to_open / 3600;
                let minutes = (status.seconds_to_open % 3600) / 60;
                println!("Market opens in: {}h {}m", hours, minutes);
            }
            
            if status.seconds_to_close > 0 && status.seconds_to_close != u32::MAX {
                let hours = status.seconds_to_close / 3600;
                let minutes = (status.seconds_to_close % 3600) / 60;
                println!("Market closes in: {}h {}m", hours, minutes);
            }
            
            println!("Regular Hours: 09:30 - 16:00 ET (14:30 - 21:00 UTC)");
            println!("Pre-Market: 04:00 - 09:30 ET (09:00 - 14:30 UTC)");
            println!("After-Hours: 16:00 - 20:00 ET (21:00 - 01:00 UTC)\n");
        }
        Err(e) => println!("Error getting market status: {:?}\n", e),
    }
}

fn demo_crypto_hours(current_time: i64) {
    println!("₿ Cryptocurrency Market (24/7) Demo");
    println!("===================================");
    
    let crypto_hours = TradingHours::crypto();
    
    match crypto_hours.get_market_status(current_time) {
        Ok(status) => {
            println!("Asset Type: {:?}", crypto_hours.asset_type);
            println!("Exchange: {:?}", crypto_hours.exchange);
            println!("Current Session: {:?}", status.session);
            println!("Trading Allowed: {}", status.is_trading_allowed);
            println!("Can Open Positions: {}", status.allow_open_position);
            println!("Can Close Positions: {}", status.allow_close_position);
            println!("Trading Hours: 24/7 - Always Open\n");
        }
        Err(e) => println!("Error getting market status: {:?}\n", e),
    }
}

fn demo_forex_hours(current_time: i64) {
    println!("💱 Forex Market (24/5) Demo");
    println!("============================");
    
    let forex_hours = TradingHours::forex();
    
    match forex_hours.get_market_status(current_time) {
        Ok(status) => {
            println!("Asset Type: {:?}", forex_hours.asset_type);
            println!("Exchange: {:?}", forex_hours.exchange);
            println!("Current Session: {:?}", status.session);
            println!("Trading Allowed: {}", status.is_trading_allowed);
            println!("Can Open Positions: {}", status.allow_open_position);
            println!("Can Close Positions: {}", status.allow_close_position);
            
            if status.seconds_to_open > 0 {
                let hours = status.seconds_to_open / 3600;
                let minutes = (status.seconds_to_open % 3600) / 60;
                println!("Market opens in: {}h {}m", hours, minutes);
            }
            
            if status.seconds_to_close > 0 && status.seconds_to_close != u32::MAX {
                let hours = status.seconds_to_close / 3600;
                let minutes = (status.seconds_to_close % 3600) / 60;
                println!("Market closes in: {}h {}m", hours, minutes);
            }
            
            println!("Trading Hours: Sunday 22:00 UTC - Friday 22:00 UTC\n");
        }
        Err(e) => println!("Error getting market status: {:?}\n", e),
    }
}

fn demo_trading_operations(current_time: i64) {
    println!("🔄 Trading Operations Validation Demo");
    println!("=====================================");
    
    let us_stock_hours = TradingHours::us_stock();
    let crypto_hours = TradingHours::crypto();
    
    let operations = [
        TradingOperation::OpenPosition,
        TradingOperation::ClosePosition,
        TradingOperation::AddCollateral,
        TradingOperation::RemoveCollateral,
        TradingOperation::Liquidation,
    ];
    
    println!("US Stock Market Operations:");
    for operation in &operations {
        match us_stock_hours.validate_trading_operation(current_time, *operation) {
            Ok(_) => println!("  {:?}: ✅ Allowed", operation),
            Err(_) => println!("  {:?}: ❌ Not Allowed", operation),
        }
    }
    
    println!("\nCrypto Market Operations:");
    for operation in &operations {
        match crypto_hours.validate_trading_operation(current_time, *operation) {
            Ok(_) => println!("  {:?}: ✅ Allowed", operation),
            Err(_) => println!("  {:?}: ❌ Not Allowed", operation),
        }
    }
    
    println!("\n📝 Key Points:");
    println!("- Liquidations are always allowed to protect the protocol");
    println!("- Position closing has extended grace periods");
    println!("- Crypto assets trade 24/7 with no restrictions");
    println!("- Traditional assets follow exchange-specific hours");
    println!("- Extended hours trading is supported for US stocks");
}

/// Example of how to create custom trading hours
#[allow(dead_code)]
fn create_custom_trading_hours() -> TradingHours {
    use hakata_perpetuals::state::market_hours::TradingDays;
    
    TradingHours {
        asset_type: AssetType::Custom,
        exchange: Exchange::Custom,
        trading_days: TradingDays {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        market_open_utc: 8 * 3600,      // 08:00 UTC
        market_close_utc: 16 * 3600,    // 16:00 UTC
        premarket_open_utc: 6 * 3600,   // 06:00 UTC
        afterhours_close_utc: 18 * 3600, // 18:00 UTC
        allow_holiday_trading: false,
        closing_grace_period: 30 * 60,  // 30 minutes
    }
} 