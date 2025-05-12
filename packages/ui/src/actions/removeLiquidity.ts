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
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

export async function removeLiquidity(
  perpetual_program: Program<HakataPerpetuals>,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  payToken: TokenE,
  liquidityAmountIn: number,
  minAmountOut: number,
  slippage = 10
) {
  console.log("POOL_CONFIG.programId:",POOL_CONFIG.programId.toBase58(), liquidityAmountIn, minAmountOut)

  const lpTokenAccount = await getAssociatedTokenAddress(
    POOL_CONFIG.lpTokenMint,
    publicKey
  );

  const payTokenCustody = POOL_CONFIG.custodies.find(i => i.mintKey.toBase58()=== getTokenAddress(payToken));
  if(!payTokenCustody){
    throw "poolTokenCustody not found";
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
            NATIVE_MINT, 
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          )
        );
      } else {
        console.log("sol ata exists");
      }
    }

    if (liquidityAmountIn) {
      const lpAmount = new BN(liquidityAmountIn * 10 ** POOL_CONFIG.lpDecimals);
      const minAmountOutBN = (new BN(minAmountOut * 10** payTokenCustody.decimals)).mul(new BN(100-slippage)).div(new BN(100));

      console.log(">> minAmountOutBN:",minAmountOutBN.toString())
      const removeLiquidityTx = await perpetual_program.methods
        .removeLiquidity({ 
            lpAmountIn : lpAmount,
            minAmountOut : minAmountOutBN
         })
        .accounts({
          // @ts-expect-error - owner property exists in anchor program accounts
          owner: publicKey,
          receivingAccount: userCustodyTokenAccount, // user token account for custody token account
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
      transaction = transaction.add(removeLiquidityTx);
    }

    // console.log("add liquidity tx", transaction);
    // console.log("tx keys");

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
