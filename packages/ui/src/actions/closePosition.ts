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
  Transaction,
} from "@solana/web3.js";
import { Side } from "@/lib/types";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";

export async function closePosition(
  program: Program<HakataPerpetuals>,
  publicKey: PublicKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction: any,
  connection: Connection,
  positionAccount: PublicKey,
  payToken: TokenE,
  side: Side,
  price: BN
) {
  console.log(
    ">> closePosition inputs",
    positionAccount.toString(),
    payToken,
    side,
    Number(price)
  );

  const payTokenCustody = POOL_CONFIG.custodies.find(i => i.mintKey.toBase58() === getTokenAddress(payToken));
  if (!payTokenCustody) {
    throw new Error("payTokenCustody not found");
  }
  console.log("payTokenCustody:", payTokenCustody);

  const tokenAddress = getTokenAddress(payToken);
  if (!tokenAddress) {
    throw new Error(`Token address not found for ${payToken}`);
  }

  const userCustodyTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    publicKey
  );

  // check if user custody token account exists
  if (!(await checkIfAccountExists(userCustodyTokenAccount, connection))) {
    console.log("user custody token account does not exist");
  }

  let transaction = new Transaction();

  try {
    console.log("position account", positionAccount.toString());

    const params = {
      price: price,
    };
    
    const tx = await program.methods
      .closePosition(params)
      .accountsPartial({
        owner: publicKey,
        receivingAccount: userCustodyTokenAccount,
        transferAuthority: transferAuthorityAddress,
        perpetuals: perpetualsAddress,
        pool: POOL_CONFIG.poolAddress,
        position: positionAccount,
        custody: payTokenCustody.custodyAccount,
        custodyOracleAccount: payTokenCustody.oracleAddress,
        custodyTokenAccount: payTokenCustody.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("close position tx", transaction);

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