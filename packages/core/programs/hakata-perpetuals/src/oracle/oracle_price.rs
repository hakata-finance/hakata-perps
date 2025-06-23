use {
    super::get_price_from_pyth,
    crate::{
        math,
        state::{custody::Oracle, perpetuals::Perpetuals},
    },
    anchor_lang::prelude::*,
};

const ORACLE_EXPONENT_SCALE: i32 = -9;
const ORACLE_PRICE_SCALE: u64 = 1_000_000_000;
const ORACLE_MAX_PRICE: u64 = (1 << 28) - 1;

#[derive(Debug, Clone, Copy)]
pub struct OraclePrice {
    pub price: u64,
    pub exponent: i32,
}

impl Ord for OraclePrice {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // Normalize exponents before comparing
        let (price1, price2) = if self.exponent == other.exponent {
            (self.price, other.price)
        } else {
            let target_exp = self.exponent.max(other.exponent);
            let p1 = if self.exponent < target_exp {
                self.price * 10u64.pow((target_exp - self.exponent) as u32)
            } else {
                self.price
            };
            let p2 = if other.exponent < target_exp {
                other.price * 10u64.pow((target_exp - other.exponent) as u32)
            } else {
                other.price
            };
            (p1, p2)
        };
        price1.cmp(&price2)
    }
}

impl PartialOrd for OraclePrice {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for OraclePrice {
    fn eq(&self, other: &Self) -> bool {
        self.cmp(other) == std::cmp::Ordering::Equal
    }
}

impl Eq for OraclePrice {}

#[allow(dead_code)]
impl OraclePrice {
    pub fn new(price: u64, exponent: i32) -> Self {
        Self { price, exponent }
    }

    pub fn new_from_token(amount_and_decimals: (u64, u8)) -> Self {
        Self {
            price: amount_and_decimals.0,
            exponent: -(amount_and_decimals.1 as i32),
        }
    }

    pub fn new_from_oracle(
        oracle_account: &AccountInfo,
        clock: &Clock,
        oracle_type: Oracle,
        use_ema: bool,
    ) -> Result<Self> {
        match oracle_type {
            Oracle::Pyth(_) => get_price_from_pyth(oracle_account, clock, use_ema),
        }
    }

    // Converts token amount to USD with implied USD_DECIMALS decimals using oracle price
    pub fn get_asset_amount_usd(&self, token_amount: u64, token_decimals: u8) -> Result<u64> {
        if token_amount == 0 || self.price == 0 {
            return Ok(0);
        }
        math::checked_decimal_mul(
            token_amount,
            -(token_decimals as i32),
            self.price,
            self.exponent,
            -(Perpetuals::USD_DECIMALS as i32),
        )
    }

    // Converts USD amount with implied USD_DECIMALS decimals to token amount
    pub fn get_token_amount(&self, asset_amount_usd: u64, token_decimals: u8) -> Result<u64> {
        if asset_amount_usd == 0 || self.price == 0 {
            return Ok(0);
        }
        math::checked_decimal_div(
            asset_amount_usd,
            -(Perpetuals::USD_DECIMALS as i32),
            self.price,
            self.exponent,
            -(token_decimals as i32),
        )
    }

    /// Returns price with mantissa normalized to be less than ORACLE_MAX_PRICE
    pub fn normalize(&self) -> Result<OraclePrice> {
        let mut p = self.price;
        let mut e = self.exponent;

        while p > ORACLE_MAX_PRICE {
            p = math::checked_div(p, 10)?;
            e = math::checked_add(e, 1)?;
        }

        Ok(OraclePrice {
            price: p,
            exponent: e,
        })
    }

    pub fn checked_div(&self, other: &OraclePrice) -> Result<OraclePrice> {
        let base = self.normalize()?;
        let other = other.normalize()?;

        Ok(OraclePrice {
            price: math::checked_div(
                math::checked_mul(base.price, ORACLE_PRICE_SCALE)?,
                other.price,
            )?,
            exponent: math::checked_sub(
                math::checked_add(base.exponent, ORACLE_EXPONENT_SCALE)?,
                other.exponent,
            )?,
        })
    }

    pub fn checked_mul(&self, other: &OraclePrice) -> Result<OraclePrice> {
        Ok(OraclePrice {
            price: math::checked_mul(self.price, other.price)?,
            exponent: math::checked_add(self.exponent, other.exponent)?,
        })
    }

    pub fn scale_to_exponent(&self, target_exponent: i32) -> Result<OraclePrice> {
        if target_exponent == self.exponent {
            return Ok(*self);
        }
        let delta = math::checked_sub(target_exponent, self.exponent)?;
        if delta > 0 {
            Ok(OraclePrice {
                price: math::checked_div(self.price, math::checked_pow(10, delta as usize)?)?,
                exponent: target_exponent,
            })
        } else {
            Ok(OraclePrice {
                price: math::checked_mul(self.price, math::checked_pow(10, (-delta) as usize)?)?,
                exponent: target_exponent,
            })
        }
    }

    pub fn checked_as_f64(&self) -> Result<f64> {
        math::checked_float_mul(
            math::checked_as_f64(self.price)?,
            math::checked_powi(10.0, self.exponent)?,
        )
    }

    pub fn get_min_price(&self, other: &OraclePrice, is_stable: bool) -> Result<OraclePrice> {
        let min_price = if self < other { self } else { other };
        if is_stable {
            if min_price.exponent > 0 {
                if min_price.price == 0 {
                    return Ok(*min_price);
                } else {
                    return Ok(OraclePrice {
                        price: 1000000u64,
                        exponent: -6,
                    });
                }
            }
            let one_usd = math::checked_pow(10u64, (-min_price.exponent) as usize)?;
            if min_price.price > one_usd {
                Ok(OraclePrice {
                    price: one_usd,
                    exponent: min_price.exponent,
                })
            } else {
                Ok(*min_price)
            }
        } else {
            Ok(*min_price)
        }
    }
}
