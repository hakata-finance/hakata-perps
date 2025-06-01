use {crate::error::PerpetualsError, anchor_lang::prelude::*, std::collections::BTreeMap};

pub struct AccountMap<'a, 'b> {
    pub map: BTreeMap<Pubkey, &'b AccountInfo<'a>>,
}

impl<'a, 'b> AccountMap<'a, 'b> {
    pub fn from_remaining_accounts(remaining_accounts: &'b [AccountInfo<'a>]) -> Self {
        let mut map = BTreeMap::new();

        for account in remaining_accounts {
            map.insert(*account.key, account);
        }

        AccountMap { map }
    }

    pub fn get_account(&self, key: &Pubkey) -> Result<&AccountInfo<'a>> {
        self.map
            .get(key)
            .copied()
            .ok_or(PerpetualsError::AccountMapMissingEntry.into())
    }
}
