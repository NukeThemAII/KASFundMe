# KASFundME Codebase Audit

_Date: 2025-09-27_

## Overview
- Smart contracts under `packages/contracts` are present, well-structured, and come with a basic Foundry test suite; no high-severity security issues observed in the current implementation.
- Frontend (`apps/web`) is largely UI-complete but still wired to mock data; critical flows (finalize, refund, real indexer reads) are missing or stubbed.
- Indexer, backend APIs, documentation, and infrastructure layers outlined in `AGENTS.md` are largely unimplemented at this snapshot.

## Positive Observations
- Contracts follow CEI, use custom errors, storage packing, and `nonReentrant` guards as mandated (`packages/contracts/src/Campaign.sol:37-235`).
- Deployment script captures factory + implementation addresses (`packages/contracts/script/Deploy.s.sol:8-22`).
- Web app scaffolding uses modern stack (Next.js 14, wagmi 2, RainbowKit 2) with clean component structure and responsive design tokens.
- Env helpers centralize address + RPC configuration (`apps/web/src/lib/env.ts:1-34`).

## Findings

### Critical / Blocker
- **Indexer service absent**: `services/indexer` only ships a placeholder `addresses.json`; no worker, schema, or API implementation exists, preventing event ingestion, analytics, or the `/api/*` contract promised in `AGENTS.md` (`services/indexer/src/addresses.json:1`).
- **Frontend relies on mocks instead of live data**: API routes fall back to mock payloads because there is no indexer target, so campaign discovery, stats, and timelines are fictional (`apps/web/src/lib/indexer-client.ts:66-140`). The homepage, detail view, and admin dashboard therefore do not reflect chain state.

### High
- **Finalize/refund UX missing**: Only creation and contribution forms exist (`apps/web/src/components/forms`); there are no wagmi actions or UI for `finalize` or `refund`, leaving two core protocol flows unreachable from the dapp UI.
- **Addresses not populated**: Deployment manifests across packages are empty (`packages/abi/addresses.json:1-7`, `apps/web/src/lib/addresses.json:1-7`, `services/indexer/src/addresses.json:1`). Without synchronised addresses, any on-chain interaction will fail once mocks are removed.
- **No documentation package**: `docs/` is absent despite AGENTS requirements (backlog, security report, runbooks). Onboarding or audit trails cannot be fulfilled until these are written.

### Medium
- **Create form drops campaign name**: The "Campaign name" field is validated but never persisted or embedded in metadata; only `metadataUri` reaches the factory call (`apps/web/src/components/forms/create-campaign-form.tsx:149-163`). Clarify how names are stored (e.g., include in metadata JSON) or remove the field.
- **Single happy-path tests**: Foundry suite covers direct scenarios but lacks fuzzing, revert-path coverage for all custom errors, or invariant tests (`packages/contracts/test/Campaign.t.sol:1-147`). Add property-based tests (e.g., contributions edge cases, fee rounding) and reentrancy harnesses.
- **USD price hook is production-bound**: `useUsdPrice` calls Coingecko directly with no rate limiting or API-key strategy (`apps/web/src/hooks/useUsdPrice.ts:9-35`). Consider gating behind ENVs and caching to avoid throttling.
- **Admin dashboard static todos**: Admin panel surfaces static bullet points with no actual transaction helpers or signer flows (`apps/web/src/components/sections/admin-dashboard.tsx:10-59`). Wire to wagmi actions for `proposeFeeRecipient`, `acceptFeeRecipient`, etc.

### Low / Informational
- **Metadata update event lacks indexed sender**: `MetadataUpdated` only emits the URI, relying on contract address for attribution (`packages/contracts/src/Campaign.sol:72-73`). Consider including `msg.sender` as an indexed field to simplify off-chain filtering.
- **No CI or security tooling wired**: Repo lacks GitHub workflows for lint/test/Slither/Mythril despite AGENTS expectations. Add multi-stage CI to catch regressions early.
- **Polyfill stubs**: IndexedDB polyfill writes `undefined` regardless of platform (`apps/web/src/lib/polyfills.ts:1-7`); confirm this is necessary and document rationale to avoid masking real issues.

## Recommended Next Steps
1. Build the indexer service (event listeners, Postgres schema, REST API) and point the web app to it; replace mock fallbacks with real data flows.
2. Finish UI flows for `finalize`/`refund`, add optimistic updates, and surface transaction history tied to real contracts.
3. Populate `addresses.json` files post-deploy and ensure `env` utilities share a single source of truth across packages.
4. Expand Foundry tests with fuzzing + edge cases; add Slither/Mythril runs to CI once configured.
5. Author mandated documentation (`docs/backlog.md`, `docs/security-report.md`, runbooks) so contributors can follow MVP processes.
6. Harden frontend networking (rate limits, better fallback messaging) and document how metadata (names, descriptions) are published and read.

_No critical smart contract vulnerabilities were identified in this review; remaining gaps are primarily completeness, tooling, and UX coverage._
