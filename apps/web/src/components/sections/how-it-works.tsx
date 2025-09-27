import type { SVGProps } from "react";
import { BanknotesIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Create",
    description:
      "Define goal, deadline, beneficiary, and metadata. Factory deploys a lightweight campaign contract and emits CampaignCreated.",
    icon: RocketIcon,
  },
  {
    title: "Contribute",
    description:
      "Contributors send KAS directly to the campaign. UI tracks real-time totals via indexer events.",
    icon: UsersIcon,
  },
  {
    title: "Finalize",
    description:
      "If goal reached before deadline, beneficiary receives funds minus 1% protocol fee routed to feeRecipient.",
    icon: BanknotesIcon,
  },
  {
    title: "Refund",
    description:
      "Deadline missed? Contributors can withdraw their contributions in a single click.",
    icon: ShieldCheckIcon,
  },
];

function RocketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M12 3c2.5 1.8 4 4.2 4 7 0 1.7-.5 3.3-1.4 4.7l-2.6 3.9-2.6-3.9A8.4 8.4 0 0 1 8 10c0-2.8 1.5-5.2 4-7Z" />
      <path d="M8.5 10H6a3 3 0 0 0-3 3v2" strokeLinecap="round" />
      <path d="M15.5 10H18a3 3 0 0 1 3 3v2" strokeLinecap="round" />
      <path d="M9 19a3 3 0 0 0 6 0" strokeLinecap="round" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="protocol"
      className="mx-auto mt-24 flex max-w-6xl flex-col gap-12 rounded-3xl border border-white/10 bg-gradient-to-br from-kaspa-night/80 via-kaspa-night/50 to-kaspa-blue-900/20 p-8 sm:p-12"
    >
      <div className="space-y-4">
        <h2>Protocol flow in four steps</h2>
        <p className="max-w-3xl text-slate-200/90">
          Every path is designed for predictable gas, optimistic UX, and replayable analytics. All state transitions are event-driven so the indexer and UI stay perfectly aligned with contracts.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <div key={step.title} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <step.icon className="h-8 w-8 text-kaspa-200" />
              <h3 className="text-xl font-semibold">{step.title}</h3>
            </div>
            <p className="mt-4 text-sm text-slate-300/90">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
