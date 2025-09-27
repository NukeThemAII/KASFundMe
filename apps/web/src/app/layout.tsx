import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PropsWithChildren } from "react";
import "./globals.css";
import Providers from "./providers";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = "https://kasfundme.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KASFundMe",
    template: "%s | KASFundMe",
  },
  description:
    "Kasplex-native crowdfunding dapp for mission-driven builders. Launch campaigns, rally Kaspa supporters, and track momentum in real time.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "KASFundMe — Crowdfunding on Kasplex L2",
    description:
      "Non-custodial crowdfunding on Kasplex zkEVM Testnet. Create campaigns, contribute in KAS, and finalize funds trustlessly.",
    siteName: "KASFundMe",
  },
  twitter: {
    card: "summary_large_image",
    title: "KASFundMe",
    description:
      "Launch and track Kasplex-native crowdfunding campaigns with real-time analytics.",
  },
  keywords: [
    "Kaspa",
    "Kasplex",
    "crowdfunding",
    "dapp",
    "KAS",
    "zkEVM",
    "web3",
  ],
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased bg-kaspa-night text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
