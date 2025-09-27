"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  { href: "/#campaigns", label: "Campaigns" },
  { href: "/create", label: "Create" },
  { href: "/#protocol", label: "Protocol" },
  { href: "/admin", label: "Admin" },
];

export default function TopNav() {
  const anchorLinks = useMemo(() => links, []);

  return (
    <header className="sticky top-4 z-50 mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full border border-white/10 bg-kaspa-night/70 px-4 py-2 shadow-[0_10px_40px_rgba(12,238,200,0.08)] backdrop-blur-xl sm:px-6">
      <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-kaspa-400 via-kaspa-blue-500 to-kaspa-300 text-kaspa-night shadow-glow">
          KF
        </span>
        <span className="hidden text-gradient sm:inline-block">KASFundMe</span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
        {anchorLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors duration-150 ease-out hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="hidden text-xs font-medium text-slate-300 lg:block">
          <span className="uppercase tracking-[0.2em] text-kaspa-300">Testnet</span>
          <span className="ml-2 text-slate-400">Kasplex L2</span>
        </div>
        <ConnectButton label="Connect" accountStatus={{ smallScreen: "avatar", largeScreen: "full" }} />
      </div>
    </header>
  );
}
