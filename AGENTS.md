# AGENTS.md — **KASFundME** (Kasplex L2)

## 0) Context (Single Source of Truth)

We are building a **non-custodial crowdfunding dapp** on **Kasplex zkEVM**. On-chain contracts are the only source of truth; the indexer/database exists **only** for reads/analytics and can be rebuilt from events at any time.

* **Network (dev/test):** Kasplex L2 **Testnet**

  * `chainId: 167012`
  * `rpc: https://rpc.kasplextest.xyz`
  * `explorer: https://explorer.testnet.kasplextest.xyz`
  * Native token **KAS (18)**
* **Fee model:** immutable **1%** admin fee (100 bps). Only `feeRecipient` can change (2-step ownership).
* **Oracles:** none for protocol logic. USD price is **UI-only**, from a free endpoint; the chain never depends on it.
* **Security posture:** CEI, `nonReentrant`, storage packing, custom errors, no unbounded loops in state-changing code, revert in `receive()`.
* **Secrets:** never committed. Store deploy key at `.evm/kasplex_deployer.key` or as an env var on VPS.
* **Standards/versions:** Solidity `^0.8.24`, OpenZeppelin `^5`, Node `20`, Next.js `14`, wagmi `2`, viem `2`, RainbowKit `2`, Postgres `16`, Docker.

---

## 1) Repository Layout

```
/apps/web              # Next.js 14 app (Scaffold-style: wagmi/viem, RainbowKit, Tailwind, shadcn, TanStack Query)
/packages/contracts    # Foundry contracts, scripts, tests
/packages/abi          # Built ABIs + addresses.json (generated)
/services/indexer      # Node (viem) worker + Postgres schema + REST
/infra                 # Docker, compose, reverse proxy, systemd, env examples
/docs                  # Dev + user docs
```

---

## 2) High-Level Product

**KASFundME** lets anyone:

* **Create** a campaign (goal in KAS, deadline, beneficiary, metadata URI).
* **Contribute** (payable in KAS).
* **Finalize** (goal reached before deadline → payout to beneficiary minus 1% fee to `feeRecipient`).
* **Refund** (deadline passed and goal not met).
* **Discover** campaigns + analytics via event indexing.

**Non-goals (for MVP):** milestones, pausable admin, upgradability, allowlists/permits, cross-chain, NFTs.

---

## 3) Global Constraints & Guardrails

* No custodial flows. Funds live inside each `Campaign` contract.
* No paid external services (e.g., paid oracles). Optional USD display must not affect any on-chain path.
* Avoid state reads that scale with contributors list in state-changing fns (no on-chain iteration over contributor sets).
* RPC calls should be minimal; heavy queries go through the indexer.
* Contracts are **non-upgradeable**. Campaigns are **clones** (EIP-1167) deployed by a factory.

---

## 4) Success Metrics (MVP)

* **Reliability:** Indexer lag ≤ 5s; rebuild-from-genesis completes successfully.
* **Security:** Reentrancy tests pass; Slither/Mythril clean (no high/critical).
* **Gas:** Creation and contribute paths optimized (storage packing, custom errors).
* **UX:** First contentful paint < 2s on typical VPS; tx success rate > 98% on testnet.

---

## 5) Environments & Secrets (required env keys)

* `.env` / deploy env:

  * `RPC_URL=https://rpc.kasplextest.xyz`
  * `CHAIN_ID=167012`
  * `PRIVATE_KEY` **or** path to `.evm/kasplex_deployer.key`
  * `FEE_RECIPIENT=0x...`
  * `FEE_BPS=100`
  * `DATABASE_URL=postgresql://crowdfund:crowdfund@db:5432/crowdfund`
* **Never** commit real keys. Use systemd `EnvironmentFile` or Docker secrets on VPS.

---

## 6) Canonical Build Workflow (end-to-end)

1. **Contracts**

   * Implement/modify → `forge build && forge test -vvv`
   * Deploy to testnet:

     ```bash
     export PRIVATE_KEY=0x...
     export FEE_RECIPIENT=0xYourFeeRecipient
     export FEE_BPS=100
     forge script script/Deploy.s.sol:Deploy \
       --rpc-url https://rpc.kasplextest.xyz --broadcast
     ```
   * Copy deployed **factory address** into:

     * `/packages/abi/addresses.json`
     * `/apps/web/src/lib/addresses.json`
     * `/services/indexer/src/addresses.json`
 * Export ABIs from `out/` into `/packages/abi` and sync to web/indexer.

