'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { IMAGE_MIME_TYPES } from '@/lib/bikes/extraction';
import type { BikeTable } from '@/lib/bikes/tableExtraction';
import { sharesOfSupplied, suppliedFromShares, type SuppliedBike } from '@/lib/bikes/suppliedBike';
import { useAuth } from '@/lib/auth/AuthContext';
import { submitBike } from '@/lib/catalog/store';
import { useCatalogDb, useIsAdmin } from '@/lib/catalog/hooks';
import { UploadReview } from '@/components/admin/UploadReview';
import { useAdminData } from '@/components/admin/useAdminData';
import { GeometryReader } from './GeometryReader';
import { adminReader, riderReader } from './readers';
import { useGeometryReading } from './useGeometryReading';

interface GeometryIntakeProps {
  t: Translations;
  /** The bike as the rider typed it or as it was suggested: a hint for the reading and the first guess of brand, model and year. */
  name: string;
  /** The checked geometry of the bike, ready for an audit. */
  onUse: (bike: SuppliedBike) => void;
}

/** A bike name as the reading accepts it: letters, digits and a few marks. */
const plainName = (name: string): string => name.replace(/[^\p{L}\p{N} .,/+()'-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

/** The owner: the same review as on the catalog page (save to the catalog, also to seedBikes.json), or use the sizes without saving. */
const OwnerReview: React.FC<{ t: Translations; table: BikeTable; name: string; onUse: GeometryIntakeProps['onUse']; onDiscard: () => void }> = ({ t, table, name, onUse, onDiscard }) => {
  const admin = useAdminData();
  if (admin.data.status !== 'ready') return <p role="status" className="text-sm text-ink-2">{t.admin.checking}</p>;
  const use = (plan: Parameters<typeof suppliedFromShares>[0]) => { const bike = suppliedFromShares(plan); if (bike) onUse(bike); };
  return (
    <UploadReview
      t={t} table={table} name={name} catalog={admin.data.catalog} actions={admin} seedOption={false}
      onDone={(result) => (result?.plan && result.saved === result.total ? use(result.plan) : result === null && onDiscard())}
      onUse={(plan) => use(plan)}
    />
  );
};

type Plan = Parameters<typeof suppliedFromShares>[0];

/** The rider's way out of the review: share the sizes with other riders when asked (signed in only), then hand the geometry on. */
function useRiderFinish(onUse: GeometryIntakeProps['onUse']) {
  const auth = useAuth();
  const getDb = useCatalogDb();
  const [note, setNote] = useState<'shared' | 'failed' | null>(null);
  const userId = auth.status === 'authenticated' ? (auth.user?.id ?? null) : null;
  const finish = async (plan: Plan, share: boolean) => {
    const bike = suppliedFromShares(plan);
    if (!bike) return;
    const db = getDb();
    if (share && userId && db) {
      const sent = await Promise.all(sharesOfSupplied(bike).map((one) => submitBike(db, userId, one)));
      setNote(sent.every(Boolean) ? 'shared' : 'failed');
    }
    onUse(bike);
  };
  return { note, finish, canShare: userId !== null };
}

/**
 * The geometry of a bike from the pictures of its tables: the same reading and the same check of the sizes as the owner's catalog
 * page. A rider uses the checked sizes for the audit (and may share them for the owner to check); the owner can add them to the
 * catalog right away.
 */
export const GeometryIntake: React.FC<GeometryIntakeProps> = ({ t, name, onUse }) => {
  const admin = useIsAdmin();
  const named = plainName(name);
  const state = useGeometryReading(admin ? adminReader : riderReader, named);
  const rider = useRiderFinish(onUse);
  const discard = () => state.setReading({ status: 'idle' });
  /* The pictures are read as soon as they are chosen: nothing else is asked of the rider. */
  const choose = (files: File[]) => {
    state.setFiles(files);
    if (files.length > 0) void state.read(named, files);
  };
  const texts = { ...t.admin.upload, dropTitle: t.geometry.dropTitle, dropHint: t.geometry.dropHint };
  const body = state.reading.status !== 'review' ? (
    <GeometryReader texts={texts} files={state.files} onFiles={choose} reading={state.reading} onRead={() => void state.read(named)} accept={admin ? undefined : IMAGE_MIME_TYPES} />
  ) : admin ? (
    <OwnerReview t={t} table={state.reading.table} name={named} onUse={onUse} onDiscard={discard} />
  ) : (
    <UploadReview t={t} table={state.reading.table} name={named} catalog={[]} rider={{ canShare: rider.canShare }} onUse={(plan, share) => void rider.finish(plan, share)} onDone={discard} />
  );
  return (
    <div className="space-y-2" data-testid="geometry-intake">
      {body}
      {rider.note && <p role="status" className="text-xs text-ink-2">{rider.note === 'shared' ? t.geometry.shared : t.geometry.shareFailed}</p>}
    </div>
  );
};
