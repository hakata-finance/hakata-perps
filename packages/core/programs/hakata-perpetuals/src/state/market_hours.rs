//! Market Hours Management for RWA Trading
//! 
//! This module handles trading hours validation for Real World Assets,
//! particularly stocks and traditional financial instruments that have
//! specific market operating hours.

use {
    anchor_lang::prelude::*,
    crate::error::PerpetualsError,
};

/// Supported stock exchanges with their trading hours
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub enum Exchange {
    /// New York Stock Exchange (NYSE) - Eastern Time
    NYSE,
    /// NASDAQ Global Market - Eastern Time  
    NASDAQ,
    /// London Stock Exchange - GMT
    LSE,
    /// Tokyo Stock Exchange - JST
    TSE,
    /// Shanghai Stock Exchange - CST
    SSE,
    /// Hong Kong Stock Exchange - HKT
    HKEX,
    /// 24/7 Trading (Crypto assets)
    Always,
    /// Custom exchange with configurable hours
    Custom,
}

impl Default for Exchange {
    fn default() -> Self {
        Self::Always
    }
}

/// Asset classification for trading hours
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub enum AssetType {
    /// Cryptocurrency - 24/7 trading
    Crypto,
    /// US Stocks - NYSE/NASDAQ hours
    USStock,
    /// International Stocks - Exchange specific hours
    InternationalStock,
    /// Forex - Sunday 5PM ET to Friday 5PM ET
    Forex,
    /// Commodities - Various hours based on commodity
    Commodity,
    /// Custom asset with specific trading hours
    Custom,
}

impl Default for AssetType {
    fn default() -> Self {
        Self::Crypto
    }
}

/// Days of the week for trading schedule
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub struct TradingDays {
    pub monday: bool,
    pub tuesday: bool,
    pub wednesday: bool,
    pub thursday: bool,
    pub friday: bool,
    pub saturday: bool,
    pub sunday: bool,
}

impl Default for TradingDays {
    fn default() -> Self {
        Self {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        }
    }
}

/// Trading hours configuration for an asset
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Default, Debug)]
pub struct TradingHours {
    /// Asset type determines default trading hours
    pub asset_type: AssetType,
    /// Primary exchange for the asset
    pub exchange: Exchange,
    /// Trading days configuration
    pub trading_days: TradingDays,
    /// Market open time in seconds from midnight UTC
    pub market_open_utc: u32,
    /// Market close time in seconds from midnight UTC  
    pub market_close_utc: u32,
    /// Pre-market trading start time (0 if not supported)
    pub premarket_open_utc: u32,
    /// After-hours trading end time (0 if not supported)
    pub afterhours_close_utc: u32,
    /// Whether trading is enabled during market holidays
    pub allow_holiday_trading: bool,
    /// Grace period in seconds after market close for position closure
    pub closing_grace_period: u32,
}

/// Market session type
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub enum MarketSession {
    /// Market is closed
    Closed,
    /// Pre-market trading session
    PreMarket,
    /// Regular trading hours
    Regular,
    /// After-hours trading session
    AfterHours,
    /// Extended hours (includes pre-market and after-hours)
    Extended,
}

/// Market status information
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub struct MarketStatus {
    /// Current market session
    pub session: MarketSession,
    /// Whether new positions can be opened
    pub allow_open_position: bool,
    /// Whether existing positions can be closed
    pub allow_close_position: bool,
    /// Whether trading is currently allowed
    pub is_trading_allowed: bool,
    /// Time until next market open (seconds)
    pub seconds_to_open: u32,
    /// Time until market close (seconds)  
    pub seconds_to_close: u32,
}

impl TradingHours {
    /// Create trading hours for NYSE/NASDAQ stocks
    /// Regular hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
    /// Pre-market: 4:00 AM - 9:30 AM ET (9:00 - 14:30 UTC)
    /// After-hours: 4:00 PM - 8:00 PM ET (21:00 - 01:00 UTC next day)
    pub fn us_stock() -> Self {
        Self {
            asset_type: AssetType::USStock,
            exchange: Exchange::NYSE,
            trading_days: TradingDays::default(), // Mon-Fri
            market_open_utc: 14 * 3600 + 30 * 60,  // 14:30 UTC (9:30 AM ET)
            market_close_utc: 21 * 3600,            // 21:00 UTC (4:00 PM ET)
            premarket_open_utc: 9 * 3600,           // 9:00 UTC (4:00 AM ET)
            afterhours_close_utc: 25 * 3600,        // 01:00 UTC next day (8:00 PM ET)
            allow_holiday_trading: false,
            closing_grace_period: 15 * 60,          // 15 minutes grace period
        }
    }

