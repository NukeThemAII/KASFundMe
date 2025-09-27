import { PoolClient } from "pg";
import { query, withTransaction } from "./db.js";
import { CampaignRow, ContributionRow, FinalizationRow, RefundRow } from "./types.js";

interface CampaignUpsertInput {
  address: string;
  creator: string;
  beneficiary: string;
  goal: string;
  deadline: Date;
  metadataUri?: string | null;
  createdAt: Date;
  txHash: string;
  blockNumber: bigint;
  status?: string;
  chainId: number;
  implementation: string;
  feeBps: number;
  factoryAddress: string;
}

export async function upsertCampaign(data: CampaignUpsertInput, client?: PoolClient) {
  const runner = client ?? query;
  await runner(
    `INSERT INTO campaigns (
        address,
        creator,
        beneficiary,
        goal,
        deadline,
        metadata_uri,
        created_at,
        tx_hash,
        block_number,
        status,
        chain_id,
        implementation,
        fee_bps,
        factory_address
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'ACTIVE'), $11, $12, $13, $14
      )
      ON CONFLICT (address) DO UPDATE SET
        creator = EXCLUDED.creator,
        beneficiary = EXCLUDED.beneficiary,
        goal = EXCLUDED.goal,
        deadline = EXCLUDED.deadline,
        metadata_uri = EXCLUDED.metadata_uri,
        tx_hash = EXCLUDED.tx_hash,
        block_number = EXCLUDED.block_number,
        status = EXCLUDED.status,
        chain_id = EXCLUDED.chain_id,
        implementation = EXCLUDED.implementation,
        fee_bps = EXCLUDED.fee_bps,
        factory_address = EXCLUDED.factory_address,
        created_at = LEAST(campaigns.created_at, EXCLUDED.created_at)
    `,
    [
      data.address,
      data.creator,
      data.beneficiary,
      data.goal,
      data.deadline.toISOString(),
      data.metadataUri ?? null,
      data.createdAt.toISOString(),
      data.txHash,
      data.blockNumber.toString(),
      data.status ?? null,
      data.chainId,
      data.implementation,
      data.feeBps,
      data.factoryAddress,
    ],
  );
}

export async function insertContribution(entry: {
  campaignAddress: string;
  contributor: string;
  amount: string;
  fee: string;
  txHash: string;
  logIndex: number;
  blockNumber: bigint;
  blockTime: Date;
}) {
  await query(
    `INSERT INTO contributions (
        campaign_address,
        contributor,
        amount,
        fee,
        tx_hash,
        log_index,
        block_number,
        block_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (tx_hash, log_index) DO NOTHING`,
    [
      entry.campaignAddress,
      entry.contributor,
      entry.amount,
      entry.fee,
      entry.txHash,
      entry.logIndex,
      entry.blockNumber.toString(),
      entry.blockTime.toISOString(),
    ],
  );
}

export async function insertRefund(entry: {
  campaignAddress: string;
  contributor: string;
  amount: string;
  txHash: string;
  logIndex: number;
  blockNumber: bigint;
  blockTime: Date;
}) {
  await query(
    `INSERT INTO refunds (
        campaign_address,
        contributor,
        amount,
        tx_hash,
        log_index,
        block_number,
        block_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (tx_hash, log_index) DO NOTHING`,
    [
      entry.campaignAddress,
      entry.contributor,
      entry.amount,
      entry.txHash,
      entry.logIndex,
      entry.blockNumber.toString(),
      entry.blockTime.toISOString(),
    ],
  );
}

export async function upsertFinalization(entry: {
  campaignAddress: string;
  caller: string;
  beneficiary: string;
  payout: string;
  feeTotal: string;
  txHash: string;
  blockNumber: bigint;
  blockTime: Date;
}) {
  await query(
    `INSERT INTO finalizations (
        campaign_address,
        caller,
        beneficiary,
        payout,
        fee_total,
        tx_hash,
        block_number,
        block_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (campaign_address) DO UPDATE SET
        caller = EXCLUDED.caller,
        beneficiary = EXCLUDED.beneficiary,
        payout = EXCLUDED.payout,
        fee_total = EXCLUDED.fee_total,
        tx_hash = EXCLUDED.tx_hash,
        block_number = EXCLUDED.block_number,
        block_time = EXCLUDED.block_time
    `,
    [
      entry.campaignAddress,
      entry.caller,
      entry.beneficiary,
      entry.payout,
      entry.feeTotal,
      entry.txHash,
      entry.blockNumber.toString(),
      entry.blockTime.toISOString(),
    ],
  );

  await setCampaignStatus(entry.campaignAddress, "SUCCESSFUL");
}

