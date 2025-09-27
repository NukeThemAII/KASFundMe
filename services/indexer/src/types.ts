export interface CampaignRow {
  address: string;
  creator: string;
  beneficiary: string;
  goal: string;
  deadline: Date;
  metadata_uri: string | null;
  created_at: Date;
  tx_hash: string;
  block_number: number;
  status: string;
  chain_id: number;
  implementation: string;
  fee_bps: number;
  factory_address: string;
}

export interface ContributionRow {
  id: string;
  campaign_address: string;
  contributor: string;
  amount: string;
  fee: string;
  tx_hash: string;
  log_index: number;
  block_number: number;
  block_time: Date;
}

export interface RefundRow {
  id: string;
  campaign_address: string;
  contributor: string;
  amount: string;
  tx_hash: string;
  log_index: number;
  block_number: number;
  block_time: Date;
}

export interface FinalizationRow {
  campaign_address: string;
  caller: string;
  beneficiary: string;
  payout: string;
  fee_total: string;
  tx_hash: string;
  block_number: number;
  block_time: Date;
}
