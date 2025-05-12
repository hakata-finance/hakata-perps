import { getTokenAddress, TokenE } from "@/lib/TokenUtils";
import {
  perpetualsAddress,
  POOL_CONFIG,
  transferAuthorityAddress,
} from "@/lib/constants";
import { manualSendTransaction } from "@/lib/manualTransaction";
import { checkIfAccountExists } from "@/lib/retrieveData";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";
import { BN, Program } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function addLiquidity(
  perpetual_program: Program<HakataPerpetuals>,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  payToken: TokenE,
  tokenAmount: number,
  minLiquidityAmountOut: number,
  slippage = 10
) {
  console.log("POOL_CONFIG.programId:",POOL_CONFIG.programId.toBase58())

  const lpTokenAccount = await getAssociatedTokenAddress(
    POOL_CONFIG.lpTokenMint,
    publicKey
  );

  const payTokenCustody = POOL_CONFIG.custodies.find(i => i.mintKey.toBase58()=== getTokenAddress(payToken));
  if(!payTokenCustody){
    throw "poolTokenCustody  not found";
  }
  
  if (!tokenAmount) {
    throw "tokenAmount in correct";
  }

  const userCustodyTokenAccount = await getAssociatedTokenAddress(
    payTokenCustody.mintKey!,
    publicKey
  );

  const custodyAccountMetas = [];
  const custodyOracleAccountMetas = [];
  for (const custody of POOL_CONFIG.custodies) {
    custodyAccountMetas.push({
      pubkey: custody.custodyAccount,
      isSigner: false,
      isWritable: false,
    });

    custodyOracleAccountMetas.push({
      pubkey: custody.oracleAddress,
      isSigner: false,
      isWritable: false,
    });
  }



  let transaction = new Transaction();

  try {
    if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
      transaction = transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          lpTokenAccount,
          publicKey,
          POOL_CONFIG.lpTokenMint
        )
      );
    }

    if (payToken == TokenE.SOL) {
      console.log("pay token name is sol", payToken);

      const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey
      );

      if (!(await checkIfAccountExists(associatedTokenAccount, connection))) {
        console.log("sol ata does not exist", NATIVE_MINT.toString());

        transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAccount,
            publicKey,
            NATIVE_MINT
          )
        );
      } else {
        console.log("sol ata exists");
      }

      // get balance of associated token account
      const balance = await connection.getBalance(associatedTokenAccount);
      if (balance < tokenAmount! * LAMPORTS_PER_SOL) {
        console.log("balance insufficient");
        transaction = transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: associatedTokenAccount,
            lamports: tokenAmount * LAMPORTS_PER_SOL,
          }),
          createSyncNativeInstruction(associatedTokenAccount)
        );
      }
    }

      console.log("in add liq", tokenAmount);
      let amount;
      if (payToken === TokenE.SOL) {
        amount = new BN(tokenAmount * LAMPORTS_PER_SOL);
      } else {
        amount = new BN(tokenAmount * 10**payTokenCustody.decimals);
      }
      console.log("amonut:", amount.toString())
      const minLpAmountOut = (new BN(minLiquidityAmountOut * 10** POOL_CONFIG.lpDecimals)).mul(new BN(100-slippage)).div(new BN(100));
      const addLiquidityTx = await perpetual_program.methods
        .addLiquidity({ 
          amountIn :amount,
          minLpAmountOut
         })
        .accounts({
          owner: publicKey,
          fundingAccount: userCustodyTokenAccount, // user token account for custody token account
          lpTokenAccount,
          transferAuthority: transferAuthorityAddress,
          perpetuals: perpetualsAddress,
          pool: POOL_CONFIG.poolAddress,
          custody: payTokenCustody.custodyAccount,
          custodyOracleAccount: payTokenCustody.oracleAddress,
          custodyTokenAccount: payTokenCustody.tokenAccount,
          lpTokenMint: POOL_CONFIG.lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts([...custodyAccountMetas, ...custodyOracleAccountMetas])
        .transaction();
      transaction = transaction.add(addLiquidityTx);
    
   
    if (transaction.instructions.length > 0) {
      for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
        console.log("key",i,transaction.instructions[0]!.keys[i]?.pubkey.toString());
      }
    }
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
