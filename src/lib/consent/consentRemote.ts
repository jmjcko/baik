import { CONSENT_PURPOSES, isConsentPurpose, type ConsentPurpose } from './purposes';
import type { ConsentMap } from './consentStore';

interface ServiceError {
  code?: string;
  message?: string;
}

interface ConsentRow {
  user_id: string;
  purpose: ConsentPurpose;
  text_version: number;
  granted: boolean;
  decided_at: string;
}

/** The part of the Supabase client that the consents use: the table `consents` (a small fake is enough in tests). */
export interface ConsentDatabase {
  from: (table: 'consents') => {
    select: (columns: '*') => { eq: (column: 'user_id', value: string) => PromiseLike<{ data: unknown; error: ServiceError | null }> };
    upsert: (rows: ConsentRow[], options: { onConflict: 'user_id,purpose' }) => PromiseLike<{ error: ServiceError | null }>;
  };
}

const asEntry = (row: unknown): [ConsentPurpose, ConsentMap[ConsentPurpose]] | null => {
  if (typeof row !== 'object' || row === null) return null;
  const { purpose, text_version: version, granted, decided_at: decidedAt } = row as Record<string, unknown>;
  if (!isConsentPurpose(purpose) || typeof granted !== 'boolean' || !Number.isInteger(version) || typeof decidedAt !== 'string') return null;
  if (Number.isNaN(Date.parse(decidedAt))) return null;
  return [purpose, { granted, version: version as number, decidedAt }];
};

/** The stored decisions of the signed in rider, or null when they cannot be read (the caller then leaves the stored rows alone). */
export async function fetchRemoteConsents(db: ConsentDatabase, userId: string): Promise<ConsentMap | null> {
  try {
    const { data, error } = await db.from('consents').select('*').eq('user_id', userId);
    if (error || !Array.isArray(data)) return null;
    const map: ConsentMap = {};
    for (const row of data) {
      const entry = asEntry(row);
      if (entry) map[entry[0]] = entry[1];
    }
    return map;
  } catch {
    return null;
  }
}

/** Writes the decisions of the rider (row level security allows only the own rows). */
export async function saveRemoteConsents(db: ConsentDatabase, userId: string, map: ConsentMap): Promise<boolean> {
  const rows: ConsentRow[] = CONSENT_PURPOSES.flatMap((purpose) => {
    const entry = map[purpose];
    return entry ? [{ user_id: userId, purpose, text_version: entry.version, granted: entry.granted, decided_at: entry.decidedAt }] : [];
  });
  if (rows.length === 0) return true;
  try {
    const { error } = await db.from('consents').upsert(rows, { onConflict: 'user_id,purpose' });
    return !error;
  } catch {
    return false;
  }
}
