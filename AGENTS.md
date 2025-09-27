# AGENTS.md — KASFundME (Kasplex L2)

## Global Context
We are building a non-custodial crowdfunding dapp on Kasplex zkEVM.
- Chain: Kasplex L2 Testnet (chainId 167012, RPC https://rpc.kasplextest.xyz)
- Native token: KAS (18)
- Admin fee: 1% (immutable)
- No paid oracles. Any USD price is UI-only from a free API; never used on-chain.
- Aim: gas-efficient, secure, trust-minimized.
- Deployment key: store in `.evm/kasplex_deployer.key` (never commit).
- Initial bootstrap landed in repo: Foundry contracts, deploy scripts, tests, Next.js Scaffold-ETH app, minimal indexer, Docker setup, and hardened agent briefs.

## Repo layout
/apps/web              Next.js + Scaffold-ETH 2 app
/packages/contracts    Foundry contracts, scripts, tests
/packages/abi          Built ABIs + addresses.json
/services/indexer      Node worker (viem) + Prisma for Postgres
/infra                 Docker, compose, CI
/docs                  Developer + user docs (in progress)

## Current Bootstrap Status
- Foundry project seeded with campaign factory/campaign scaffolding plus Deploy script and baseline tests.
- Next.js (App Router) app wired with Scaffold-style wagmi/viem, RainbowKit, Tailwind, shadcn, TanStack Query.
- Indexer worker stubbed with viem client, Prisma schema, and REST API surface.
- Docker files sketched for web, indexer, database, and reverse proxy targets.
- AGENTS.md hardened to coordinate multi-agent workflow; update continuously as plans change.

## Outstanding Follow-ups
1. Plug actual factory address and deployed metadata into packages once contracts hit testnet/mainnet.
2. Generate current ABIs and propagate to `/packages/abi`, web client, and indexer worker.
3. Finalize `docker-compose` / AlmaLinux deployment scripts before infra handoff.

## Agent: Product Owner
Goal: keep scope tight. Output user stories with acceptance criteria.
Prompt:
- Audit seeded stories against MVP scope: create, view, contribute, finalize, refund, list campaigns, platform stats.
- Include non-functional requirements: no external oracles for logic, reentrancy safety, gas caps, simple failure modes.
- Define success metrics (TTFB < 300ms cached page, tx success rate, indexer lag < 5s).
- Coordinate with Engineering once factory address/ABIs are available.

## Agent: Solidity Engineer
Goal: implement Factory + Campaign with 1% fee and event-rich design.
Prompt:
- Complete `CampaignFactory` (EIP-1167 minimal proxies) and `Campaign` per spec using Solidity ^0.8.24, OZ ReentrancyGuard, Ownable2Step.
- Factory: immutable `FEE_BPS=100`, mutable `feeRecipient`, event `CampaignCreated`.
- Campaign: state {Active, Successful, Failed}; vars packed (uint128, uint64); mapping contributions.
- Functions: `contribute() payable`, `finalize()`, `refund()`, `updateMetadata(uri)`.
- Accrue fee per contribution, transfer fee + payout on finalize; `receive()` must revert.
- Use custom errors; avoid loops over dynamic arrays in state-changing paths.
- Emit events: Contributed, Finalized, Refunded, MetadataUpdated.
- Maintain Foundry tests (unit, fuzz, reentrancy, fee math, deadline boundaries) and keep coverage targets high.
- Ship `Deploy.s.sol` that deploys Factory; add optional explorer verification hook.
- Deliver ABI artifacts for downstream teams when contract iteration stabilizes.

## Agent: Frontend Engineer
Goal: Scaffold-ETH 2 app (Next.js App Router, wagmi/viem, RainbowKit, Tailwind, shadcn, TanStack Query).
Prompt:
- Ensure `kasplexTestnet` chain config (id 167012) is default; enforce network guard + messaging.
- Build pages: `/`, `/create`, `/campaign/[address]`, `/admin` using seeded scaffolding.
- Components: CampaignCard, ContributeForm, ProgressBar, EventTimeline (flesh out placeholders).
- Hooks:
  - `useCampaign(addr)`: read state via viem.
  - `useContributions(addr, fromBlock?)`: aggregate Contributed logs.
  - `useCampaigns(page?)`: consume `/api/campaigns` with pagination + filters.
  - `usePlatformStats()`: consume `/api/stats`.
  - `useUsdPrice()` (UI-only, free API; gate behind feature flag).
- Implement optimistic contribute flow + gas estimator override.
- Enforce accessibility, responsive layout, and dark mode parity.
- Update UI once production ABI/address data is supplied.

## Agent: Indexer Engineer
Goal: Postgres-backed analytics from contract events only.
Prompt:
- Use viem to backfill `CampaignCreated`, `Contributed`, `Finalized`, `Refunded` from factory deployment block, then stream new events.
- Schema: campaigns(id, address, creator, beneficiary, goal, deadline, uri, createdAt),
  contributions(id, campaign, contributor, amount, fee, blockTime),
  finals(id, campaign, payout, feeTotal, blockTime).
- Expose REST: `/api/campaigns?cursor=...`, `/api/stats`, `/api/campaign/:addr`.
- Add daily rollups via cron (materialized views) and document refresh cadence.
- Sync ABI/address updates from Solidity Engineer; ensure no on-chain price dependencies.

## Agent: DevOps
Goal: AlmaLinux VPS deployment via Docker.
Prompt:
- Harden docker-compose for web, indexer, db (Postgres), proxy (Caddy/Nginx); maintain healthchecks and restart policies.
- Collect logs to stdout/stderr, integrate with centralized logging if available.
- Automate Postgres backups (`pg_dump` nightly) and retention.
- Manage secrets via env files or secret manager; never commit sensitive data.
- Configure ufw, fail2ban, unattended-upgrades, and systemd units where required.
- Prepare AlmaLinux provisioning docs; validate compose before cutover.

## Agent: Security Reviewer
Goal: pre-merge checks and audit notes.
Prompt:
- Run Slither, Mythril, Foundry coverage; capture findings and remediation steps.
- Verify Checks-Effects-Interactions ordering and `nonReentrant` coverage.
- Confirm fee rate immutable post-deploy; only feeRecipient adjustable via 2-step ownership.
- Ensure `receive()` reverts; validate integer bounds on deadlines/goals (non-zero, sensible ranges).
- Review deployment/config scripts for key handling best practices.

## Agent: QA
Goal: end-to-end tests.
Prompt:
- Cypress tests for create/contribute/finalize/refund flows using kasplexTestnet mocks.
- Validate wrong network handling, invalid params, tiny contributions.
- Verify explorer links, USD toggle, pagination, and optimistic contribute UX.
- Coordinate with Frontend/Indexer teams when ABI/address updates land.

## Agent: Docs
Goal: developer + user docs in `/docs`.
Prompt:
- Write README with quickstart, env vars, deploy steps, risk disclaimers for KASFundME.
- Document API endpoints for `/api/*` with request/response shapes and pagination.
- Add onboarding and runbooks covering bootstrap state, how to update addresses/ABIs, and AlmaLinux deployment steps.
- Keep AGENTS.md synchronized with docs when major process changes occur.
