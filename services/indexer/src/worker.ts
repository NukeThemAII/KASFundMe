import { Address, createPublicClient, decodeEventLog, http } from "viem";
import factoryAbiJson from "@kasfundme/abi/CampaignFactory.json" assert { type: "json" };
import campaignAbiJson from "@kasfundme/abi/Campaign.json" assert { type: "json" };
import { config } from "./config.js";
import { kasplexTestnet } from "./chains.js";
import { logger } from "./logger.js";
import {
  getCampaignAddresses,
  normalizeAddress,
} from "./workerUtils.js";
import {
  getIndexerProgress,
  insertContribution,
  insertRefund,
  recordMetadataUpdate,
  setCampaignStatus,
  setIndexerProgress,
  upsertCampaign,
  upsertFinalization,
} from "./repository.js";
import { pool } from "./db.js";

const factoryAbi = factoryAbiJson as any[];
const campaignAbi = campaignAbiJson as any[];

const client = createPublicClient({
  chain: kasplexTestnet,
  transport: http(config.rpcUrl),
});

const batchSize = BigInt(config.batchSize);

const blockTimestampCache = new Map<bigint, Date>();

async function getBlockTimestamp(blockNumber: bigint): Promise<Date> {
  const cached = blockTimestampCache.get(blockNumber);
  if (cached) return cached;
  const block = await client.getBlock({ blockNumber });
  const timestamp = new Date(Number(block.timestamp) * 1000);
  blockTimestampCache.set(blockNumber, timestamp);
  if (blockTimestampCache.size > 512) {
    const [oldestKey] = blockTimestampCache.keys();
    blockTimestampCache.delete(oldestKey);
  }
  return timestamp;
}

const factoryEvents = factoryAbi.filter(
  (item) => item.type === "event" && item.name === "CampaignCreated",
);

const campaignEvents = campaignAbi.filter((item) =>
  item.type === "event" && ["Contributed", "Refunded", "Finalized", "MetadataUpdated"].includes(item.name),
);

async function processFactoryRange(fromBlock: bigint, toBlock: bigint) {
  if (factoryEvents.length === 0) return;

  const logs = await client.getLogs({
    address: config.factoryAddress,
    events: factoryEvents,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: factoryAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "CampaignCreated") continue;

      const { campaign, creator, beneficiary, goal, deadline, metadataUri } = decoded
        .args as unknown as {
        campaign: Address;
        creator: Address;
        beneficiary: Address;
        goal: bigint;
        deadline: bigint;
        metadataUri: string;
      };

      const blockTime = await getBlockTimestamp(log.blockNumber);
      await upsertCampaign({
        address: normalizeAddress(campaign),
        creator: normalizeAddress(creator),
        beneficiary: normalizeAddress(beneficiary),
        goal: goal.toString(),
        deadline: new Date(Number(deadline) * 1000),
        metadataUri: metadataUri || null,
        createdAt: blockTime,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        status: "ACTIVE",
        chainId: config.chainId,
        implementation: config.campaignImplementation,
        feeBps: 100,
        factoryAddress: config.factoryAddress,
      });
    } catch (error) {
      logger.error({ error, blockNumber: log.blockNumber }, "Failed to process CampaignCreated event");
    }
  }
}

async function processCampaignRange(fromBlock: bigint, toBlock: bigint) {
  const addresses = await getCampaignAddresses();
  if (addresses.length === 0 || campaignEvents.length === 0) return;

  const logs = await client.getLogs({
    address: addresses as Address[],
    events: campaignEvents,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: campaignAbi,
        data: log.data,
        topics: log.topics,
      });

      const blockTime = await getBlockTimestamp(log.blockNumber);
      const campaignAddress = normalizeAddress(log.address);

      switch (decoded.eventName) {
        case "Contributed": {
          const { contributor, amount, fee } = decoded.args as unknown as {
            contributor: Address;
            amount: bigint;
            fee: bigint;
          };
          await insertContribution({
            campaignAddress,
            contributor: normalizeAddress(contributor),
            amount: amount.toString(),
            fee: fee.toString(),
            txHash: log.transactionHash,
            logIndex: Number(log.logIndex),
            blockNumber: log.blockNumber,
            blockTime,
          });
          break;
        }
        case "Refunded": {
          const { contributor, amount } = decoded.args as unknown as {
            contributor: Address;
            amount: bigint;
          };
          await insertRefund({
            campaignAddress,
            contributor: normalizeAddress(contributor),
            amount: amount.toString(),
            txHash: log.transactionHash,
            logIndex: Number(log.logIndex),
            blockNumber: log.blockNumber,
            blockTime,
          });
          await setCampaignStatus(campaignAddress, "FAILED");
          break;
        }
        case "Finalized": {
          const { caller, beneficiary, payout, feeTotal } = decoded.args as unknown as {
            caller: Address;
            beneficiary: Address;
            payout: bigint;
            feeTotal: bigint;
          };
          await upsertFinalization({
            campaignAddress,
            caller: normalizeAddress(caller),
            beneficiary: normalizeAddress(beneficiary),
            payout: payout.toString(),
            feeTotal: feeTotal.toString(),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            blockTime,
          });
          break;
        }
        case "MetadataUpdated": {
          const { newUri } = decoded.args as unknown as { newUri: string };
          await recordMetadataUpdate({
            campaignAddress,
            metadataUri: newUri,
            txHash: log.transactionHash,
            logIndex: Number(log.logIndex),
            blockNumber: log.blockNumber,
            blockTime,
          });
          break;
        }
        default:
          break;
      }
    } catch (error) {
      logger.error({ error, log }, "Failed to process campaign event");
    }
  }
}

export async function startWorker() {
  logger.info("Indexer worker started");

  while (true) {
    try {
      const latestBlock = await client.getBlockNumber();

      const nextFactoryBlock =
        (await getIndexerProgress("factory")) ?? config.indexerFromBlock;
      if (nextFactoryBlock <= latestBlock) {
        for (let start = nextFactoryBlock; start <= latestBlock; start += batchSize) {
          const end = start + batchSize - 1n;
          const toBlock = end > latestBlock ? latestBlock : end;
          await processFactoryRange(start, toBlock);
          await setIndexerProgress("factory", toBlock + 1n);
        }
      }

      const nextCampaignBlock =
        (await getIndexerProgress("campaigns")) ?? config.indexerFromBlock;
      if (nextCampaignBlock <= latestBlock) {
        for (let start = nextCampaignBlock; start <= latestBlock; start += batchSize) {
          const end = start + batchSize - 1n;
          const toBlock = end > latestBlock ? latestBlock : end;
          await processCampaignRange(start, toBlock);
          await setIndexerProgress("campaigns", toBlock + 1n);
        }
      }
    } catch (error) {
      logger.error({ error }, "Indexer loop error");
    }

    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
}

const cliEntrypoints = ["worker.ts", "worker.js"];
const invokedDirectly = process.argv[1]
  ? cliEntrypoints.some((name) => process.argv[1]!.endsWith(name))
  : false;

if (invokedDirectly) {
  startWorker().catch((error) => {
    logger.error({ error }, "Indexer worker crashed");
    pool.end().finally(() => process.exit(1));
  });
}
