import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { kasplexTestnet } from "./chains";
import { env } from "./env";

const chains = [kasplexTestnet] as const;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Kasplex",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "KASFundMe",
    projectId: env.walletConnectProjectId,
  },
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [kasplexTestnet.id]: http(env.rpcUrl),
  },
  ssr: true,
});
