import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { kasplexTestnet } from "./chains";
import { env } from "./env";

export const wagmiConfig = getDefaultConfig({
  appName: "KASFundMe",
  projectId: env.walletConnectProjectId,
  chains: [kasplexTestnet],
  ssr: true,
  transports: {
    [kasplexTestnet.id]: http(env.rpcUrl),
  },
});
