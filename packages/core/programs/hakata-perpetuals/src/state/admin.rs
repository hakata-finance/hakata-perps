use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, PartialOrd)]
pub enum Permissions {
    ChangePermissions = 1,
    WithdrawFees = 2,
    Superadmin = 999,
}

#[account]
pub struct Admin {
    pub address: Pubkey,
    pub bump: u8,
    pub permissions: Permissions,
}

impl Admin {
    pub const SIZE: usize = 8 + 32 + 1 + (1 + 1);

    pub fn has_permissions(&self, activity: Permissions) -> bool {
        self.permissions >= activity
    }

    pub fn has_permissions_over(&self, activity: Permissions) -> bool {
        match self.permissions {
            Permissions::Superadmin => true,
            _ => self.permissions > activity,
        }
    }
}
