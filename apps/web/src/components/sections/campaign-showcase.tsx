import CampaignCard from "@/components/cards/campaign-card";
import ContributePanel from "@/components/forms/contribute-panel";

const mockCampaigns = [
  {
    title: "Kaspa DevRel Guild",
    summary:
      "Funding materials, workshops, and hack incentives to onboard builders into Kasplex zkEVM.",
    goalKas: 25000,
    raisedKas: 18640,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    address: "0x7a7dd8e6b8f51bb8b011f8d8a8e07c730bb5c8e1",
    metadataUri: "https://gateway.example/ipfs/QmGuild",
  },
  {
    title: "Open Hardware Miners",
    summary:
      "Grassroots team building energy-efficient miners with open schematics and royalties flowing back to backers.",
    goalKas: 40000,
    raisedKas: 21250,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    address: "0xc17aab1b3636ae2f83b5ea1f40064a2c425c8762",
  },
  {
    title: "Kasplex Public Goods Fund",
    summary:
      "Rolling treasury supporting explorers, indexers, and public tooling for the ecosystem.",
    goalKas: 50000,
    raisedKas: 37220,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
    address: "0x92e9edba118b19736fbf0d277b829973e4dbd4d9",
    metadataUri: "https://gateway.example/ipfs/QmPublicGoods",
  },
];

export default function CampaignShowcase() {
  return (
    <section className="mx-auto mt-24 flex w-full max-w-6xl flex-col gap-10 md:flex-row">
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <h2 className="text-balance">Featured Kasplex campaigns</h2>
          <p className="text-sm text-slate-300/90">
            Pulls live from the indexer soon. For now, these mocked entries illustrate how campaign metadata, progress, and explorer links will surface.
          </p>
        </div>
        <div className="grid gap-6">
          {mockCampaigns.map((campaign) => (
            <CampaignCard key={campaign.address} {...campaign} />
          ))}
        </div>
      </div>
      <div className="mt-10 w-full max-w-sm md:mt-0 md:w-80">
        <ContributePanel campaignAddress={mockCampaigns[0].address} />
      </div>
    </section>
  );
}