export async function setCampaignStatus(address: string, status: string) {
  await query(`UPDATE campaigns SET status = $2 WHERE address = $1`, [address, status]);
}

export async function recordMetadataUpdate(entry: {
  campaignAddress: string;
  metadataUri: string;
  txHash: string;
  logIndex: number;
  blockNumber: bigint;
  blockTime: Date;
}) {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO metadata_updates (
          campaign_address,
          metadata_uri,
          tx_hash,
          log_index,
          block_number,
          block_time
        ) VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (tx_hash, log_index) DO NOTHING`,
      [
        entry.campaignAddress,
        entry.metadataUri,
        entry.txHash,
        entry.logIndex,
        entry.blockNumber.toString(),
        entry.blockTime.toISOString(),
      ],
    );

    await client.query(`UPDATE campaigns SET metadata_uri = $2 WHERE address = $1`, [
      entry.campaignAddress,
      entry.metadataUri,
    ]);
  });
}

export async function getIndexerProgress(name: string): Promise<bigint | null> {
  const { rows } = await query<{ last_block: string }>(
    `SELECT last_block FROM indexer_progress WHERE name = $1`,
    [name],
  );
  if (!rows[0]) return null;
  return BigInt(rows[0].last_block);
}

export async function setIndexerProgress(name: string, blockNumber: bigint) {
  await query(
    `INSERT INTO indexer_progress (name, last_block)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET
        last_block = EXCLUDED.last_block,
        updated_at = NOW()
    `,
    [name, blockNumber.toString()],
  );
}

export interface CampaignSummary {
  address: string;
  creator: string;
  beneficiary: string;
  goal: string;
  deadline: Date;
  metadataUri: string | null;
  createdAt: Date;
  status: string;
  chainId: number;
  feeBps: number;
  totalRaised: string;
  totalFees: string;
  totalRefunded: string;
  contributionCount: number;
  supporterCount: number;
}

export async function getCampaignSummaries(limit: number, offset: number) {
  const { rows } = await query<CampaignSummary>(
    `WITH contribution_stats AS (
        SELECT
          campaign_address,
          SUM(amount) AS total_amount,
          SUM(fee) AS total_fee,
          COUNT(*) AS contribution_count,
          COUNT(DISTINCT contributor) AS supporter_count
        FROM contributions
        GROUP BY campaign_address
      ),
      refund_stats AS (
        SELECT
          campaign_address,
          SUM(amount) AS total_amount
        FROM refunds
        GROUP BY campaign_address
      )
     SELECT
       c.address,
       c.creator,
       c.beneficiary,
       c.goal::text AS goal,
       c.deadline,
       c.metadata_uri AS "metadataUri",
       c.created_at AS "createdAt",
       c.status,
       c.chain_id AS "chainId",
       c.fee_bps AS "feeBps",
       COALESCE(cs.total_amount, '0') AS "totalRaised",
       COALESCE(cs.total_fee, '0') AS "totalFees",
       COALESCE(rs.total_amount, '0') AS "totalRefunded",
       COALESCE(cs.contribution_count, 0) AS "contributionCount",
       COALESCE(cs.supporter_count, 0) AS "supporterCount"
     FROM campaigns c
     LEFT JOIN contribution_stats cs ON cs.campaign_address = c.address
     LEFT JOIN refund_stats rs ON rs.campaign_address = c.address
     ORDER BY c.created_at DESC
     LIMIT $1 OFFSET $2` as any,
    [limit, offset],
  );

  return rows;
}

export async function getCampaignCount(): Promise<number> {
  const { rows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM campaigns`,
  );
  return Number(rows[0]?.count ?? "0");
}

export interface CampaignDetail extends CampaignSummary {
  contributions: ContributionRow[];
  refunds: RefundRow[];
  finalization: FinalizationRow | null;
}

