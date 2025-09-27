import type { Chain } from "viem";

export const kasplexTestnet: Chain = {
  id: 167012,
  name: "Kasplex Testnet",
  nativeCurrency: {
    name: "Kaspa",
    symbol: "KAS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.kasplextest.xyz"],
    },
    public: {
      http: ["https://rpc.kasplextest.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Kasplex Explorer",
      url: "https://explorer.testnet.kasplextest.xyz",
    },
  },
  testnet: true,
};
