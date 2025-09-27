# KASFundME

Crowdfunding on-chain for the Kasplex zkEVM ecosystem. KASFundME is a non-custodial GoFundMe-style dapp where campaigns are deployed as minimal proxy contracts, contributions settle in KAS, and an immutable 1% protocol fee funds platform operations.

## What You Can Do Today
- **Create a campaign** with a funding goal, deadline, beneficiary wallet, and off-chain metadata URI.
- **Contribute in KAS** directly to the campaign contract (no custody, funds remain on-chain until settlement).
- **Finalize campaigns** that reach their goal before the deadline. Payouts send KAS to the beneficiary and route the 1% fee to the fee recipient.
- **Refund contributors** automatically when deadlines expire without meeting the goal.
- **Discover and analyze campaigns** through the indexer API that mirrors on-chain events.

## Architecture & Tech Stack
- **On-chain contracts** (`packages/contracts`)
  - Solidity `^0.8.24`, Foundry toolchain.
  - `CampaignFactory` uses EIP-1167 minimal proxies; immutable `FEE_BPS = 100` (1%).
  - `Campaign` contracts track contributions, enforce deadlines, and expose finalize/refund flows.
  - Security guardrails: CEI pattern, OpenZeppelin `Ownable2Step` + `ReentrancyGuard`, custom errors, storage packing, `receive()` reverts.
- **Indexer & API** (`services/indexer`)
  - Node 20 with viem client, Fastify, and Postgres 16 (SQL migrations tracked under `services/indexer/sql`).
  - Streams `CampaignCreated`, `Contributed`, `Finalized`, `Refunded`, and `MetadataUpdated` events; exposes REST endpoints for campaigns and platform stats.
- **Web application** (`apps/web`)
  - Next.js 14 (App Router) with wagmi 2, viem 2, RainbowKit 2, Tailwind CSS, shadcn/ui, TanStack Query.
  - Network guardrails for Kasplex Testnet (chainId `167012`), optimistic contribution UX, explorer links, optional USD price display (UI-only, free API).
- **Infrastructure** (`infra`)
  - Docker Compose definitions for web, indexer, Postgres, and Caddy/Nginx proxy.
  - AlmaLinux provisioning runbooks, backups (`pg_dump`), systemd timers, hardening (ufw, fail2ban, unattended upgrades).

### Repository Layout
```
/apps/web              # Next.js frontend & API routes
/packages/contracts    # Foundry contracts, scripts, tests
/packages/abi          # Generated ABIs + addresses.json (synced across apps)
/services/indexer      # Indexer worker, SQL migrations, REST API
/infra                 # Docker, compose, reverse proxy, systemd configs
/docs                  # Backlog, security notes, runbooks, API docs (in progress)
AGENTS.md              # Source of truth for roles, requirements, and workflows
```

## Requirements
- Node.js 20.x and pnpm 8.x
- Foundry toolchain (`forge`, `cast`, `anvil`)
- Docker + Docker Compose (for local Postgres/indexer stack)
- Optional: Slither, Mythril for security review pipelines

## Environment Variables
Configure the following (examples in `.env.example` or `docs`):
- Shared
  - `RPC_URL=https://rpc.kasplextest.xyz`
  - `CHAIN_ID=167012`
  - `FEE_RECIPIENT=0xYourFeeRecipient`
  - `FEE_BPS=100`
- Contracts / Deploy
  - `PRIVATE_KEY=0x...` **or** store the key at `.evm/kasplex_deployer.key` (never commit).
- Web (`apps/web/.env.local`)
  - `NEXT_PUBLIC_RPC_URL=https://rpc.kasplextest.xyz`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<walletconnect-project-id>` (fallback placeholder works for local testing)
  - `NEXT_PUBLIC_INDEXER_BASE_URL=<kasplex-indexer-api>`
  - `NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=<kasplex-factory-address>`
  - `NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS=<fee-recipient-address>`
  - Optional: `NEXT_PUBLIC_ENABLE_USD_PRICE=false`
- Indexer (`services/indexer/.env`)
  - `DATABASE_URL=postgresql://crowdfund:crowdfund@db:5432/crowdfund`
  - `INDEXER_FROM_BLOCK=<factory deployment block>`

## Local Development Workflow
1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Run contracts tests**
   ```bash
   cd packages/contracts
   forge build
   forge test -vvv
   ```
3. **Start Postgres**
   ```bash
   cd infra
   docker compose up db
   ```
   Provide `services/indexer/.env` (see variables above) so the worker knows how to connect.
4. **Apply indexer migrations & launch worker/API**
   ```bash
   pnpm migrate:indexer
   pnpm start:indexer
   ```
   The combined process runs database migrations, backfills historical events, and exposes REST endpoints at `http://localhost:3001` by default.
5. **Run the web app**
   ```bash
   cd apps/web
   pnpm dev
   ```
   The app expects the Kasplex Testnet chain and will prompt users if they connect on the wrong network.

### Deploying Contracts to Kasplex Testnet
```bash
export RPC_URL=https://rpc.kasplextest.xyz
export PRIVATE_KEY=0x...
export FEE_RECIPIENT=0xYourFeeRecipient
export FEE_BPS=100

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --broadcast
```
- Record the emitted factory address.
- Update `/packages/abi/addresses.json`, `/apps/web/src/lib/addresses.json`, and `/services/indexer/src/addresses.json` with the new address.
- Export latest ABIs from `packages/contracts/out/` into `/packages/abi` and sync with web/indexer packages.

### Indexer Notes
- Set `INDEXER_FROM_BLOCK` to the factory deployment block (or `0` for full replay).
- Backfill ensures campaigns, contributions, finalization, and refund histories hydrate the database.
- REST endpoints exposed:
  - `GET /campaigns?limit=&offset=`
  - `GET /campaign/:address`
  - `GET /stats`

### Production Deployment (AlmaLinux VPS)
1. Copy `.env` files (without secrets committed to git) and `.evm/kasplex_deployer.key` to the server.
2. Provision host hardening (ufw, fail2ban, automatic security updates).
3. Use Docker Compose to launch services:
   ```bash
   docker compose up -d
   ```
4. Set up nightly `pg_dump` backups and systemd timers for indexer resilience.
5. Monitor health endpoints and logs (stdout/stderr) for web and indexer containers.

## Design Guardrails & Success Criteria
- Non-custodial architecture: funds never touch centralized custody; campaign contracts hold all contributions.
- Immutable fee: 1% admin fee baked into the factory; only `feeRecipient` can be changed via two-step ownership.
- No paid external services; any USD price display is optional and UI-only.
- Security posture: CEI ordering, `nonReentrant`, custom errors, revert-on-receive, storage packing, no unbounded loops in state-changing paths.
- Reliability targets: indexer lag ≤ 5s, rebuild-from-genesis succeeds, tx success rate ≥ 98% on Kasplex Testnet, FCP < 2s on typical VPS.

For detailed role-specific responsibilities and backlog, see [AGENTS.md](AGENTS.md).
