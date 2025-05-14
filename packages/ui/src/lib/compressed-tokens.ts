import { 
  Keypair, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  Transaction 
} from '@solana/web3.js';
import { 
  createRpc, 
  Rpc 
} from '@lightprotocol/stateless.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Configuration
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
// let mintKeypair: Keypair | null = null;
const mintPublicKey: PublicKey = new PublicKey("FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP");

export const getConnection = (): Rpc => {
  return createRpc(RPC_ENDPOINT);
};

export const getMintPublicKey = (): PublicKey => {
  return mintPublicKey;
};

// Get mint authority key from environment variable
const getMintAuthorityKey = () => {
  return new Uint8Array(
    "34,140,74,225,253,56,106,213,217,181,158,200,102,92,191,1,38,26,160,38,250,82,242,102,76,117,207,117,86,60,216,31,53,57,100,255,25,82,249,2,162,238,10,227,149,155,254,143,54,209,102,174,233,42,132,165,100,37,219,171,64,163,121,201".split(',').map(num => parseInt(num.trim(), 10))
  );
};

// We're declaring this but it's potentially unused - that's OK as we know we need it for the airdrop function
const adminKeypair = Keypair.fromSecretKey(getMintAuthorityKey());

// Initialize mint function - now just returns the existing mint
export const initializeMint = async (): Promise<PublicKey> => {
  return mintPublicKey;
};

// Airdrop 1 cXP to a user using regular SPL transfer
export const airdropCxp = async (
  _adminKeypair: Keypair, // Ignored, we use the global adminKeypair 
  recipientAddress: PublicKey,
  amount: number = 1 * LAMPORTS_PER_SOL // 1 cXP by default
): Promise<string> => {
  const connection = getConnection();
  
  try {
    // Get admin's token account
    const adminAta = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPublicKey,
      adminKeypair.publicKey
    );
    
    // Get or create user's token account
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPublicKey,
      recipientAddress
    );
    
    // Create regular SPL token transfer instruction
    const transferIx = createTransferInstruction(
      adminAta.address,
      recipientAta.address,
      adminKeypair.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Create and sign transaction
    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction().add(transferIx);
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = adminKeypair.publicKey;
    transaction.sign(adminKeypair);
    
    // Send and confirm transaction
    const txId = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(txId);
    
    console.log(`Airdropped ${amount / LAMPORTS_PER_SOL} cXP to ${recipientAddress.toBase58()}. txId: ${txId}`);
    return txId;
  } catch (error) {
    console.error("Error airdropping cXP:", error);
    throw error;
  }
};

// Get the cXP balance for a user
export const getCxpBalance = async (walletAddress: PublicKey): Promise<number> => {
  const connection = getConnection();
  
  try {
    // Try to get compressed token accounts first
    console.log("Checking for compressed tokens...");
    const compressedAccounts = await connection.getCompressedTokenAccountsByOwner(
      walletAddress, 
      { mint: mintPublicKey }
    );
    
    console.log("Compressed accounts:", compressedAccounts);
    
    // If we have compressed tokens, sum them up
    if (compressedAccounts.items && compressedAccounts.items.length > 0) {
      const totalBalance = compressedAccounts.items.reduce(
        (total, account) => {
          // Using specific type casting to handle potential structure differences
          const compressedAccount = account.compressedAccount as unknown as {
            tokenAmount?: { amount: string | number };
            amount?: string | number;
          };
          
          const amount = compressedAccount.amount || 
                        (compressedAccount.tokenAmount?.amount) || 
                        0;
                        
          return total + Number(amount);
        },
        0
      );
      
      // Convert from lamports to cXP (based on 9 decimals)
      return totalBalance / LAMPORTS_PER_SOL;
    }
    
    // If no compressed tokens found, try checking for regular SPL tokens
    console.log("No compressed tokens found, checking for regular SPL tokens...");
    try {
      // Get the ATA for this token and wallet
      const ataAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        walletAddress
      );
      
      // Try to get the account info
      const tokenAccount = await getAccount(connection, ataAddress);
      console.log("Regular SPL token account found:", tokenAccount);
      
      // Return the balance
      return Number(tokenAccount.amount) / LAMPORTS_PER_SOL;
    } catch (error) {
      // If the ATA doesn't exist or there's another error, the user has no tokens
      console.log("No regular SPL tokens found either:", error);
      return 0;
    }
  } catch (error) {
    console.error("Error fetching cXP balance:", error);
    return 0;
  }
};