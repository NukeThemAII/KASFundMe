import { parseUnits } from "viem";

export interface CampaignSummaryApi {
  address: string;
  creator: string;
  beneficiary: string;
  goalWei: string;
  raisedWei: string;
  netRaisedWei: string;
  refundedWei: string;
  feeAccruedWei: string;
  deadline: string;
  createdAt: string;
  metadataUri?: string | null;
  status: string;
  chainId: number;
  feeBps: number;
  contributionCount: number;
  supporterCount: number;
}

export interface CampaignDetailApi extends CampaignSummaryApi {
  contributions: Array<{
    id: string;
    contributor: string;
    amountWei: string;
    feeWei: string;
    txHash: string;
    blockNumber: number;
    blockTime: string;
  }>;
  refunds: Array<{
    id: string;
    contributor: string;
    amountWei: string;
    txHash: string;
    blockNumber: number;
    blockTime: string;
  }>;
  finalization: null | {
    caller: string;
    beneficiary: string;
    payoutWei: string;
    feeWei: string;
    txHash: string;
    blockNumber: number;
    blockTime: string;
  };
}

export interface PlatformStatsApi {
  totalCampaigns: number;
  totalRaisedWei: string;
  totalFeesWei: string;
  totalRefundedWei: string;
  activeCampaigns: number;
  contributors: number;
}

const kas = (value: number) => parseUnits(value.toString(), 18).toString();

export const fallbackCampaignSummaries: CampaignSummaryApi[] = [
  {
    address: "0x7a7dd8e6b8f51bb8b011f8d8a8e07c730bb5c8e1",
    creator: "0x9f1ac09302f0f56a18f7882c0b8a3c24d68ef001",
    beneficiary: "0x18ff4c0564e0b1211cae54a6488f588d7d5aa002",
    goalWei: kas(25_000),
    raisedWei: kas(18_640),
    netRaisedWei: kas(18_640),
    refundedWei: "0",
    feeAccruedWei: kas(186.4),
    deadline: "2025-10-05T18:00:00.000Z",
    createdAt: "2025-09-20T13:00:00.000Z",
    metadataUri: null,
    status: "ACTIVE",
    chainId: 167012,
    feeBps: 100,
    contributionCount: 3,
    supporterCount: 3,
  },
  {
    address: "0xc17aab1b3636ae2f83b5ea1f40064a2c425c8762",
    creator: "0x10f28c0ad1c0c6803acbf0eb4982f60a6f8fd101",
    beneficiary: "0x610f4eacde031cb6db3531f0cebfaf115d27e220",
    goalWei: kas(40_000),
    raisedWei: kas(21_250),
    netRaisedWei: kas(21_250),
    refundedWei: "0",
    feeAccruedWei: kas(212.5),
    deadline: "2025-10-10T18:00:00.000Z",
    createdAt: "2025-09-18T11:00:00.000Z",
    metadataUri: null,
    status: "ACTIVE",
    chainId: 167012,
    feeBps: 100,
    contributionCount: 2,
    supporterCount: 2,
  },
  {
    address: "0x92e9edba118b19736fbf0d277b829973e4dbd4d9",
    creator: "0xf1040bc982afcf320fed662378f97f03540f1022",
    beneficiary: "0x1118b7d7a0abdcfbfc76bb4f2b8877f32f876143",
    goalWei: kas(50_000),
    raisedWei: kas(37_220),
    netRaisedWei: kas(37_220),
    refundedWei: "0",
    feeAccruedWei: kas(372.2),
    deadline: "2025-10-20T18:00:00.000Z",
    createdAt: "2025-09-14T09:30:00.000Z",
    metadataUri: null,
    status: "SUCCESSFUL",
    chainId: 167012,
    feeBps: 100,
    contributionCount: 3,
    supporterCount: 3,
  },
];

export const fallbackCampaignDetails: Record<string, CampaignDetailApi> = Object.fromEntries(
  fallbackCampaignSummaries.map((summary, index) => [
    summary.address.toLowerCase(),
    {
      ...summary,
      contributions: [
        {
          id: `${index}-1`,
          contributor: summary.creator,
          amountWei: kas(5_000),
          feeWei: kas(50),
          txHash: `0xd1eaa6d6c1f6b84cb3a2ad4f9f85a7e7f1e5fd11${index.toString().padStart(2, "0")}000000000000000000000${index}`,
          blockNumber: 1_205_112 + index,
          blockTime: "2025-09-24T15:21:00.000Z",
        },
      ],
      refunds: [],
      finalization:
        summary.status === "SUCCESSFUL"
          ? {
              caller: summary.creator,
              beneficiary: summary.beneficiary,
              payoutWei: summary.netRaisedWei,
              feeWei: summary.feeAccruedWei,
              txHash: "0xaaa2e3f4a5b68798000000000000000000000000000000000000000000000001",
              blockNumber: 1_205_001,
              blockTime: "2025-09-23T12:00:00.000Z",
            }
          : null,
    },
  ]),
);

export const fallbackPlatformStats: PlatformStatsApi = {
  totalCampaigns: fallbackCampaignSummaries.length,
  totalRaisedWei: fallbackCampaignSummaries
    .reduce((acc, campaign) => acc + BigInt(campaign.raisedWei), 0n)
    .toString(),
  totalFeesWei: fallbackCampaignSummaries
    .reduce((acc, campaign) => acc + BigInt(campaign.feeAccruedWei), 0n)
    .toString(),
  totalRefundedWei: "0",
  activeCampaigns: fallbackCampaignSummaries.filter((c) => c.status === "ACTIVE").length,
  contributors: fallbackCampaignSummaries.reduce(
    (acc, campaign) => acc + campaign.supporterCount,
    0,
  ),
};
