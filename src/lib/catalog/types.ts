import type { SizeSpec } from '@/lib/bikes/types';

export type CatalogOrigin = 'owner' | 'community';

/** An approved bike size of the community catalog (public to read). */
export interface CatalogRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  size: string;
  key: string;
  spec: SizeSpec;
  origin: CatalogOrigin;
  /** How many approved submissions stand behind it. */
  confirmations: number;
  note: string | null;
  /** Put into the catalog by the agreement of riders, without the owner (the owner can still delete it). */
  autoApproved: boolean;
}

/** A bike that riders had to read with the AI because it was not in the lists yet, with how many times. */
export interface BikeMiss {
  key: string;
  brand: string;
  model: string;
  year: number;
  times: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

/** Numbers of a bike that a rider shared; waits for the owner. */
export interface SubmissionRow {
  id: string;
  userId: string | null;
  brand: string;
  model: string;
  year: number;
  size: string;
  key: string;
  spec: SizeSpec;
  status: SubmissionStatus;
  catalogId: string | null;
  reviewNote: string | null;
  createdAt: string;
}

/** What a rider shares: the numbers only, never a picture or a link. */
export interface BikeShare {
  brand: string;
  model: string;
  year: number;
  size: string;
  spec: SizeSpec;
}