export async function getCampaignDetail(address: string): Promise<CampaignDetail | null> {
  const { rows } = await query<CampaignSummary>(
    `WITH contribution_stats AS (
        SELECT
          campaign_address,
          SUM(amount) AS total_amount,
          SUM(fee) AS total_fee,
          COUNT(*) AS contribution_count,
          COUNT(DISTINCT contributor) AS supporter_count
        FROM contributions
        WHERE campaign_address = $1
        GROUP BY campaign_address
      ),
      refund_stats AS (
        SELECT campaign_address, SUM(amount) AS total_amount
        FROM refunds
        WHERE campaign_address = $1
        GROUP BY campaign_address
      )
      SELECT
        c.address,
        c.creator,
        c.beneficiary,
        c.goal::text AS goal,
        c.deadline,
        c.metadata_uri AS "metadataUri",
        c.created_at AS "createdAt",
        c.status,
        c.chain_id AS "chainId",
        c.fee_bps AS "feeBps",
        COALESCE(cs.total_amount, '0') AS "totalRaised",
        COALESCE(cs.total_fee, '0') AS "totalFees",
        COALESCE(rs.total_amount, '0') AS "totalRefunded",
        COALESCE(cs.contribution_count, 0) AS "contributionCount",
        COALESCE(cs.supporter_count, 0) AS "supporterCount"
      FROM campaigns c
      LEFT JOIN contribution_stats cs ON cs.campaign_address = c.address
      LEFT JOIN refund_stats rs ON rs.campaign_address = c.address
      WHERE c.address = $1`,
    [address],
  );

  const summary = rows[0];
  if (!summary) return null;

  const contributionsQuery = await query<ContributionRow>(
    `SELECT
        id::text,
        campaign_address,
        contributor,
        amount::text AS amount,
        fee::text AS fee,
        tx_hash AS "tx_hash",
        log_index,
        block_number::bigint AS block_number,
        block_time
      FROM contributions
      WHERE campaign_address = $1
      ORDER BY block_number DESC, log_index DESC` as any,
    [address],
  );

  const refundsQuery = await query<RefundRow>(
    `SELECT
        id::text,
        campaign_address,
        contributor,
        amount::text AS amount,
        tx_hash,
        log_index,
        block_number::bigint AS block_number,
        block_time
      FROM refunds
      WHERE campaign_address = $1
      ORDER BY block_number DESC, log_index DESC` as any,
    [address],
  );

  const finalizationQuery = await query<FinalizationRow>(
    `SELECT
        campaign_address,
        caller,
        beneficiary,
        payout::text AS payout,
        fee_total::text AS fee_total,
        tx_hash,
        block_number::bigint AS block_number,
        block_time
      FROM finalizations
      WHERE campaign_address = $1` as any,
    [address],
  );

  return {
    ...summary,
    contributions: contributionsQuery.rows,
    refunds: refundsQuery.rows,
    finalization: finalizationQuery.rows[0] ?? null,
  };
}

export async function getPlatformStats() {
  const { rows } = await query<{
    total_campaigns: number;
    total_raised: string;
    total_fees: string;
    total_refunded: string;
    active_campaigns: number;
    distinct_contributors: number;
  }>(
    `WITH contribution_totals AS (
        SELECT
          campaign_address,
          SUM(amount) AS total_amount,
          SUM(fee) AS total_fee
        FROM contributions
        GROUP BY campaign_address
      ),
      refund_totals AS (
        SELECT
          campaign_address,
          SUM(amount) AS total_amount
        FROM refunds
        GROUP BY campaign_address
      ),
      contributor_totals AS (
        SELECT COUNT(DISTINCT contributor) AS total
        FROM contributions
      )
      SELECT
        (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
        COALESCE(SUM(ct.total_amount), '0') AS total_raised,
        COALESCE(SUM(ct.total_fee), '0') AS total_fees,
        COALESCE(SUM(rt.total_amount), '0') AS total_refunded,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'ACTIVE') AS active_campaigns,
        COALESCE((SELECT total FROM contributor_totals), 0) AS distinct_contributors
      FROM contribution_totals ct
      FULL JOIN refund_totals rt ON rt.campaign_address = ct.campaign_address` as any,
  );

  const row = rows[0];
  if (!row) {
    return {
      totalCampaigns: 0,
      totalRaised: "0",
      totalFees: "0",
      totalRefunded: "0",
      activeCampaigns: 0,
      distinctContributors: 0,
    };
  }

  return {
    totalCampaigns: Number(row.total_campaigns ?? 0),
    totalRaised: row.total_raised ?? "0",
    totalFees: row.total_fees ?? "0",
    totalRefunded: row.total_refunded ?? "0",
    activeCampaigns: Number(row.active_campaigns ?? 0),
    distinctContributors: Number(row.distinct_contributors ?? 0),
  };
}
