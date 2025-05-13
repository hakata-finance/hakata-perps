import { UsdcIconCircle } from "@/components/vault/UsdcIconCircle";
import { USDC_MINT_ADDRESS } from "./constants";
import { AaplIconCircle } from "@/components/trade/AaplIconCircle";

//rename to TokenE
export enum TokenE {
  USDC = "USDC",
  AAPL = "AAPL",
}
export const TOKEN_LIST = [
  TokenE.USDC,
  TokenE.AAPL,
];

export function asTokenE(tokenStr: string): TokenE {
  switch (tokenStr) {
    case "USDC":
      return TokenE.USDC; 
    case "AAPL":
      return TokenE.AAPL;

    default:
      throw new Error("Not a valid token string");
  }
}

export function getTokenELabel(token: TokenE) {
  switch (token) {
    case TokenE.USDC:
      return "UDC Coin"; 
    case TokenE.AAPL:
      return "AAPL";
  }
}

export function getTokenSymbol(token: TokenE) {
  switch (token) {
    case TokenE.USDC:
      return "USDC";
    case TokenE.AAPL:
      return "AAPL";   
  }
}

export function getSymbol(token: TokenE) {
  switch (token) {
    case TokenE.USDC:
      return "USDCUSD";
    case TokenE.AAPL:
      return "AAPLUSD";
  }
}

export function getTokenEIcon(token: string) {
  switch (token) {
    case TokenE.USDC:
      return <UsdcIconCircle />;
    case TokenE.AAPL:
      return <AaplIconCircle />;
      
      default:
        return <></>;
  }
}

export function getTokenEId(token: TokenE) {
  switch (token) {
    case TokenE.USDC:
      return "usd-coin";
    case TokenE.AAPL:
      return "aapl";
  }
}

export function tokenAddressToTokenE(address: string): TokenE {
  switch (address) {
    case USDC_MINT_ADDRESS:
      return TokenE.USDC;
    default:
      throw new Error("Not a valid token string");
  }
}

export function getTokenAddress(token: TokenE) {
  switch (token) {    
    case TokenE.USDC:
      return USDC_MINT_ADDRESS;
  }
}
