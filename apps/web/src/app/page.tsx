import CampaignShowcase from "@/components/sections/campaign-showcase";
import HeroSection from "@/components/sections/hero-section";
import HowItWorks from "@/components/sections/how-it-works";
import Roadmap from "@/components/sections/roadmap";
import StatsSection from "@/components/sections/stats-section";
import CreateCampaignForm from "@/components/forms/create-campaign-form";
import Footer from "@/components/layout/footer";
import TopNav from "@/components/layout/top-nav";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pb-24 sm:px-6 lg:px-8">
      <TopNav />
      <main className="mt-8 flex w-full flex-col items-center gap-24">
        <HeroSection />
        <StatsSection />
        <CampaignShowcase />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row">
          <CreateCampaignForm />
          <div className="glass flex-1 rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-semibold text-white">Why Kasplex + KASFundMe?</h3>
            <ul className="mt-4 space-y-4 text-sm text-slate-300/85">
              <li>
                • Immutable 1% protocol fee keeps incentives aligned while preserving full non-custodial flows.
              </li>
              <li>
                • Indexer-first architecture lets us power discovery and analytics without touching custody.
              </li>
              <li>
                • Built with CEI discipline, storage packing, and reentrancy guards as mandated in AGENTS.md.
              </li>
              <li>
                • Ready for responsive, Kaspa-branded UI with RainbowKit and wagmi 2.x under the hood.
              </li>
            </ul>
          </div>
        </div>
        <HowItWorks />
        <Roadmap />
      </main>
      <Footer />
    </div>
  );
}
