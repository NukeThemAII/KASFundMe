"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z
    .string()
    .min(3, "Give your campaign a descriptive name")
    .max(80, "Keep it under 80 characters"),
  goal: z
    .number({ invalid_type_error: "Enter a KAS amount" })
    .positive("Goal must be greater than zero"),
  beneficiary: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/u, "Enter a valid Kasplex address"),
  deadline: z
    .string()
    .refine((value) => Boolean(Date.parse(value)), "Pick a valid deadline"),
  metadataUri: z
    .string()
    .url("Provide an IPFS or HTTPS metadata URI")
    .or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  name: "",
  goal: 0,
  beneficiary: "",
  deadline: "",
  metadataUri: "",
};

export default function CreateCampaignForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "goal" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const parseResult = schema.safeParse(form);
    if (!parseResult.success) {
      const newErrors: FormErrors = {};
      parseResult.error.errors.forEach((issue) => {
        const key = issue.path[0] as keyof FormState;
        newErrors[key] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setFeedback(
        "Campaign draft prepared. Next step: review transaction details and broadcast via your connected wallet.",
      );
      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="create"
      onSubmit={handleSubmit}
      className="glass w-full max-w-xl rounded-3xl border border-kaspa-400/20 p-6 shadow-[0_25px_60px_rgba(14,210,180,0.25)]"
    >
      <h3 className="text-2xl font-semibold text-white">Draft a campaign</h3>
      <p className="mt-2 text-sm text-slate-300/90">
        Settle details locally before we prepare the deploy transaction. We&apos;ll surface bytecode cost estimates before you sign.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="text-slate-200">Campaign name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Build Kaspa-powered open-source treasury"
            className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-300 focus:ring-2 focus:ring-kaspa-200/50"
          />
          {errors.name && <span className="text-xs text-rose-300">{errors.name}</span>}
        </label>

        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="text-slate-200">Goal amount (KAS)</span>
          <input
            type="number"
            name="goal"
            step="0.01"
            min="0"
            value={form.goal === 0 ? "" : form.goal}
            onChange={handleChange}
            placeholder="15000"
            className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-300 focus:ring-2 focus:ring-kaspa-200/50"
          />
          {errors.goal && <span className="text-xs text-rose-300">{errors.goal}</span>}
        </label>

        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="text-slate-200">Beneficiary address</span>
          <input
            type="text"
            name="beneficiary"
            value={form.beneficiary}
            onChange={handleChange}
            placeholder="0x1F..."
            className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-300 focus:ring-2 focus:ring-kaspa-200/50"
          />
          {errors.beneficiary && (
            <span className="text-xs text-rose-300">{errors.beneficiary}</span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="text-slate-200">Deadline</span>
          <input
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-300 focus:ring-2 focus:ring-kaspa-200/50"
          />
          {errors.deadline && (
            <span className="text-xs text-rose-300">{errors.deadline}</span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="text-slate-200">Metadata URI</span>
          <input
            type="url"
            name="metadataUri"
            value={form.metadataUri}
            onChange={handleChange}
            placeholder="ipfs://..."
            className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-300 focus:ring-2 focus:ring-kaspa-200/50"
          />
          {errors.metadataUri && (
            <span className="text-xs text-rose-300">{errors.metadataUri}</span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-kaspa-400 to-kaspa-blue-500 px-6 py-3 text-sm font-semibold text-kaspa-night shadow-[0_20px_40px_rgba(17,227,197,0.35)] transition hover:shadow-[0_20px_55px_rgba(17,227,197,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Preparing transaction..." : "Review deployment transaction"}
      </button>
      {feedback && <p className="mt-4 text-sm text-kaspa-200">{feedback}</p>}
    </form>
  );
}
