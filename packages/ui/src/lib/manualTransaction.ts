import { sendSignedTransactionAndNotify } from "./TransactionHandlers";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export async function manualSendTransaction(
  transaction: Transaction,
  publicKey: PublicKey,
  connection: Connection,
  signTransaction: any,
  otherSigner?: Keypair,
  successMessage?: string,
  failMessage? :string
) {
  // try {
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("finalized")
    ).blockhash;

    await sendSignedTransactionAndNotify({
      connection,
      transaction,
      successMessage: successMessage ?? "",
      failMessage: failMessage ?? "",
      signTransaction,
      enableSigning: true
    })
  //   console.log("in man send tx");


  //   if (otherSigner) {
  //     transaction.sign(otherSigner);
  //   }

  //   transaction = await signTransaction(transaction);
  //   const rawTransaction = transaction.serialize();

  //   let signature = await connection.sendRawTransaction(rawTransaction, {
  //     skipPreflight: false,
  //   });
  //   console.log(
  //     `sent raw, waiting : https://explorer.solana.com/tx/${signature}?cluster=devnet`
  //   );
  //   await connection.confirmTransaction(signature, "confirmed");
  //   console.log(
  //     `sent tx!!! :https://explorer.solana.com/tx/${signature}?cluster=devnet`
  //   );
  // } catch (error) {
  //   console.log("man error?", error);
  // }
}
