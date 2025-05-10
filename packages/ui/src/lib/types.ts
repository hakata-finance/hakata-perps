import { HakataPerpetuals } from "@/target/types/hakata_perpetuals";
import { IdlAccounts } from "@coral-xyz/anchor";

// Accounts
export type Pool = IdlAccounts<HakataPerpetuals>["pool"];
export type Custody = IdlAccounts<HakataPerpetuals>["custody"];

// Events

// Types

// Custom Frontend Types
