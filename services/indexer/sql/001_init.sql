BEGIN;

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  address TEXT PRIMARY KEY,
  creator TEXT NOT NULL,
  beneficiary TEXT NOT NULL,
  goal NUMERIC(78, 0) NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  metadata_uri TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  chain_id BIGINT NOT NULL,
  implementation TEXT NOT NULL,
  fee_bps INTEGER NOT NULL,
  factory_address TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns (status);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON campaigns (created_at DESC);

CREATE TABLE IF NOT EXISTS contributions (
  id BIGSERIAL PRIMARY KEY,
  campaign_address TEXT NOT NULL REFERENCES campaigns(address) ON DELETE CASCADE,
  contributor TEXT NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  fee NUMERIC(78, 0) NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS contributions_campaign_idx ON contributions (campaign_address);
CREATE INDEX IF NOT EXISTS contributions_contributor_idx ON contributions (contributor);
CREATE INDEX IF NOT EXISTS contributions_block_number_idx ON contributions (block_number);

CREATE TABLE IF NOT EXISTS refunds (
  id BIGSERIAL PRIMARY KEY,
  campaign_address TEXT NOT NULL REFERENCES campaigns(address) ON DELETE CASCADE,
  contributor TEXT NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS refunds_campaign_idx ON refunds (campaign_address);
CREATE INDEX IF NOT EXISTS refunds_contributor_idx ON refunds (contributor);

CREATE TABLE IF NOT EXISTS finalizations (
  campaign_address TEXT PRIMARY KEY REFERENCES campaigns(address) ON DELETE CASCADE,
  caller TEXT NOT NULL,
  beneficiary TEXT NOT NULL,
  payout NUMERIC(78, 0) NOT NULL,
  fee_total NUMERIC(78, 0) NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metadata_updates (
  id BIGSERIAL PRIMARY KEY,
  campaign_address TEXT NOT NULL REFERENCES campaigns(address) ON DELETE CASCADE,
  metadata_uri TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tx_hash, log_index)
);

CREATE TABLE IF NOT EXISTS indexer_progress (
  name TEXT PRIMARY KEY,
  last_block BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
