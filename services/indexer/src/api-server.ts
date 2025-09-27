import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { formatUnits, isAddress } from "viem";
import { config } from "./config.js";
import { logger } from "./logger.js";
import {
  CampaignDetail,
  CampaignSummary,
  getCampaignCount,
  getCampaignDetail,
  getCampaignSummaries,
  getPlatformStats,
} from "./repository.js";

function toKas(value: string): string {
  try {
    return formatUnits(BigInt(value), 18);
  } catch {
    return "0";
  }
}

function mapSummary(summary: CampaignSummary) {
  const raisedNet = BigInt(summary.totalRaised ?? "0") - BigInt(summary.totalRefunded ?? "0");
  return {
    address: summary.address,
    creator: summary.creator,
    beneficiary: summary.beneficiary,
    goalWei: summary.goal,
    goalKas: toKas(summary.goal),
    raisedWei: summary.totalRaised ?? "0",
    raisedKas: toKas(summary.totalRaised ?? "0"),
    netRaisedWei: raisedNet.toString(),
    netRaisedKas: toKas(raisedNet.toString()),
    refundedWei: summary.totalRefunded ?? "0",
    refundedKas: toKas(summary.totalRefunded ?? "0"),
    feeAccruedWei: summary.totalFees ?? "0",
    feeAccruedKas: toKas(summary.totalFees ?? "0"),
    deadline: summary.deadline.toISOString(),
    createdAt: summary.createdAt.toISOString(),
    metadataUri: summary.metadataUri,
    status: summary.status,
    chainId: summary.chainId,
    feeBps: summary.feeBps,
    contributionCount: summary.contributionCount,
    supporterCount: summary.supporterCount,
  };
}

function mapDetail(detail: CampaignDetail) {
  return {
    ...mapSummary(detail),
    contributions: detail.contributions.map((row) => ({
      id: row.id,
      contributor: row.contributor,
      amountWei: row.amount,
      amountKas: toKas(row.amount),
      feeWei: row.fee,
      feeKas: toKas(row.fee),
      txHash: row.tx_hash,
      blockNumber: Number(row.block_number),
      blockTime: row.block_time.toISOString(),
    })),
    refunds: detail.refunds.map((row) => ({
      id: row.id,
      contributor: row.contributor,
      amountWei: row.amount,
      amountKas: toKas(row.amount),
      txHash: row.tx_hash,
      blockNumber: Number(row.block_number),
      blockTime: row.block_time.toISOString(),
    })),
    finalization: detail.finalization
      ? {
          caller: detail.finalization.caller,
          beneficiary: detail.finalization.beneficiary,
          payoutWei: detail.finalization.payout,
          payoutKas: toKas(detail.finalization.payout),
          feeWei: detail.finalization.fee_total,
          feeKas: toKas(detail.finalization.fee_total),
          txHash: detail.finalization.tx_hash,
          blockNumber: Number(detail.finalization.block_number),
          blockTime: detail.finalization.block_time.toISOString(),
        }
      : null,
  };
}

export async function startApiServer() {
  const server = Fastify({
    logger,
  });

  await server.register(cors, {
    origin: true,
  });

  await server.register(sensible);

  server.get("/health", async () => ({ status: "ok" }));

  server.get("/campaigns", async (request, reply) => {
    const { limit = 10, offset = 0 } = request.query as {
      limit?: string | number;
      offset?: string | number;
    };

    const parsedLimit = Math.min(Number(limit ?? 10) || 10, 100);
    const parsedOffset = Math.max(Number(offset ?? 0) || 0, 0);

    const [campaigns, total, stats] = await Promise.all([
      getCampaignSummaries(parsedLimit, parsedOffset),
      getCampaignCount(),
      getPlatformStats(),
    ]);

    return reply.send({
      data: campaigns.map(mapSummary),
      meta: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        stats: {
          totalCampaigns: stats.totalCampaigns,
          totalRaisedWei: stats.totalRaised,
          totalRaisedKas: toKas(stats.totalRaised),
          totalFeesWei: stats.totalFees,
          totalFeesKas: toKas(stats.totalFees),
          totalRefundedWei: stats.totalRefunded,
          totalRefundedKas: toKas(stats.totalRefunded),
          activeCampaigns: stats.activeCampaigns,
          contributors: stats.distinctContributors,
        },
      },
    });
  });

  server.get("/campaign/:address", async (request, reply) => {
    const { address } = request.params as { address: string };
    if (!isAddress(address)) {
      return reply.status(400).send({ error: "Invalid address" });
    }

    const detail = await getCampaignDetail(address.toLowerCase());
    if (!detail) {
      return reply.status(404).send({ error: "Campaign not found" });
    }

    return reply.send({ data: mapDetail(detail) });
  });

  server.get("/stats", async (_request, reply) => {
    const stats = await getPlatformStats();
    return reply.send({
      data: {
        totalCampaigns: stats.totalCampaigns,
        totalRaisedWei: stats.totalRaised,
        totalRaisedKas: toKas(stats.totalRaised),
        totalFeesWei: stats.totalFees,
        totalFeesKas: toKas(stats.totalFees),
        totalRefundedWei: stats.totalRefunded,
        totalRefundedKas: toKas(stats.totalRefunded),
        activeCampaigns: stats.activeCampaigns,
        contributors: stats.distinctContributors,
      },
    });
  });

  const port = config.apiPort;
  await server.listen({ port, host: "0.0.0.0" });
  logger.info({ port }, "Indexer API listening");

  return server;
}

const cliEntrypoints = ["api-server.ts", "api-server.js"];
const invokedDirectly = process.argv[1]
  ? cliEntrypoints.some((name) => process.argv[1]!.endsWith(name))
  : false;

if (invokedDirectly) {
  startApiServer().catch((error) => {
    logger.error({ error }, "API server failed to start");
    process.exit(1);
  });
}