    /// Create trading hours for 24/7 crypto assets
    pub fn crypto() -> Self {
        Self {
            asset_type: AssetType::Crypto,
            exchange: Exchange::Always,
            trading_days: TradingDays {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
            },
            market_open_utc: 0,
            market_close_utc: 24 * 3600,
            premarket_open_utc: 0,
            afterhours_close_utc: 24 * 3600,
            allow_holiday_trading: true,
            closing_grace_period: 0,
        }
    }

    /// Create trading hours for forex markets
    /// Forex: Sunday 5:00 PM ET to Friday 5:00 PM ET (22:00 UTC Sunday to 22:00 UTC Friday)
    pub fn forex() -> Self {
        Self {
            asset_type: AssetType::Forex,
            exchange: Exchange::Always,
            trading_days: TradingDays {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: true, // Starts Sunday evening
            },
            market_open_utc: 22 * 3600,      // 22:00 UTC Sunday (5:00 PM ET)
            market_close_utc: 22 * 3600,     // 22:00 UTC Friday (5:00 PM ET)
            premarket_open_utc: 0,
            afterhours_close_utc: 0,
            allow_holiday_trading: true,
            closing_grace_period: 0,
        }
    }

    /// Get current market status based on timestamp
    pub fn get_market_status(&self, current_time: i64) -> Result<MarketStatus> {
        // Handle 24/7 assets (crypto)
        if self.exchange == Exchange::Always && self.asset_type == AssetType::Crypto {
            return Ok(MarketStatus {
                session: MarketSession::Regular,
                allow_open_position: true,
                allow_close_position: true,
                is_trading_allowed: true,
                seconds_to_open: 0,
                seconds_to_close: u32::MAX, // Never closes
            });
        }

        let current_utc_secs = (current_time % (24 * 3600)) as u32;
        let current_day_of_week = ((current_time / (24 * 3600)) + 4) % 7; // Thursday = 0

        // Check if current day is a trading day
        let is_trading_day = match current_day_of_week {
            0 => self.trading_days.thursday,
            1 => self.trading_days.friday,
            2 => self.trading_days.saturday,
            3 => self.trading_days.sunday,
            4 => self.trading_days.monday,
            5 => self.trading_days.tuesday,
            6 => self.trading_days.wednesday,
            _ => false,
        };

        // Special handling for forex (crosses midnight and weekend boundaries)
        if self.asset_type == AssetType::Forex {
            return self.get_forex_market_status(current_time, current_utc_secs, current_day_of_week);
        }

        if !is_trading_day {
            return Ok(MarketStatus {
                session: MarketSession::Closed,
                allow_open_position: false,
                allow_close_position: true, // Allow closing on non-trading days
                is_trading_allowed: false,
                seconds_to_open: self.calculate_seconds_to_next_open(current_time)?,
                seconds_to_close: 0,
            });
        }

        // Determine current session
        let session = if current_utc_secs >= self.premarket_open_utc && current_utc_secs < self.market_open_utc {
            MarketSession::PreMarket
        } else if current_utc_secs >= self.market_open_utc && current_utc_secs < self.market_close_utc {
            MarketSession::Regular
        } else if current_utc_secs >= self.market_close_utc && 
                  (current_utc_secs < self.afterhours_close_utc || 
                   (self.afterhours_close_utc > 24 * 3600 && current_utc_secs < (self.afterhours_close_utc % (24 * 3600)))) {
            MarketSession::AfterHours
        } else {
            MarketSession::Closed
        };

        let is_trading_allowed = match session {
            MarketSession::Regular => true,
            MarketSession::PreMarket | MarketSession::AfterHours => true, // Allow extended hours trading
            MarketSession::Closed => false,
            MarketSession::Extended => true,
        };

        let allow_open_position = match session {
            MarketSession::Regular => true,
            MarketSession::PreMarket | MarketSession::AfterHours => true, // Allow opening in extended hours
            _ => false,
        };

        // Always allow closing positions (with grace period after market close)
        let allow_close_position = match session {
            MarketSession::Closed => {
                // Allow closing within grace period after market close
                if current_utc_secs <= self.market_close_utc + self.closing_grace_period {
                    true
                } else {
                    true // Always allow closing, even when market is closed
                }
            },
            _ => true,
        };

        let seconds_to_open = if session == MarketSession::Closed {
            self.calculate_seconds_to_next_open(current_time)?
        } else {
            0
        };

        let seconds_to_close = if is_trading_allowed {
            let close_time = if session == MarketSession::AfterHours {
                self.afterhours_close_utc % (24 * 3600)
            } else {
                self.market_close_utc
            };
            
            if current_utc_secs < close_time {
                close_time - current_utc_secs
            } else {
                0
            }
        } else {
            0
        };

        Ok(MarketStatus {
            session,
            allow_open_position,
            allow_close_position,
            is_trading_allowed,
            seconds_to_open,
            seconds_to_close,
        })
    }

