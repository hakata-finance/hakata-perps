import { confirmTx } from "@lightprotocol/stateless.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createCxpLookupTable, createDevnetRpc } from '../utils/compressionUtils';

/**
 * Script to create a lookup table for cXP token holders
 * This demonstrates how to use ZK Compression to create efficient lookup tables
 * for compressed token programs
 */
async function main() {
  try {
    console.log("🚀 Starting cXP Lookup Table Creation...");

    // Configuration
    const CXP_TOKEN_MINT = new PublicKey("FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP");
    const API_KEY = process.env.HELIUS_API_KEY || "YOUR_API_KEY";
    
    // Create connection
    const connection = createDevnetRpc(API_KEY);
    
    // Generate keypairs for payer and authority
    const payer = Keypair.generate();
    const authority = payer; // Using same keypair for simplicity
    
    console.log("📝 Generated keypairs:");
    console.log("Payer:", payer.publicKey.toBase58());
    console.log("Authority:", authority.publicKey.toBase58());

    // Airdrop SOL to pay for transactions
    console.log("💰 Requesting airdrop...");
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 1e7); // 0.01 SOL
    await confirmTx(connection, airdropSignature);
    console.log("✅ Airdrop confirmed:", airdropSignature);

    // Additional accounts you might want to include in the lookup table
    const additionalAccounts: PublicKey[] = [
      // Add any additional accounts you want to include
      // For example: program IDs, pool accounts, etc.
    ];

    // Create the lookup table
    console.log("🔧 Creating cXP lookup table...");
    const { address } = await createCxpLookupTable(
      connection,
      payer,
      authority,
      CXP_TOKEN_MINT,
      additionalAccounts
    );

    console.log("🎉 Success! Lookup table created:");
    console.log("Address:", address.toBase58());
    console.log("Explorer:", `https://explorer.solana.com/address/${address.toBase58()}?cluster=devnet`);

    // Verify the lookup table was created
    console.log("🔍 Verifying lookup table...");
    const accountInfo = await connection.getAccountInfo(address);
    if (accountInfo) {
      console.log("✅ Lookup table verified - account exists");
      console.log("Data length:", accountInfo.data.length);
    } else {
      console.log("❌ Lookup table verification failed");
    }

  } catch (error) {
    console.error("❌ Error creating lookup table:", error);
    process.exit(1);
  }
}

// Example usage for testing
async function testLeaderboardIntegration() {
  try {
    console.log("\n🧪 Testing leaderboard integration...");
    
    const CXP_TOKEN_MINT = new PublicKey("FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP");
    const API_KEY = process.env.HELIUS_API_KEY || "https://api.devnet.solana.com";
    const connection = createDevnetRpc(API_KEY);

    // Test fetching compressed token holders
    const tokenHolders = await connection.getCompressedMintTokenHolders(CXP_TOKEN_MINT);
    console.log("📊 Found token holders:", Array.isArray(tokenHolders) ? tokenHolders.length : 0);

    if (Array.isArray(tokenHolders) && tokenHolders.length > 0) {
      console.log("🏆 Top holder:", tokenHolders[0]);
    }

  } catch (error) {
    console.error("❌ Error testing leaderboard:", error);
  }
}

// Run the script
if (require.main === module) {
  console.log("🌟 cXP Lookup Table Creator");
  console.log("===========================");
  
  // Check if we should run the main function or test
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    testLeaderboardIntegration();
  } else {
    main();
  }
}

export { main as createLookupTable, testLeaderboardIntegration }; 