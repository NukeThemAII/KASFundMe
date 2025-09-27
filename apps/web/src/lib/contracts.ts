import type { Abi } from "viem";
import campaignFactoryAbiJson from "@kasfundme/abi/CampaignFactory.json" assert { type: "json" };
import campaignAbiJson from "@kasfundme/abi/Campaign.json" assert { type: "json" };
import { env } from "./env";

export const campaignFactoryAbi = campaignFactoryAbiJson as Abi;
export const campaignAbi = campaignAbiJson as Abi;

export const campaignFactoryAddress = env.campaignFactoryAddress;

export function getCampaignConfig(address: string | undefined) {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return null;
  }

  return {
    address: address as `0x${string}`,
    abi: campaignAbi,
  } as const;
}