    /// Special handling for forex markets (24/5 trading)
    fn get_forex_market_status(&self, current_time: i64, current_utc_secs: u32, current_day_of_week: i64) -> Result<MarketStatus> {
        // Forex is closed from Friday 22:00 UTC to Sunday 22:00 UTC
        let is_weekend_closure = (current_day_of_week == 1 && current_utc_secs >= self.market_close_utc) || // Friday after 22:00
                                 current_day_of_week == 2 || // Saturday
                                 (current_day_of_week == 3 && current_utc_secs < self.market_open_utc); // Sunday before 22:00

        if is_weekend_closure {
            return Ok(MarketStatus {
                session: MarketSession::Closed,
                allow_open_position: false,
                allow_close_position: true,
                is_trading_allowed: false,
                seconds_to_open: self.calculate_seconds_to_forex_open(current_time)?,
                seconds_to_close: 0,
            });
        }

        Ok(MarketStatus {
            session: MarketSession::Regular,
            allow_open_position: true,
            allow_close_position: true,
            is_trading_allowed: true,
            seconds_to_open: 0,
            seconds_to_close: self.calculate_seconds_to_forex_close(current_time)?,
        })
    }

    /// Calculate seconds until next market open
    fn calculate_seconds_to_next_open(&self, current_time: i64) -> Result<u32> {
        let current_utc_secs = (current_time % (24 * 3600)) as u32;

        // If we're before market open today and today is a trading day
        let current_day_of_week = ((current_time / (24 * 3600)) + 4) % 7;
        let is_today_trading_day = self.is_trading_day(current_day_of_week);

        if is_today_trading_day && current_utc_secs < self.market_open_utc {
            return Ok(self.market_open_utc - current_utc_secs);
        }

        // Look for next trading day
        for days_ahead in 1..=7 {
            let future_day_of_week = (current_day_of_week + days_ahead) % 7;
            if self.is_trading_day(future_day_of_week) {
                let remaining_today = 24 * 3600 - current_utc_secs;
                return Ok(remaining_today + (days_ahead as u32 - 1) * 24 * 3600 + self.market_open_utc);
            }
        }

        Err(PerpetualsError::InvalidTradingHours.into())
    }

    /// Calculate seconds until forex market closes (Friday 22:00 UTC)
    fn calculate_seconds_to_forex_close(&self, current_time: i64) -> Result<u32> {
        let current_day_of_week = ((current_time / (24 * 3600)) + 4) % 7;
        let current_utc_secs = (current_time % (24 * 3600)) as u32;

        if current_day_of_week == 1 { // Friday
            if current_utc_secs < self.market_close_utc {
                return Ok(self.market_close_utc - current_utc_secs);
            }
        }

        // Calculate days until Friday
        let days_to_friday = (1 - current_day_of_week + 7) % 7;
        if days_to_friday == 0 { // It's Friday but after close
            return Ok(7 * 24 * 3600 + self.market_close_utc - current_utc_secs);
        }

        let remaining_today = 24 * 3600 - current_utc_secs;
        Ok(remaining_today + (days_to_friday as u32 - 1) * 24 * 3600 + self.market_close_utc)
    }

    /// Calculate seconds until forex market opens (Sunday 22:00 UTC)
    fn calculate_seconds_to_forex_open(&self, current_time: i64) -> Result<u32> {
        let current_day_of_week = ((current_time / (24 * 3600)) + 4) % 7;
        let current_utc_secs = (current_time % (24 * 3600)) as u32;

        if current_day_of_week == 3 { // Sunday
            if current_utc_secs < self.market_open_utc {
                return Ok(self.market_open_utc - current_utc_secs);
            }
        }

        // Calculate days until Sunday
        let days_to_sunday = (3 - current_day_of_week + 7) % 7;
        if days_to_sunday == 0 { // It's Sunday but after open
            return Ok(7 * 24 * 3600 + self.market_open_utc - current_utc_secs);
        }

        let remaining_today = 24 * 3600 - current_utc_secs;
        Ok(remaining_today + (days_to_sunday as u32 - 1) * 24 * 3600 + self.market_open_utc)
    }

    /// Check if a day of week is a trading day
    fn is_trading_day(&self, day_of_week: i64) -> bool {
        match day_of_week {
            0 => self.trading_days.thursday,
            1 => self.trading_days.friday,
            2 => self.trading_days.saturday,
            3 => self.trading_days.sunday,
            4 => self.trading_days.monday,
            5 => self.trading_days.tuesday,
            6 => self.trading_days.wednesday,
            _ => false,
        }
    }

