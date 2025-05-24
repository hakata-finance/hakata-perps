import { getTokenAddress, TokenE } from "@/lib/TokenUtils";
import {
  perpetualsAddress,
  POOL_CONFIG,
  transferAuthorityAddress,
} from "@/lib/constants";
import { manualSendTransaction } from "@/lib/manualTransaction";
import { checkIfAccountExists } from "@/lib/retrieveData";
import { BN, Program } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { isVariant, Side } from "@/lib/types";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";

export async function openPosition(
  program: Program<HakataPerpetuals>,
  publicKey: PublicKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction: any,
  connection: Connection,
  payToken: TokenE,
  positionToken: TokenE,
  payAmount: BN,
  positionAmount: BN,
  price: BN,
  side: Side
) {
  // TODO: need to take slippage as param , this is now for testing
  console.log('DEBUG: side parameter =', side);
  console.log('DEBUG: typeof side =', typeof side);
  console.log('DEBUG: side properties =', Object.keys(side || {}));
  
  const newPrice =
  isVariant(side, 'long')
      ? price.mul(new BN(110)).div(new BN(100))
      : price.mul(new BN(90)).div(new BN(100));

  const payTokenCustody = POOL_CONFIG.custodies.find(i => i.mintKey.toBase58() === getTokenAddress(payToken));
  if(!payTokenCustody){
    throw new Error("poolTokenCustody not found");
  }

  const tokenAddress = getTokenAddress(payToken);
  if (!tokenAddress) {
    throw new Error(`Token address not found for ${payToken}`);
  }

  const userCustodyTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    publicKey
  );

  // check if usercustodytoken account exists
  if (!(await checkIfAccountExists(userCustodyTokenAccount, connection))) {
    console.log("user custody token account does not exist");
  }

  console.log("tokens", payToken, positionToken);
  const positionAccount = PublicKey.findProgramAddressSync(
    [
      Buffer.from("position") ,
      publicKey.toBuffer(),
      POOL_CONFIG.poolAddress.toBuffer(),
      payTokenCustody.custodyAccount.toBuffer(),
      isVariant(side, 'long') ?  Buffer.from([1]) :  Buffer.from([2]), // in base58 1=2 , 2=3 
    ],
    program.programId
  )[0];

  let transaction = new Transaction();

  try {
    console.log("position account", positionAccount.toString());

    const params = {
      price: newPrice,
      collateral: payAmount,
      size: positionAmount,
      side: side,
    };
    const tx = await program.methods
      .openPosition(params)
      .accountsPartial({
        owner: publicKey,
        fundingAccount: userCustodyTokenAccount,
        transferAuthority: transferAuthorityAddress,
        perpetuals: perpetualsAddress,
        pool: POOL_CONFIG.poolAddress,
        position: positionAccount,
        custody: payTokenCustody.custodyAccount,
        custodyOracleAccount: payTokenCustody.oracleAddress,
        custodyTokenAccount: payTokenCustody.tokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("open position tx", transaction);

    // Simulate the transaction first
    console.log("🔍 Simulating transaction...");
    try {
      // Get recent blockhash for the versioned transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Create versioned transaction for simulation
      const versionedTx = new VersionedTransaction(transaction.compileMessage());
      
      const simulation = await connection.simulateTransaction(versionedTx, {
        sigVerify: false,
        commitment: 'processed'
      });
      
      console.log("✅ Transaction simulation result:", simulation);
      
      if (simulation.value.err) {
        console.error("❌ Simulation failed:", simulation.value.err);
        console.error("📋 Simulation logs:", simulation.value.logs);
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      
      console.log("📋 Simulation logs:", simulation.value.logs);
      console.log("⚡ Compute units consumed:", simulation.value.unitsConsumed);
      
    } catch (simulationErr) {
      console.error("❌ Simulation error:", simulationErr);
      throw new Error(`Failed to simulate transaction: ${simulationErr}`);
    }

    console.log("🚀 Simulation successful, sending transaction...");
    await manualSendTransaction(
      transaction,
      publicKey,
      connection,
      signTransaction
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
}
