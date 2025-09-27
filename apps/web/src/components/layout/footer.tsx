import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto mt-24 flex w-full max-w-6xl flex-col gap-4 border-t border-white/10 py-8 text-sm text-slate-400">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} KASFundMe. Protocol fees routed to Kasplex ecosystem development.</p>
        <div className="flex items-center gap-4">
          <Link href="https://explorer.testnet.kasplextest.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-kaspa-200">
            Testnet Explorer
          </Link>
          <Link href="https://kaspa.org" target="_blank" rel="noopener noreferrer" className="hover:text-kaspa-200">
            Kaspa.org
          </Link>
          <Link href="mailto:hello@kasfundme.dev" className="hover:text-kaspa-200">
            Contact
          </Link>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Built for Kasplex zkEVM Testnet. Contracts are immutable; indexer can be rebuilt from events within minutes.
      </p>
    </footer>
  );
}
