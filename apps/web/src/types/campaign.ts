export type CampaignState = "ACTIVE" | "SUCCESSFUL" | "FAILED";

export interface CampaignMetadata {
  title: string;
  summary: string;
  metadataUri?: string;
}

export interface Campaign {
  address: string;
  creator: string;
  beneficiary: string;
  goalKas: number;
  raisedKas: number;
  feeAccruedKas: number;
  deadline: string;
  createdAt: string;
  state: CampaignState;
  metadata: CampaignMetadata;
}

export interface ContributionEvent {
  txHash: string;
  contributor: string;
  amountKas: number;
  feeKas: number;
  blockNumber: number;
  blockTime: string;
}

export interface FinalizeEvent {
  txHash: string;
  payoutKas: number;
  feeKas: number;
  blockNumber: number;
  blockTime: string;
}

export interface RefundEvent {
  txHash: string;
  contributor: string;
  amountKas: number;
  blockNumber: number;
  blockTime: string;
}

export interface CampaignDetail extends Campaign {
  contributions: ContributionEvent[];
  finalized?: FinalizeEvent;
  refunds: RefundEvent[];
}

export interface PlatformStats {
  totalCampaigns: number;
  totalRaisedKas: number;
  totalFeesKas: number;
  activeCampaigns: number;
  contributors: number;
}