2. **Indexer**

   * Ensure Postgres is reachable; run `pnpm migrate:indexer` to apply SQL migrations.
   * Configure `.env` (`DATABASE_URL`, `INDEXER_FROM_BLOCK`, `FACTORY_ADDRESS`, `CAMPAIGN_IMPLEMENTATION_ADDRESS`).
   * Launch the combined worker & API via `pnpm start:indexer`; it backfills `CampaignCreated` then streams `Contributed`, `Finalized`, `Refunded`, and `MetadataUpdated` events.
   * REST API defaults to `http://localhost:3001` and serves `/campaigns`, `/campaign/:address`, and `/stats`.

3. **Web**

   * Ensure chain config (167012) & RPC in env.
   * Build & run: `pnpm build && pnpm start` (or via Docker).

4. **Ops**

   * Bring up `docker-compose` (db, web, indexer, proxy).
   * Verify health endpoints/logs; confirm explorer links from UI.

---

## 7) Agents

### 7.1 Product Owner (PO)

**Objective:** Deliver a tight MVP backlog and acceptance criteria.

**Inputs**

* This AGENTS.md
* Current codebase & deployment info (factory address once deployed)

**Actions**

* Define/maintain user stories: create, list, view, contribute, finalize, refund, platform stats.
* Specify non-functional reqs: CEI, `nonReentrant`, storage packing, no paid oracles, rebuildable indexer.
* Prioritize scope; flag anything that risks decentralization/security.

**Outputs / Definition of Done**

* `/docs/backlog.md` with stories, AC, and success metrics.
* Clear cut for MVP vs V1 (milestones, referrals optional later).

---

### 7.2 Solidity Engineer

**Objective:** Implement audited, gas-efficient contracts + tests + deploy script.

**Scope (files)**

* `/packages/contracts/**`

**Required design**

* `CampaignFactory` (Ownable2Step, immutable `FEE_BPS=100`, mutable `feeRecipient`, **EIP-1167** clones).
* `Campaign` (state: `Active/Successful/Failed`; packed storage: `uint128 goal, uint128 raised, uint64 deadline`; `mapping(address=>uint128)` contributions; `feeAccrued`).
* Events: `CampaignCreated`, `Contributed`, `Finalized`, `Refunded`, `MetadataUpdated`.
* Errors: custom (no strings). `receive()` must revert.
* Functions:

  * `createCampaign(beneficiary, goal, deadline, uri)`
  * `contribute()` payable (accrue fee to `feeAccrued`)
  * `finalize()` (requires `raised >= goal`, pays beneficiary, fee to feeRecipient)
  * `refund()` (deadline passed & goal not reached)
  * `updateMetadata(uri)` (creator-only, while active)

**Tests (Foundry)**

* Unit + fuzz: contributions (edge amounts), deadlines, refunds, finalize, fee math, reentrancy attempts.
* Coverage target: `>90%` lines/branches on `src/`.

**Deploy**

* `script/Deploy.s.sol` emitting factory address.
* Document verifier step (if explorer API supports it).

**Outputs / DoD**

* Green test suite; no high/critical Slither/Mythril issues.
* ABIs in `/packages/abi` and synced to web/indexer.
* `addresses.json` updated (testnet).

---

### 7.3 Frontend Engineer

**Objective:** Next.js app with Scaffold-style DX; clean UX for all MVP flows.

**Scope (files)**

* `/apps/web/**`

**Requirements**

* **Chain config** for 167012; enforce network guard & helpful messaging.
* **Pages:** `/` (list + stats), `/create`, `/campaign/[address]`, `/admin`.
* **Components:** CampaignCard, ContributeForm, ProgressBar, EventTimeline.
* **Hooks:**

  * `useCampaign(address)` → `goal/raised/deadline/state`
  * `useContributions(address, fromBlock?)` → sum + count via logs
  * `useCampaigns(params)` → from `/api/campaigns`
  * `usePlatformStats()` → from `/api/stats`
  * `useUsdPrice()` (UI-only; feature-flagged)
* **UX:** optimistic contribute, gas estimator with manual override, explorer links.
* **A11y & responsiveness**; dark mode parity.

**Outputs / DoD**

* MVP flows work against testnet factory.
* Lighthouse a11y ≥ 90, no console errors, SSR safe.

---

### 7.4 Indexer Engineer

**Objective:** Deterministic analytics from events only.

**Scope (files)**

* `/services/indexer/**`
* DB schema migrations (SQL) under `/services/indexer/sql/**`

