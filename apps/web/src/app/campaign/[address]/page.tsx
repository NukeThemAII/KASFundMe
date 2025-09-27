import CampaignDetail from "@/components/sections/campaign-detail";
import Footer from "@/components/layout/footer";
import TopNav from "@/components/layout/top-nav";

interface CampaignPageProps {
  params: {
    address: string;
  };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pb-24 sm:px-6 lg:px-8">
      <TopNav />
      <main className="mt-16 flex w-full flex-col items-center gap-16">
        <CampaignDetail address={params.address} />
      </main>
      <Footer />
    </div>
  );
}
