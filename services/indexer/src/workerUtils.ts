import { query } from "./db.js";

export function normalizeAddress(address: string): `0x${string}` {
  const value = address.toLowerCase();
  if (!/^0x[a-f0-9]{40}$/u.test(value)) {
    throw new Error(`Invalid address: ${address}`);
  }
  return value as `0x${string}`;
}

export async function getCampaignAddresses(): Promise<`0x${string}`[]> {
  const { rows } = await query<{ address: string }>(
    `SELECT address FROM campaigns ORDER BY created_at ASC`,
  );
  return rows.map((row) => normalizeAddress(row.address));
}
