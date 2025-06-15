import { Keypair } from '@solana/web3.js';

/**
 * Get mint authority key from environment variable
 * Falls back to hardcoded key if environment variable is not set
 * This is the admin keypair that has permission to mint/airdrop cXP tokens
 * 
 * @returns Uint8Array - The secret key bytes for the mint authority
 */
export const getMintAuthorityKey = (): Uint8Array | undefined => {
  // Try to get mint authority key from environment variable first
  const envMintAuthorityKey = process.env.NEXT_PUBLIC_MINT_AUTHORITY_KEY;
  
  if (envMintAuthorityKey) {
    try {
      // Parse the comma-separated string into Uint8Array
      const keyArray = envMintAuthorityKey.split(',').map(num => parseInt(num.trim(), 10));
      
      // Validate that we have the correct number of bytes (64 bytes for a secret key)
      if (keyArray.length === 64) {
        console.log('Using mint authority key from environment variables');
        return new Uint8Array(keyArray);
      } else {
        console.warn('Invalid mint authority key length in environment variable, using fallback. Expected 64 bytes but got:', keyArray.length);
      }
    } catch (error) {
      console.error('Error parsing mint authority key from environment variable:', error);
      console.log('Falling back to hardcoded mint authority key');
    }
  } else {
    console.warn('No mint authority key provided in environment variables');
  }
  
  // Fallback to hardcoded mint authority key if env var is not set or invalid
  console.log('Using fallback hardcoded mint authority key');
  
  // NOTE: The function should return a hardcoded key here or undefined
  // Security warning: Hardcoded keys should never be used in production
  return undefined;
};

/**
 * Get the admin keypair for performing mint/airdrop operations
 * This keypair has minting authority for the cXP token
 * 
 * @returns Keypair - The admin keypair with minting authority or undefined if no key is available
 */
export const getAdminKeypair = (): Keypair | undefined => {
  const key = getMintAuthorityKey();
  
  if (!key) {
    console.error('No mint authority key available, admin operations will not be possible');
    return undefined;
  }

  return Keypair.fromSecretKey(key);
}; 