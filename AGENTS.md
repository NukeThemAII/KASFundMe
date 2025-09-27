# AGENTS.md — KASFundME (Kasplex L2)

## Global Context
We are building a non-custodial crowdfunding dapp on Kasplex zkEVM.
- Chain: Kasplex L2 Testnet (chainId 167012, RPC https://rpc.kasplextest.xyz)
- Native token: KAS (18)
- Admin fee: 1% (immutable)
- No paid oracles. Any USD price is UI-only from a free API; never used on-chain.
- Aim: gas-efficient, secure, trust-minimized.
- Deployment key: store in `.evm/kasplex_deployer.key` (never commit).

## Repo layout
/apps/web              Next.js + Scaffold-ETH 2 app
/packages/contracts    Foundry contracts, scripts, tests
/packages/abi          Built ABIs + addresses.json
/services/indexer      Node worker (viem) + Prisma for Postgres
/infra                 Docker, compose, CI

## Agent: Product Owner
Goal: keep scope tight. Output user stories with acceptance criteria.
Prompt:
- Define MVP stories: create campaign, view, contribute, finalize, refund, list campaigns, platform stats.
- Include non-functional requirements: no external oracles for logic, reentrancy safety, gas caps, simple failure modes.
- Define success metrics (TTFB < 300ms cached page, tx success rate, indexer lag < 5s).

## Agent: Solidity Engineer
Goal: implement Factory + Campaign with 1% fee and event-rich design.
Prompt:
- Write `CampaignFactory` (EIP-1167 minimal proxies) and `Campaign`.
- Solidity ^0.8.24; OZ ReentrancyGuard and Ownable2Step only.
- Factory: immutable `FEE_BPS=100`, mutable `feeRecipient`, event `CampaignCreated`.
- Campaign: state {Active, Successful, Failed}; vars packed (uint128, uint64); mapping contributions.
- Functions: `contribute() payable`, `finalize()`, `refund()`, `updateMetadata(uri)`.
- Accrue fee per contribution, transfer fee+payout on finalize.
- Use custom errors; no loops over dynamic arrays in state-changing functions.
- Emit events: Contributed, Finalized, Refunded, MetadataUpdated.
- Write Foundry tests incl. fuzz, reentrancy, fee math, boundary deadlines.
- Provide `Deploy.s.sol` that deploys Factory and verifies via explorer API if available.

## Agent: Frontend Engineer
Goal: Scaffold-ETH 2 app (Next.js App Router, wagmi/viem, RainbowKit, Tailwind, shadcn, TanStack Query).
Prompt:
- Add `kasplexTestnet` chain config (id 167012). Default connect to it; show network guard.
- Pages: `/`, `/create`, `/campaign/[address]`, `/admin`.
- Components: CampaignCard, ContributeForm, ProgressBar, EventTimeline.
- Hooks:
  - `useCampaign(addr)`: read state.
  - `useContributions(addr, fromBlock?)`: aggregate Contributed logs.
  - `useCampaigns(page?)`: reads from `/api/campaigns`.
  - `usePlatformStats()`: `/api/stats`.
  - `useUsdPrice()` (UI-only, free API; gate behind feature flag).
- Optimistic UI on contribute; gas estimator with override.
- Accessibility (a11y), mobile responsive, dark mode.

## Agent: Indexer Engineer
Goal: Postgres-backed analytics from contract events only.
Prompt:
- Build Node worker using viem: backfill `CampaignCreated`, `Contributed`, `Finalized`, `Refunded` from factory deployment block; then watch.
- Schema: campaigns(id, address, creator, beneficiary, goal, deadline, uri, createdAt),
  contributions(id, campaign, contributor, amount, fee, blockTime),
  finals(id, campaign, payout, feeTotal, blockTime).
- Expose REST: `/api/campaigns?cursor=...`, `/api/stats`, `/api/campaign/:addr`.
- Add daily rollups via cron (materialized views).

## Agent: DevOps
Goal: AlmaLinux VPS deployment via Docker.
Prompt:
- Compose services: web (Next), indexer (Node), db (Postgres), proxy (Caddy/Nginx).
- Wired logs to stdout; healthchecks; backups (pg_dump nightly).
- systemd units or docker compose with restart=always.
- Secrets from env files (never in git).
- Set ufw, fail2ban, auto security updates.

## Agent: Security Reviewer
Goal: pre-merge checks and audit notes.
Prompt:
- Run Slither, Mythril, Foundry coverage; produce report.
- Verify CEI & nonReentrant.
- Confirm inability to change fee rate post-deploy, only feeRecipient (2-step).
- Ensure `receive()` reverts.
- Check integer/bounds on deadlines and goals (non-zero, min/max).

## Agent: QA
Goal: end-to-end tests.
Prompt:
- Cypress tests for create/contribute/finalize/refund.
- Check wrong network handling, invalid params, tiny contributions.
- Verify explorer links, USD toggle, pagination.

## Agent: Docs
Goal: developer + user docs in /docs.
Prompt:
- Write README with quickstart, env vars, deploy steps, and risk disclaimers.
- Add API docs for `/api/*`.
