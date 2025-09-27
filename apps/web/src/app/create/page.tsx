import CreateCampaignForm from "@/components/forms/create-campaign-form";
import Footer from "@/components/layout/footer";
import TopNav from "@/components/layout/top-nav";

export default function CreatePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pb-24 sm:px-6 lg:px-8">
      <TopNav />
      <main className="mt-16 flex w-full max-w-5xl flex-col items-center gap-16">
        <header className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Launch a Kasplex-native campaign
          </h1>
          <p className="text-base text-slate-300/85 md:text-lg">
            We&apos;ll prep the deployment transaction locally. Review gas estimates, metadata, and fee routing before broadcasting from your connected wallet.
          </p>
        </header>
        <CreateCampaignForm />
        <section className="glass w-full rounded-3xl border border-white/10 p-6 text-sm text-slate-300/85">
          <h2 className="text-xl font-semibold text-white">Checklist before deploy</h2>
          <ul className="mt-3 space-y-2">
            <li>• Set deadline at least 1 hour in the future (Kasplex block times).</li>
            <li>• Metadata URI should resolve via IPFS gateway or HTTPS.</li>
            <li>• Beneficiary must be a Kasplex address you control (no custody risk).</li>
            <li>• Gas costs update right before signature; confirm they look sane.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
