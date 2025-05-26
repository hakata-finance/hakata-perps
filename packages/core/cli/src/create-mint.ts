import { createMint } from "@solana/spl-token";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import fs, { readFileSync } from "fs";
import path from "path";

// Virtual assets configuration
const VIRTUAL_ASSETS = [
  { name: "AAPL", symbol: "AAPL", decimals: 8 },
] as const;

interface VirtualAssetMint {
  name: string;
  symbol: string;
  decimals: number;
  mintAddress: string;
  mintKeypair: {
    publicKey: string;
    secretKey: number[];
  };
}

const main = async () => {
  try {
    console.log("🚀 Creating virtual asset mints for perpetuals trading...\n");

    // Setup connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Setup payer (you can replace this with your admin keypair)
    const payer = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(readFileSync('/Users/macbook/.config/solana/id.json').toString()))
    );

    // console.log("💰 Requesting airdrop for payer...");
    // const airdropTx = await connection.requestAirdrop(payer.publicKey, 2000000000); // 2 SOL
    // await connection.confirmTransaction(airdropTx);
    // console.log(`✅ Payer: ${payer.publicKey.toString()}\n`);

    const createdMints: VirtualAssetMint[] = [];

    // Create mints for each virtual asset
    for (const asset of VIRTUAL_ASSETS) {
      console.log(`📄 Creating ${asset.name} (${asset.symbol}) mint...`);
      
      const mintKeypair = Keypair.generate();
      
      const mintAddress = await createMint(
        connection,
        payer,
        payer.publicKey, // mint authority  
        payer.publicKey, // freeze authority
        asset.decimals,
        mintKeypair
      );

      const mintInfo: VirtualAssetMint = {
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        mintAddress: mintAddress.toString(),
        mintKeypair: {
          publicKey: mintKeypair.publicKey.toString(),
          secretKey: Array.from(mintKeypair.secretKey)
        }
      };

      createdMints.push(mintInfo);

      console.log(`✅ ${asset.name} mint created:`);
      console.log(`   Address: ${mintAddress.toString()}`);
      console.log(`   Decimals: ${asset.decimals}`);
      console.log(`   Authority: ${payer.publicKey.toString()}\n`);
    }

    // Save mint information to file
    const outputDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, "virtual-asset-mints.json");
    fs.writeFileSync(outputFile, JSON.stringify({
      network: "devnet",
      createdAt: new Date().toISOString(),
      payer: payer.publicKey.toString(),
      mints: createdMints
    }, null, 2));

    console.log("📁 Mint information saved to:", outputFile);
    console.log("\n🎉 All virtual asset mints created successfully!");
    
    // Summary table
    console.log("\n📊 SUMMARY:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("│ Asset │ Symbol │ Decimals │ Mint Address                                      │");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    createdMints.forEach(mint => {
      console.log(`│ ${mint.name.padEnd(5)} │ ${mint.symbol.padEnd(6)} │ ${mint.decimals.toString().padEnd(8)} │ ${mint.mintAddress} │`);
    });
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n💡 Next steps:");
    console.log("1. Add these mints as custodies to your perpetuals pool");
    console.log("2. Configure Pyth oracles for each asset");
    console.log("3. Set appropriate pricing and risk parameters");
    console.log("4. Enable position opening permissions");

  } catch (error) {
    console.error("❌ Error creating mints:", error);
    process.exit(1);
  }
};

// Run the script
main().catch(console.error);