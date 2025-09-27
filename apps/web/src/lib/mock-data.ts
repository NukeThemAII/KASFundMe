import type {
  CampaignDetail,
  ContributionEvent,
  PlatformStats,
} from "@/types/campaign";

const contribution = (data: ContributionEvent): ContributionEvent => data;

export const mockCampaigns: CampaignDetail[] = [
  {
    address: "0x7a7dd8e6b8f51bb8b011f8d8a8e07c730bb5c8e1",
    creator: "0x9F1aC09302F0f56a18f7882c0B8a3C24D68eF001",
    beneficiary: "0x18fF4c0564e0B1211Cae54A6488f588d7d5aa002",
    goalKas: 25_000,
    raisedKas: 18_640,
    feeAccruedKas: 186.4,
    deadline: "2025-10-05T18:00:00.000Z",
    createdAt: "2025-09-20T13:00:00.000Z",
    state: "ACTIVE",
    metadata: {
      title: "Kaspa DevRel Guild",
      summary:
        "Funding materials, workshops, and hack incentives to onboard builders into Kasplex zkEVM.",
      metadataUri: "https://gateway.example/ipfs/QmGuild",
    },
    contributions: [
      contribution({
        txHash: "0xd1eaa6d6c1f6b84cb3a2ad4f9f85a7e7f1e5fd11000000000000000000000001",
        contributor: "0x2f51Cefc1d7e6182898A6Fad934e36E7b8B3F111",
        amountKas: 4000,
        feeKas: 40,
        blockNumber: 1_205_112,
        blockTime: "2025-09-24T15:21:00.000Z",
      }),
      contribution({
        txHash: "0xd1eaa6d6c1f6b84cb3a2ad4f9f85a7e7f1e5fd11000000000000000000000002",
        contributor: "0x9E8234Ac1b0F2134a23D3409A9a8f1B248acB998",
        amountKas: 3250,
        feeKas: 32.5,
        blockNumber: 1_205_238,
        blockTime: "2025-09-24T18:30:00.000Z",
      }),
      contribution({
        txHash: "0xd1eaa6d6c1f6b84cb3a2ad4f9f85a7e7f1e5fd11000000000000000000000003",
        contributor: "0x84BfA9E4A61c8bE97E3251a23B6594F640d19B01",
        amountKas: 1800,
        feeKas: 18,
        blockNumber: 1_205_512,
        blockTime: "2025-09-25T09:12:00.000Z",
      }),
    ],
    refunds: [],
  },
  {
    address: "0xc17aab1b3636ae2f83b5ea1f40064a2c425c8762",
    creator: "0x10f28c0ad1C0c6803AcBF0EB4982F60A6F8fD101",
    beneficiary: "0x610F4EAcDE031CB6dB3531f0CEbfaf115d27E220",
    goalKas: 40_000,
    raisedKas: 21_250,
    feeAccruedKas: 212.5,
    deadline: "2025-10-10T18:00:00.000Z",
    createdAt: "2025-09-18T11:00:00.000Z",
    state: "ACTIVE",
    metadata: {
      title: "Open Hardware Miners",
      summary:
        "Grassroots team building energy-efficient miners with open schematics and royalties flowing back to backers.",
    },
    contributions: [
      contribution({
        txHash: "0xa2f4e9e8a3b65f49c2220a0e7a6c9b9f1d2c3b00000000000000000000000001",
        contributor: "0x751ceA4d5375277a0110fbc9b5b391F7a10aAA10",
        amountKas: 5200,
        feeKas: 52,
        blockNumber: 1_204_881,
        blockTime: "2025-09-22T16:42:00.000Z",
      }),
      contribution({
        txHash: "0xa2f4e9e8a3b65f49c2220a0e7a6c9b9f1d2c3b00000000000000000000000002",
        contributor: "0x33D3Cc201Fd01a5380E0dB89f3b1ec9FF1f0cF33",
        amountKas: 7800,
        feeKas: 78,
        blockNumber: 1_204_992,
        blockTime: "2025-09-23T07:18:00.000Z",
      }),
    ],
    refunds: [],
  },
  {
    address: "0x92e9edba118b19736fbf0d277b829973e4dbd4d9",
    creator: "0xf1040Bc982aFCf320fED662378F97f03540f1022",
    beneficiary: "0x1118B7d7a0ABdcfbfC76Bb4f2b8877f32F876143",
    goalKas: 50_000,
    raisedKas: 37_220,
    feeAccruedKas: 372.2,
    deadline: "2025-10-20T18:00:00.000Z",
    createdAt: "2025-09-14T09:30:00.000Z",
    state: "SUCCESSFUL",
    metadata: {
      title: "Kasplex Public Goods Fund",
      summary:
        "Rolling treasury supporting explorers, indexers, and public tooling for the ecosystem.",
      metadataUri: "https://gateway.example/ipfs/QmPublicGoods",
    },
    contributions: [
      contribution({
        txHash: "0xc9d2e3f4a5b68798000000000000000000000000000000000000000000000001",
        contributor: "0x61F35E7f42D79159F0804f03B5e7b9A40d2D1c20",
        amountKas: 9400,
        feeKas: 94,
        blockNumber: 1_204_311,
        blockTime: "2025-09-19T20:05:00.000Z",
      }),
      contribution({
        txHash: "0xc9d2e3f4a5b68798000000000000000000000000000000000000000000000002",
        contributor: "0x22d1D90FA0f54A27c0c0D479D1c8Df46d91A2212",
        amountKas: 12_000,
        feeKas: 120,
        blockNumber: 1_204_420,
        blockTime: "2025-09-20T08:50:00.000Z",
      }),
      contribution({
        txHash: "0xc9d2e3f4a5b68798000000000000000000000000000000000000000000000003",
        contributor: "0x8f8A1Fd7b0e1f8a2848D71A1Ff3712a6210F7aE1",
        amountKas: 6800,
        feeKas: 68,
        blockNumber: 1_204_611,
        blockTime: "2025-09-21T11:36:00.000Z",
      }),
    ],
    finalized: {
      txHash: "0xaaa2e3f4a5b68798000000000000000000000000000000000000000000000001",
      payoutKas: 36_847.8,
      feeKas: 372.2,
      blockNumber: 1_205_001,
      blockTime: "2025-09-23T12:00:00.000Z",
    },
    refunds: [],
  },
];

export const platformStats: PlatformStats = mockCampaigns.reduce(
  (acc, campaign) => {
    acc.totalCampaigns += 1;
    acc.totalRaisedKas += campaign.raisedKas;
    acc.totalFeesKas += campaign.feeAccruedKas;
    acc.activeCampaigns += campaign.state === "ACTIVE" ? 1 : 0;
    const uniqueContributors = new Set(
      campaign.contributions.map((item) => item.contributor.toLowerCase()),
    );
    acc.contributors += uniqueContributors.size;
    return acc;
  },
  {
    totalCampaigns: 0,
    totalRaisedKas: 0,
    totalFeesKas: 0,
    activeCampaigns: 0,
    contributors: 0,
  } satisfies PlatformStats,
);

export function getCampaignByAddress(address: string): CampaignDetail | undefined {
  return mockCampaigns.find(
    (campaign) => campaign.address.toLowerCase() === address.toLowerCase(),
  );
}