    /// Validate if a trading operation is allowed at the current time
    pub fn validate_trading_operation(&self, current_time: i64, operation: TradingOperation) -> Result<()> {
        let market_status = self.get_market_status(current_time)?;

        match operation {
            TradingOperation::OpenPosition => {
                if !market_status.allow_open_position {
                    msg!(
                        "Market is closed for new positions. Session: {:?}, seconds to open: {}",
                        market_status.session,
                        market_status.seconds_to_open
                    );
                    return Err(PerpetualsError::MarketClosed.into());
                }
            },
            TradingOperation::ClosePosition => {
                if !market_status.allow_close_position {
                    msg!("Market is closed for closing positions. Session: {:?}", market_status.session);
                    return Err(PerpetualsError::MarketClosed.into());
                }
            },
            TradingOperation::AddCollateral | TradingOperation::RemoveCollateral => {
                // Collateral operations might be allowed even when market is closed
                // This depends on the specific implementation requirements
                if !market_status.is_trading_allowed && !market_status.allow_close_position {
                    return Err(PerpetualsError::MarketClosed.into());
                }
            },
            TradingOperation::Liquidation => {
                // Liquidations should always be allowed to protect the protocol
                // No restrictions
            },
        }

        Ok(())
    }
}

/// Types of trading operations
#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub enum TradingOperation {
    OpenPosition,
    ClosePosition,
    AddCollateral,
    RemoveCollateral,
    Liquidation,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_us_stock_trading_hours() {
        let trading_hours = TradingHours::us_stock();
        
        // Test regular trading hours (2:30 PM UTC = 9:30 AM ET)
        let market_open_time = 1640000000 + 14 * 3600 + 30 * 60; // Monday 14:30 UTC
        let status = trading_hours.get_market_status(market_open_time).unwrap();
        assert_eq!(status.session, MarketSession::Regular);
        assert!(status.allow_open_position);
        assert!(status.is_trading_allowed);

        // Test after hours (10 PM UTC = 5 PM ET)
        let after_hours_time = 1640000000 + 22 * 3600; // Monday 22:00 UTC
        let status = trading_hours.get_market_status(after_hours_time).unwrap();
        assert_eq!(status.session, MarketSession::AfterHours);

        // Test weekend (market closed)
        let weekend_time = 1640000000 + 2 * 24 * 3600; // Saturday
        let status = trading_hours.get_market_status(weekend_time).unwrap();
        assert_eq!(status.session, MarketSession::Closed);
        assert!(!status.allow_open_position);
    }

    #[test]
    fn test_crypto_24_7_trading() {
        let trading_hours = TradingHours::crypto();
        
        // Test any time - should always be open
        let any_time = 1640000000; // Any timestamp
        let status = trading_hours.get_market_status(any_time).unwrap();
        assert_eq!(status.session, MarketSession::Regular);
        assert!(status.allow_open_position);
        assert!(status.is_trading_allowed);
        assert_eq!(status.seconds_to_close, u32::MAX);
    }

    #[test]
    fn test_forex_trading_hours() {
        let trading_hours = TradingHours::forex();
        
        // Test Wednesday (mid-week, should be open)
        let mid_week = 1640000000 + 2 * 24 * 3600; // Wednesday
        let status = trading_hours.get_market_status(mid_week).unwrap();
        assert_eq!(status.session, MarketSession::Regular);
        assert!(status.allow_open_position);

        // Test Saturday (weekend, should be closed)
        let weekend = 1640000000 + 4 * 24 * 3600; // Saturday
        let status = trading_hours.get_market_status(weekend).unwrap();
        assert_eq!(status.session, MarketSession::Closed);
        assert!(!status.allow_open_position);
    }

    #[test]
    fn test_trading_operation_validation() {
        let trading_hours = TradingHours::us_stock();
        
        // Test during market hours - should allow all operations
        let market_hours = 1640000000 + 15 * 3600; // Monday 15:00 UTC (10 AM ET)
        assert!(trading_hours.validate_trading_operation(market_hours, TradingOperation::OpenPosition).is_ok());
        assert!(trading_hours.validate_trading_operation(market_hours, TradingOperation::ClosePosition).is_ok());

        // Test during weekend - should only allow closing and liquidations
        let weekend = 1640000000 + 2 * 24 * 3600; // Saturday
        assert!(trading_hours.validate_trading_operation(weekend, TradingOperation::OpenPosition).is_err());
        assert!(trading_hours.validate_trading_operation(weekend, TradingOperation::ClosePosition).is_ok());
        assert!(trading_hours.validate_trading_operation(weekend, TradingOperation::Liquidation).is_ok());
    }
} 