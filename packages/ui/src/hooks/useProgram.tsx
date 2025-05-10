import { useMemo } from "react";
import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import IDL from "@/target/idl/hakata_perpetuals.json";
import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";
import { useAnchorProvider } from "./useAnchorProvider";

/**
 * Hook to get the Anchor Program instance
 * @returns The Anchor Program instance, properly configured with a provider for transactions
 */
export function useProgram() {
  const { connection } = useConnection();
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (provider) {
      // For write operations with wallet connected
      return new Program<HakataPerpetuals>(IDL, provider);
    } else {
      // For read-only operations with no wallet
      return new Program<HakataPerpetuals>(IDL, {
        connection,
      });
    }
  }, [connection, provider]);
}
