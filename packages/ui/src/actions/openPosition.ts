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
  try {
    console.log("🚀 STARTING openPosition function");
    console.log("📝 Input parameters:", {
      payToken,
      positionToken,
      payAmount: payAmount?.toString(),
      positionAmount: positionAmount?.toString(),
      price: price?.toString(),
      publicKey: publicKey?.toString()
    });

    console.log('DEBUG: side parameter =', side);
    console.log('DEBUG: typeof side =', typeof side);
    console.log('DEBUG: side properties =', Object.keys(side || {}));
    
    // Debug connection and RPC
    console.log("🌐 Connection debug info:");
    console.log("- RPC Endpoint:", connection.rpcEndpoint);
    console.log("- Commitment:", connection.commitment);
    console.log("- Wallet Public Key:", publicKey.toString());
    
    // Test basic connection
    try {
      const slot = await connection.getSlot();
      console.log("- Current Slot:", slot);
      const blockHeight = await connection.getBlockHeight();
      console.log("- Block Height:", blockHeight);
    } catch (connErr) {
      console.error("❌ Connection test failed:", connErr);
      throw new Error(`RPC connection failed: ${connErr}`);
    }

    // �� SIMPLE TEST: Check if we can fetch program account
    console.log("🧪 TESTING: Basic program account access...");
    try {
      const programAccount = await connection.getAccountInfo(program.programId);
      if (programAccount) {
        console.log("✅ Program account exists");
        console.log("- Program ID:", program.programId.toString());
        console.log("- Program executable:", programAccount.executable);
        console.log("- Program owner:", programAccount.owner.toString());
      } else {
        throw new Error("Program account not found");
      }
    } catch (progErr) {
      console.error("❌ Program account test failed:", progErr);
      throw new Error(`Program not found: ${progErr}`);
    }

    // 🧪 SIMPLE TEST: Try to fetch perpetuals account
    console.log("🧪 TESTING: Perpetuals account access...");
    try {
      const perpetualsAccount = await connection.getAccountInfo(perpetualsAddress);
      if (perpetualsAccount) {
        console.log("✅ Perpetuals account exists");
        console.log("- Address:", perpetualsAddress.toString());
        console.log("- Owner:", perpetualsAccount.owner.toString());
        console.log("- Data length:", perpetualsAccount.data.length);
        
        // Try to deserialize the account
        try {
          const perpetualsData = program.account.perpetuals.coder.accounts.decode("perpetuals", perpetualsAccount.data);
          console.log("✅ Perpetuals account decoded successfully");
          console.log("- Allow open position:", perpetualsData.permissions?.allowOpenPosition);
        } catch (decodeErr) {
          console.warn("⚠️  Could not decode perpetuals account:", decodeErr);
        }
      } else {
        throw new Error("Perpetuals account not found");
      }
    } catch (perpErr) {
      console.error("❌ Perpetuals account test failed:", perpErr);
      throw new Error(`Perpetuals account not found: ${perpErr}`);
    }

    const newPrice =
    isVariant(side, 'long')
        ? price.mul(new BN(110)).div(new BN(100))
        : price.mul(new BN(90)).div(new BN(100));

    console.log("💰 Price calculation:", {
      originalPrice: price.toString(),
      newPrice: newPrice.toString(),
      side: isVariant(side, 'long') ? 'long' : 'short'
    });

    const payTokenCustody = POOL_CONFIG.custodies.find(i => i.mintKey.toBase58() === getTokenAddress(payToken));
    if(!payTokenCustody){
      throw new Error("poolTokenCustody not found");
    }

    console.log("🏦 Found custody config:", {
      payToken,
      custodyAccount: payTokenCustody.custodyAccount.toString(),
      tokenAccount: payTokenCustody.tokenAccount.toString(),
      oracleAddress: payTokenCustody.oracleAddress.toString()
    });

    const tokenAddress = getTokenAddress(payToken);
    if (!tokenAddress) {
      throw new Error(`Token address not found for ${payToken}`);
    }

    const userCustodyTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
      publicKey
    );

    // check if usercustodytoken account exists
    console.log("💰 Checking funding account (user's token account)...");
    console.log(`- Token: ${payToken}`);
    console.log(`- Token Address: ${tokenAddress}`);
    console.log(`- User ATA: ${userCustodyTokenAccount.toString()}`);
    
    const fundingAccountExists = await checkIfAccountExists(userCustodyTokenAccount, connection);
    if (!fundingAccountExists) {
      console.log("❌ User custody token account does not exist - need to create ATA first");
      throw new Error(`Funding account ${userCustodyTokenAccount.toString()} does not exist. Please create the associated token account first.`);
    } else {
      console.log("✅ User custody token account exists");
      // Check balance too
      try {
        const balance = await connection.getTokenAccountBalance(userCustodyTokenAccount);
        console.log(`- Balance: ${balance.value.uiAmount} ${payToken}`);
      } catch (balanceErr) {
        console.log("⚠️  Could not fetch token balance:", balanceErr);
      }
    }

    console.log("tokens", payToken, positionToken);
    
    // 🧪 SIMPLE TEST: Validate PDA derivation
    console.log("🧪 TESTING: Position PDA derivation...");
    const sideBuffer = isVariant(side, 'long') ? Buffer.from([1]) : Buffer.from([2]);
    console.log("- Side buffer:", sideBuffer, "for side:", isVariant(side, 'long') ? 'long' : 'short');
    console.log("- Seeds being used:", {
      position: "position",
      publicKey: publicKey.toString(),
      poolAddress: POOL_CONFIG.poolAddress.toString(),
      custodyAccount: payTokenCustody.custodyAccount.toString(),
      sideBuffer: Array.from(sideBuffer)
    });
    
    const positionAccount = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position") ,
        publicKey.toBuffer(),
        POOL_CONFIG.poolAddress.toBuffer(),
        payTokenCustody.custodyAccount.toBuffer(),
        sideBuffer
      ],
      program.programId
    )[0];
    
    console.log("✅ Position PDA derived:", positionAccount.toString());

    const transaction = new Transaction();

    try {
      console.log("position account", positionAccount.toString());

      console.log("🔧 Opening position with side:", side);
      
      console.table({
        owner: publicKey.toString(),
        fundingAccount: userCustodyTokenAccount.toString(),
        transferAuthority: transferAuthorityAddress.toString(),
        perpetuals: perpetualsAddress.toString(),
        pool: POOL_CONFIG.poolAddress.toString(),
        position: positionAccount.toString(),
        custody: payTokenCustody.custodyAccount.toString(),
        custodyOracleAccount: payTokenCustody.oracleAddress.toString(),
        custodyTokenAccount: payTokenCustody.tokenAccount.toString(),
        systemProgram: SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
      })

      // Check each account individually to find which one is missing
      console.log("🔍 Checking account existence...");
      
      // Special check for owner account (wallet) - this should always exist
      console.log("👤 Checking wallet/owner account...");
      try {
        const walletBalance = await connection.getBalance(publicKey);
        console.log(`✅ Wallet/Owner: EXISTS with balance: ${walletBalance / 1e9} SOL (${publicKey.toString()})`);
      } catch (err) {
        console.error(`❌ Wallet/Owner: ERROR checking balance (${publicKey.toString()})`, err);
      }
      
      const accountsToCheck = [
        { name: "fundingAccount", key: userCustodyTokenAccount, required: true },
        { name: "transferAuthority", key: transferAuthorityAddress, required: true },
        { name: "perpetuals", key: perpetualsAddress, required: true },
        { name: "pool", key: POOL_CONFIG.poolAddress, required: true },
        { name: "custody", key: payTokenCustody.custodyAccount, required: true },
        { name: "custodyOracleAccount", key: payTokenCustody.oracleAddress, required: true },
        { name: "custodyTokenAccount", key: payTokenCustody.tokenAccount, required: true },
        { name: "program", key: program.programId, required: true },
      ];

      // Position account is special - it's a PDA that might not exist yet
      console.log("📍 Checking position account (PDA)...");
      const positionExists = await connection.getAccountInfo(positionAccount);
      if (positionExists) {
        console.log(`✅ Position: EXISTS (${positionAccount.toString()}) - This position was opened before`);
      } else {
        console.log(`ℹ️  Position: WILL BE CREATED (${positionAccount.toString()}) - New position`);
      }

      for (const account of accountsToCheck) {
        try {
          const accountInfo = await connection.getAccountInfo(account.key);
          if (accountInfo) {
            console.log(`✅ ${account.name}: EXISTS (${account.key.toString()}) - Owner: ${accountInfo.owner.toString()}, Lamports: ${accountInfo.lamports}`);
          } else {
            if (account.required) {
              console.error(`❌ ${account.name}: NOT FOUND (${account.key.toString()}) - REQUIRED ACCOUNT MISSING!`);
            } else {
              console.log(`⚠️  ${account.name}: NOT FOUND (${account.key.toString()}) - Optional account`);
            }
          }
        } catch (err) {
          console.error(`💥 ${account.name}: ERROR checking (${account.key.toString()})`, err);
        }
      }

      console.log("📋 Account existence check complete.");
      
      // Also check recent blockhash
      console.log("🔍 Checking connection and recent blockhash...");
      try {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        console.log(`✅ Recent blockhash: ${blockhash}, Last valid block height: ${lastValidBlockHeight}`);
      } catch (err) {
        console.error("❌ Failed to get recent blockhash:", err);
      }

      console.log("🔧 Building transaction...");
      
      // 🧪 SIMPLE TEST: Try building just the method without accounts
      console.log("🧪 TESTING: Basic method builder...");
      try {
        program.methods.openPosition({
          price: newPrice,
          collateral: payAmount,
          size: positionAmount,
          side: side,
        });
        console.log("✅ Method builder test successful");
      } catch (methodErr) {
        console.error("❌ Method builder test failed:", methodErr);
        throw new Error(`Method builder failed: ${methodErr}`);
      }
      
      let tx;
      try {
        console.log("📝 Creating method call with params:", {
          price: newPrice.toString(),
          collateral: payAmount.toString(), 
          size: positionAmount.toString(),
          side: side
        });
        
        const methodBuilder = program.methods.openPosition({
          price: newPrice,
          collateral: payAmount,
          size: positionAmount,
          side: side,
        });
        console.log("✅ Method builder created");
        
        const accountsBuilder = methodBuilder.accountsPartial({
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
        });
        console.log("✅ Accounts set");
        
        tx = await accountsBuilder.transaction();
        console.log("✅ Transaction built successfully");
        
      } catch (buildError) {
        console.error("❌ Error building transaction:", buildError);
        throw new Error(`Failed to build transaction: ${buildError}`);
      }
      
      transaction.add(tx);
      console.log("📦 Transaction after adding instruction:");
      console.log("- Instruction count:", transaction.instructions.length);
      console.log("- First instruction program ID:", transaction.instructions[0]?.programId.toString());
      console.log("- First instruction data length:", transaction.instructions[0]?.data.length);
      console.log("open position tx", transaction);

      // Simulate the transaction first
      console.log("🔍 Simulating transaction...");
      try {
        // Get recent blockhash for the versioned transaction
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;
        
        console.log("📦 Transaction details before simulation:", {
          instructionCount: transaction.instructions.length,
          feePayer: transaction.feePayer?.toString(),
          recentBlockhash: transaction.recentBlockhash
        });
        
        // Log each instruction
        transaction.instructions.forEach((instruction, index) => {
          console.log(`📋 Instruction ${index}:`, {
            programId: instruction.programId.toString(),
            accountsCount: instruction.keys.length,
            dataLength: instruction.data.length
          });
        });
        
        // Create versioned transaction for simulation
        const versionedTx = new VersionedTransaction(transaction.compileMessage());
        
        console.log("🔧 Versioned transaction created, starting simulation...");
        
        const simulation = await connection.simulateTransaction(versionedTx, {
          sigVerify: false,
          commitment: 'processed'
        });
        
        console.log("✅ Simulation completed!");
        console.log("📊 Full simulation result:", JSON.stringify(simulation, null, 2));
        
        // Detailed simulation analysis
        console.log("🔍 Simulation analysis:", {
          err: simulation.value.err,
          logsCount: simulation.value.logs?.length ?? 0,
          unitsConsumed: simulation.value.unitsConsumed,
          returnData: simulation.value.returnData,
          accounts: simulation.value.accounts?.length ?? 0
        });
        
        if (simulation.value.err) {
          console.error("❌ Simulation failed with error:", simulation.value.err);
          console.error("📋 Error logs:", simulation.value.logs);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }
        
        if (!simulation.value.logs || simulation.value.logs.length === 0) {
          console.warn("⚠️  Simulation succeeded but produced no logs - this is unusual!");
          
          // Try alternative simulation approaches
          console.log("🔄 Trying alternative simulation with different options...");
          
          try {
            const altSimulation = await connection.simulateTransaction(versionedTx, {
              sigVerify: false,
              commitment: 'confirmed',
              replaceRecentBlockhash: true
            });
            
            console.log("🔄 Alternative simulation result:", {
              err: altSimulation.value.err,
              logsCount: altSimulation.value.logs?.length ?? 0,
              logs: altSimulation.value.logs
            });
          } catch (altErr) {
            console.warn("⚠️  Alternative simulation also failed:", altErr);
          }
          
          // Check if this is an RPC issue
          console.log("🔍 Testing RPC with a simple getAccountInfo call...");
          try {
            const testAccount = await connection.getAccountInfo(publicKey);
            console.log("✅ RPC is responding to getAccountInfo:", !!testAccount);
          } catch (rpcErr) {
            console.error("❌ RPC test failed:", rpcErr);
          }
          
        } else {
          console.log("📋 Simulation logs:", simulation.value.logs);
        }
        
        console.log("⚡ Compute units consumed:", simulation.value.unitsConsumed);
        
      } catch (simulationErr) {
        console.error("❌ Simulation error:", simulationErr);
        console.error("❌ Error details:", {
          name: simulationErr instanceof Error ? simulationErr.name : 'Unknown',
          message: simulationErr instanceof Error ? simulationErr.message : String(simulationErr),
          stack: simulationErr instanceof Error ? simulationErr.stack : undefined
        });
        throw new Error(`Failed to simulate transaction: ${simulationErr}`);
      }

      console.log("🚀 Simulation successful, sending transaction...");
      await manualSendTransaction(
        transaction,
        publicKey,
        connection,
        signTransaction
      );
      
      console.log("✅ Position opened successfully!");
      
    } catch (err) {
      console.error("❌ openPosition failed:", err);
      console.error("📍 Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      throw err;
    }
  } catch (globalErr) {
    console.error("💥 GLOBAL ERROR in openPosition:", globalErr);
    throw globalErr;
  }
}
