import { config as loadEnv } from "dotenv";
import { z } from "zod";
import addresses from "./addresses.json" assert { type: "json" };

loadEnv();

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/u, "Address must be a 0x-prefixed hex string");

const configSchema = z.object({
  RPC_URL: z.string().url().default("https://rpc.kasplextest.xyz"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FACTORY_ADDRESS: addressSchema.optional(),
  CAMPAIGN_IMPLEMENTATION_ADDRESS: addressSchema.optional(),
  INDEXER_FROM_BLOCK: z
    .string()
    .regex(/^\d+$/u, "INDEXER_FROM_BLOCK must be a positive integer")
    .optional(),
  API_PORT: z
    .string()
    .regex(/^\d+$/u, "API_PORT must be numeric")
    .transform(Number)
    .optional(),
  POLL_INTERVAL_MS: z
    .string()
    .regex(/^\d+$/u)
    .transform(Number)
    .optional(),
  BATCH_SIZE: z
    .string()
    .regex(/^\d+$/u)
    .transform(Number)
    .optional(),
});

const parsed = configSchema.parse(process.env);

const networkRecord = addresses.kasplexTestnet;

const rpcUrl = parsed.RPC_URL;
const chainId = networkRecord.chainId;

const factoryAddress = (parsed.FACTORY_ADDRESS ?? networkRecord.campaignFactory)?.toLowerCase();
const implementationAddress = (
  parsed.CAMPAIGN_IMPLEMENTATION_ADDRESS ?? networkRecord.campaignImplementation
)?.toLowerCase();

if (!factoryAddress || !/^0x[a-fA-F0-9]{40}$/u.test(factoryAddress)) {
  throw new Error(
    "Factory address missing. Set FACTORY_ADDRESS env var or populate services/indexer/src/addresses.json",
  );
}

if (!implementationAddress || !/^0x[a-fA-F0-9]{40}$/u.test(implementationAddress)) {
  throw new Error(
    "Campaign implementation address missing. Set CAMPAIGN_IMPLEMENTATION_ADDRESS env var or populate services/indexer/src/addresses.json",
  );
}

const indexerFromBlock = parsed.INDEXER_FROM_BLOCK ? BigInt(parsed.INDEXER_FROM_BLOCK) : 0n;

export const config = {
  rpcUrl,
  chainId,
  databaseUrl: parsed.DATABASE_URL,
  factoryAddress: factoryAddress as `0x${string}`,
  campaignImplementation: implementationAddress as `0x${string}`,
  indexerFromBlock,
  apiPort: parsed.API_PORT ?? 3001,
  pollIntervalMs: parsed.POLL_INTERVAL_MS ?? 5_000,
  batchSize: parsed.BATCH_SIZE ?? 1_000,
};

export type AppConfig = typeof config;
