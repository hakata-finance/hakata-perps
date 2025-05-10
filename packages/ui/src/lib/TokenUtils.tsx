import { SolanaIconCircle } from "@/components/vault/SolanaIconCircle";
import { UsdcIconCircle } from "@/components/vault/UsdcIconCircle";
import { SOL_MINT_ADDRESS, USDC_MINT_ADDRESS } from "./constants";

//rename to TokenE
export enum TokenE {
  SOL = "SOL",
  USDC = "USDC",
}
export const TOKEN_LIST = [
  TokenE.SOL,
  TokenE.USDC,
];

export function asTokenE(tokenStr: string): TokenE {
  switch (tokenStr) {
    case "SOL":
      return TokenE.SOL;
    case "USDC":
      return TokenE.USDC;  

    default:
      throw new Error("Not a valid token string");
  }
}

export function getTokenELabel(token: TokenE) {
  switch (token) {
    case TokenE.SOL:
      return "Solana";
    case TokenE.USDC:
      return "UDC Coin"; 
  }
}

export function getTokenSymbol(token: TokenE) {
  switch (token) {
    case TokenE.USDC:
      return "USDC";
    case TokenE.SOL:
      return "SOL";   
  }
}

export function getSymbol(token: TokenE) {
  switch (token) {
    case TokenE.SOL:
      return "SOLUSD";
    case TokenE.USDC:
      return "USDCUSD";
  }
}

export function getTokenEIcon(token: string) {
  switch (token) {
    case TokenE.SOL:
      return <SolanaIconCircle />;
    case TokenE.USDC:
      return <UsdcIconCircle />;
      
      default:
        return <></>;
  }
}

export function getTokenEId(token: TokenE) {
  switch (token) {
    case TokenE.SOL:
      return "solana";

    case TokenE.USDC:
      return "usd-coin";
  }
}

export function tokenAddressToTokenE(address: string): TokenE {
  switch (address) {
    case SOL_MINT_ADDRESS:
      return TokenE.SOL;
    
    case USDC_MINT_ADDRESS:
      return TokenE.USDC;

    default:
      throw new Error("Not a valid token string");
  }
}

export function getTokenAddress(token: TokenE) {
  switch (token) {
    case TokenE.SOL:
      return SOL_MINT_ADDRESS;
    
    case TokenE.USDC:
      return USDC_MINT_ADDRESS;
  }
}
