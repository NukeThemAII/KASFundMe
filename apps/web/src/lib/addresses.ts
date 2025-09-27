import addressesJson from "./addresses.json";

export interface NetworkAddresses {
  chainId: number;
  campaignFactory: string;
  campaignImplementation: string;
  feeRecipient: string;
}

export type SupportedNetwork = keyof typeof addressesJson;

export const addressesByNetwork: Record<SupportedNetwork, NetworkAddresses> =
  addressesJson as Record<SupportedNetwork, NetworkAddresses>;

export const DEFAULT_NETWORK: SupportedNetwork = "kasplexTestnet";

export const addresses = addressesByNetwork[DEFAULT_NETWORK];
