'use client';

import { useEffect, useRef, useState } from 'react';
import type { FinderCategory, FinderParameterId } from '@/lib/finder/parameters';
import { candidateKey, clearProgress, emptyProgress, loadProgress, saveProgress, type FinderProgress } from '@/lib/finder/progress';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';
import type { FinderCandidate } from '@/lib/finder/types';

/**
 * The progress of one kind of bike, kept in this browser: read once after mounting (the storage does not exist while the server
 * renders), written after every change. Progress of another kind of bike is not used (it starts afresh).
 */
function useStoredProgress(category: FinderCategory) {
  const [progress, setProgress] = useState<FinderProgress>(() => emptyProgress(category));
  const [resumed, setResumed] = useState(false);
  const dirty = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = loadProgress();
    const usable = saved !== null && saved.category === category;
    setProgress(usable ? saved : emptyProgress(category));
    setResumed(usable && (saved.candidates.length > 0 || Object.keys(saved.answers).length > 0));
  }, [category]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Only what the rider changed is written (reading the stored progress back writes nothing). */
  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    saveProgress(progress);
  }, [progress]);

  const change = (patch: Partial<FinderProgress>) => {
    dirty.current = true;
    setProgress((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  };
  const reset = () => {
    clearProgress();
    setProgress(emptyProgress(category));
    setResumed(false);
  };
  return { progress, resumed, change, reset };
}

const withoutKey = <T,>(record: Record<string, T>, key: string): Record<string, T> => Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));

export function useFinderProgress(category: FinderCategory) {
  const { progress, resumed, change, reset } = useStoredProgress(category);
  return {
    progress,
    resumed,
    reset,
    setAnswer: (id: FinderParameterId, values: string[]) => change({ answers: { ...progress.answers, [id]: values } }),
    setStep: (step: number) => change({ step }),
    setCandidates: (candidates: FinderCandidate[]) => change({ candidates, tables: {} }),
    setTable: (candidate: FinderCandidate, table: SuppliedBike | null) => {
      const key = candidateKey(candidate);
      change({ tables: table ? { ...progress.tables, [key]: table } : withoutKey(progress.tables, key) });
    },
  };
}
