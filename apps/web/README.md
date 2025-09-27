# KASFundMe Web

Kasplex-themed crowdfunding interface built with Next.js 14, wagmi 2, and RainbowKit. This app targets the Kasplex zkEVM Testnet (`chainId 167012`) and follows the architecture outlined in `AGENTS.md`.

## Quickstart

```bash
pnpm install
pnpm --filter web dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000).

### Required environment variables

Create `apps/web/.env.local` and set:

```
NEXT_PUBLIC_RPC_URL=https://rpc.kasplextest.xyz
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<walletconnect-project-id>
# Optional: disable price fetching when offline or rate limited
NEXT_PUBLIC_ENABLE_USD_PRICE=true
```

The UI falls back to a placeholder project id for local exploration, but production builds must supply a real WalletConnect ID.

Set `NEXT_PUBLIC_ENABLE_USD_PRICE=false` to skip Coingecko requests in development.

## Project structure

- `src/app` — App Router pages, including `/`, `/create`, `/campaign/[address]`, `/admin`, and mock `/api/*` routes
- `src/components` — Reusable layout, section, card, and form components
- `src/hooks` — React Query hooks (`useCampaigns`, `useCampaign`, `useContributions`, `usePlatformStats`, `useUsdPrice`)
- `src/lib` — Chain config, data fetcher, mock data store
- `src/types` — Shared TypeScript models
- `tailwind.config.ts` — Kaspa-inspired palette, shadows, gradients

## Next steps

1. Wire ABIs + factory addresses once contracts deploy (see `/packages/abi`).
2. Replace mocked campaign data with live indexer responses under `/app/api/*`.
3. Tune SSR for RainbowKit connectors to silence optional dependency warnings.
4. Surface optimistic transaction states via wagmi actions.

Refer to `AGENTS.md` for the complete cross-team backlog.