**Ingest**

* Backfill from `INDEXER_FROM_BLOCK`:

  * `CampaignCreated` → `campaigns(address, creator, beneficiary, goal, deadline, uri, created_at)`
* Watch each campaign for:

  * `Contributed` → `contributions(campaign, contributor, amount, fee, block_number, block_time)`
  * `Finalized` → `finals(campaign, payout, fee_total, block_number, block_time)`
  * `Refunded` → `refunds(campaign, contributor, amount, block_number, block_time)`
  * `MetadataUpdated` → latest `metadata_uri`

**API (consumed by web)**

* `GET /api/campaigns?limit&offset`
* `GET /api/stats` (total campaigns, sum(raised), sum(fees))
* `GET /api/campaign/:address` (optional detail)

Responses include both raw `wei` values and human-readable KAS conversions to simplify frontend formatting.

**Ops**

* Daily rollups/materialized views via cron (document cadence).

**Outputs / DoD**

* Indexer survives restarts; can rebuild from genesis; no data races.
* API returns within <200ms (warm cache) for typical queries.

---

### 7.5 DevOps

**Objective:** Reproducible AlmaLinux VPS deployment.

**Scope (files)**

* `/docker-compose.yml`, `/Caddyfile`, `/infra/**`, CI/CD config

**Requirements**

* Services: `db (Postgres16)`, `web (Next)`, `indexer (Node)`, `proxy (Caddy/Nginx)`.
* Healthchecks, restart policies, logs to stdout.
* Secrets via env files/secret manager; nightly `pg_dump` with retention.
* Hardened host: `ufw`, `fail2ban`, unattended security updates.
* Systemd unit for indexer (optional) and backup timers.

**Outputs / DoD**

* One-command bring-up on a fresh VPS.
* Documented rollback & restore from latest dump.

---

### 7.6 Security Reviewer

**Objective:** Continuous audit notes; block insecure merges.

**Checks**

* Run **Slither**, **Mythril**, static analyzers in CI.
* Verify CEI and `nonReentrant` coverage; `receive()` reverts.
* Ensure immutable fee bps; only `feeRecipient` adjustable (2-step).
* Validate bounds (non-zero `goal`, sensible `deadline`).
* Review deploy scripts for key handling.

**Outputs / DoD**

* `/docs/security-report.md` per iteration with findings + mitigations.
* No high/critical findings open at merge time.

---

### 7.7 QA

**Objective:** E2E confidence.

**Scope**

* Cypress tests (or Playwright) against testnet with mocked wallets.

**Flows**

* Create → Contribute → Finalize (success path).
* Create → Contribute (insufficient) → Refund (failure path).
* Wrong network guard, invalid params, tiny contributions.
* Explorer links & optimistic contribute behavior.

**Outputs / DoD**

* CI green on E2E suite; reproducible runbook in `/docs/testing.md`.

---

### 7.8 Docs

**Objective:** Keep docs actionable and current.

**Scope**

* `/docs/README.md` quickstart, env vars, deploy steps, risk disclaimers.
* `/docs/api.md` describing `/api/*` shapes + examples.
* `/docs/runbooks/*` for AlmaLinux deploy, backups, and indexer rebuild.
* Keep this **AGENTS.md** synced with major changes.

**Outputs / DoD**

* New contributors can deploy to testnet in <30 minutes using docs alone.

---

## 8) Open Tasks (initial)

1. Deploy factory to Kasplex Testnet and populate `packages/abi` / web / indexer address manifests (plus env overrides).
2. Automate CI (`pnpm lint`, `pnpm --filter web build`, `forge fmt --check`, `forge test`, Slither/Mythril) with caching for Foundry & node modules.
3. Author docs: `/docs/backlog.md`, `/docs/api.md` (document JSON schemas, decimals), `/docs/runbooks/indexer.md` (bootstrap, migrations, restart).
4. Add persistence/health tooling for indexer (Prometheus-ready metrics, graceful shutdown hooks, retry/backoff tuning).
5. Land QA automation (Playwright/Cypress) covering create → finalize → refund flows against testnet or fork.

---

## 9) Definition of “MVP Shipped”

* Factory deployed on testnet; at least one live campaign demonstrates:

  * successful **finalize** path and successful **refund** path.
* Web app supports create/view/contribute/finalize/refund; lists campaigns.
* Indexer backfills and streams; `/api/stats` non-zero; fees observable.
* Security report with no high/critical items; E2E suite green.

---

**End of file.**
