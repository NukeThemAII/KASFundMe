export type CampaignState = "ACTIVE" | "SUCCESSFUL" | "FAILED";

export interface CampaignMetadata {
  title: string;
  summary: string;
  metadataUri?: string;
  image?: string;
}

export interface CampaignSummary {
  address: string;
  creator: string;
  beneficiary: string;
  goalWei: string;
  goalKas: number;
  raisedWei: string;
  raisedKas: number;
  netRaisedWei: string;
  netRaisedKas: number;
  refundedWei: string;
  refundedKas: number;
  feeAccruedWei: string;
  feeAccruedKas: number;
  deadline: string;
  createdAt: string;
  status: CampaignState;
  chainId: number;
  feeBps: number;
  contributionCount: number;
  supporterCount: number;
  metadata: CampaignMetadata;
}

export interface ContributionEvent {
  id: string;
  txHash: string;
  contributor: string;
  amountWei: string;
  amountKas: number;
  feeWei: string;
  feeKas: number;
  blockNumber: number;
  blockTime: string;
}

export interface FinalizeEvent {
  caller: string;
  beneficiary: string;
  payoutWei: string;
  payoutKas: number;
  feeWei: string;
  feeKas: number;
  txHash: string;
  blockNumber: number;
  blockTime: string;
}

export interface RefundEvent {
  id: string;
  txHash: string;
  contributor: string;
  amountWei: string;
  amountKas: number;
  blockNumber: number;
  blockTime: string;
}

export interface CampaignDetail extends CampaignSummary {
  contributions: ContributionEvent[];
  refunds: RefundEvent[];
  finalization: FinalizeEvent | null;
}

export interface PlatformStats {
  totalCampaigns: number;
  totalRaisedWei: string;
  totalRaisedKas: number;
  totalFeesWei: string;
  totalFeesKas: number;
  totalRefundedWei: string;
  totalRefundedKas: number;
  activeCampaigns: number;
  contributors: number;
}
