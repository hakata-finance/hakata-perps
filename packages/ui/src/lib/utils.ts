import { BN } from "@coral-xyz/anchor";
import { clsx, type ClassValue } from "clsx"
import IDL from "@/target/idl/hakata_perpetuals.json";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get a constant from the IDL or throw an error if it's not found
 * @param name The name of the constant
 * @returns The value of the constant
 */
export const getConstantOrThrow = (name: string) => {
  const constant = IDL.constants.find((c) => c.name === name)?.value;
  if (constant === undefined) {
    throw new Error(`${name} not found in IDL constants`);
  }
  return constant;
};

/**
 * Converts a byte array encoded as a string to a string
 * @param byteArray The byte array to convert encoded as a string
 * @returns The string representation of the byte array
 */
export function getStringFromByteArray(byteArray: string | undefined): string {
  if (!byteArray) {
    return "";
  }
  return Buffer.from(JSON.parse(byteArray)).toString("utf8");
}

// 99999123456
// 99999.123456
// 99999.123
export function toUiDecimals(
  nativeAmount: BN  | number | string,
  decimals: number,
  precision = 3,
  commaSeperated = false
): string {
  // TODO: remove BN and upgrade to bigint https://github.com/solana-labs/solana/issues/27440

  if(precision> decimals){
    throw "not allowed precision> decimals"
  }
  let r = '';

  if (nativeAmount instanceof BN) {
    const nativeAmountString = nativeAmount.toString();
    // get decimals 
    const d = nativeAmountString.slice((decimals) * -1);
    const p = d.slice(0 ,precision);
    const nativeAmountWithoutDecimalsStr = nativeAmount.div(new BN( 10 ** decimals)).toString();

     r =  nativeAmountWithoutDecimalsStr + "." + p;
  } else if (typeof nativeAmount === "string") {
    if ( isNaN(Number(nativeAmount))) {
        throw "String No valid "
    }

    const d = nativeAmount.slice((decimals) * -1);
    const p = d.slice(0 ,precision);
    const nativeAmountWithoutDecimalsStr = (new BN(nativeAmount)).div(new BN( 10 ** decimals)).toString();

     r = nativeAmountWithoutDecimalsStr + "." + p;
  } else if (typeof nativeAmount === "number") {
    const d = nativeAmount.toString().slice((decimals) * -1);
    const p = d.slice(0 ,precision);
    const nativeAmountWithoutDecimalsStr = (new BN(nativeAmount)).div(new BN( 10 ** decimals)).toString();
     r = nativeAmountWithoutDecimalsStr + "." + p;
  } else {
      return 'type unknown'
  }

  if(commaSeperated){
    return Number(r).toLocaleString();
  } else {
    return r;
  }
}
