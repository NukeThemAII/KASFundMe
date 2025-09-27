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
NEXT_PUBLIC_INDEXER_BASE_URL=https://indexer.kasfundme.dev
NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS=0x0000000000000000000000000000000000000000
# Optional: disable price fetching when offline or rate limited
NEXT_PUBLIC_ENABLE_USD_PRICE=true
```

The UI falls back to a placeholder WalletConnect project id for local exploration, but production builds must supply a real ID. Configure the indexer base URL and on-chain addresses after deployments land; otherwise mocked data and warnings will surface in the UI.

Set `NEXT_PUBLIC_ENABLE_USD_PRICE=false` to skip Coingecko requests in development.

## Project structure

- `src/app` — App Router pages, including `/`, `/create`, `/campaign/[address]`, `/admin`, and mock `/api/*` routes
- `src/components` — Reusable layout, section, card, and form components
- `src/hooks` — React Query hooks (`useCampaigns`, `useCampaign`, `useContributions`, `usePlatformStats`, `useUsdPrice`)
- `src/lib` — Chain config, indexer client, contract helpers, mock data store
- `src/types` — Shared TypeScript models
- `tailwind.config.ts` — Kaspa-inspired palette, shadows, gradients

## Next steps

1. Replace the placeholder addresses with the deployed factory + fee recipient, then validate create/contribute flows against Kasplex Testnet.
2. Switch `NEXT_PUBLIC_INDEXER_BASE_URL` to the live indexer once available and remove the mock fallback.
3. Extend wagmi actions to cover `finalize` & `refund`, including optimistic UI states and error toasts.
4. Re-introduce WalletConnect support after stubbing or shim-layering optional dependencies.

Refer to `AGENTS.md` for the complete cross-team backlog.
