# KASFundMe

Monorepo bootstrapping the Kasplex-native crowdfunding dapp.

- `apps/web` — Next.js 14 UI with Kaspa-styled theme, wagmi 2.x, RainbowKit, Tailwind CSS, and mock API routes.
- `packages/` — Reserved for Foundry contracts & shared ABIs.
- `services/` — Reserved for indexer + API workers.
- `pnpm-workspace.yaml` — Workspace definition for pnpm.

## Getting started

```bash
pnpm install
pnpm dev:web
```

Set `NEXT_PUBLIC_RPC_URL` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `apps/web/.env.local` before connecting wallets.

See `AGENTS.md` (remote branch `origin/terragon/develop-kasfundme-dapp-0gm6m9`) for the broader delivery plan and guardrails.
