import { getTokenAddress, TokenE } from "./TokenUtils";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function checkIfAccountExists(
  account: PublicKey,
  connection: Connection
): Promise<boolean> {
  // console.log("connection print", connection);
  const bal = await connection.getBalance(account);

  if (bal > 0) {
    return true;
  } else {
    return false;
  }
}

export async function fetchTokenBalance(
  payToken: TokenE,
  publicKey: PublicKey,
  connection: Connection
): Promise<number> {
  const  tokenATA = await getAssociatedTokenAddress(
    new PublicKey(getTokenAddress(payToken)),
    publicKey
  );
  
  let balance = 0;

  if (await checkIfAccountExists(tokenATA, connection)) {
    balance = (await connection.getTokenAccountBalance(tokenATA)).value
      .uiAmount!;
  }

  const solBalance = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

  if (payToken === TokenE.SOL) {
    return balance + solBalance;
  }
  return balance;
}

export async function fetchLPBalance(
  address: PublicKey,
  publicKey: PublicKey,
  connection: Connection
): Promise<number> {
  const lpTokenAccount = await getAssociatedTokenAddress(address, publicKey);

  if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
    return 0;
  } else {
    const balance = await connection.getTokenAccountBalance(lpTokenAccount);

    return balance.value.uiAmount!;
  }
}
