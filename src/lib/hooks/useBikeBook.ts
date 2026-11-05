'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadBook, saveBook } from '@/lib/service/bookStore';
import { isEmptyBook, parseBook } from '@/lib/service/parseBook';
import type { BikeBook, BikeIdentity, KnownBike } from '@/types/service';

interface Held {
  bikeId: string;
  book: BikeBook;
}

const FIELDS = ['make', 'model', 'year'] as const;

const sameKnown = (a: KnownBike, b: KnownBike): boolean => FIELDS.every((field) => a[field] === b[field]);

/** Only make, model and year were ever filled in: such a book was filled from the bike, never by the rider. */
const isOnlyFromBike = (book: BikeBook): boolean => book.log.length === 0 && book.rides.length === 0 && !book.identity.serial && !book.identity.insurance && !book.identity.photo;

/** The garage no longer vouches for the bike it filled the book from: what is still exactly that is taken out again, what the rider typed stays. */
function withoutSeed(book: BikeBook, bikeId: string): BikeBook {
  const was = book.fromBike;
  if (!was) return book;
  const identity = { ...book.identity };
  for (const field of FIELDS) if (identity[field] === was[field]) Object.assign(identity, { [field]: field === 'year' ? null : '' });
  const next = { ...book, identity, fromBike: null };
  saveBook(bikeId, next);
  return next;
}

/**
 * The book starts with what the garage knows about the bike (the factory bike), and keeps following it when the factory bike changes:
 * a field is replaced only while it still holds what was filled in from the bike, so what the rider typed is never overwritten.
 */
function withSeed(book: BikeBook, bikeId: string, seed?: Partial<BikeIdentity>): BikeBook {
  const known: KnownBike = { make: seed?.make ?? '', model: seed?.model ?? '', year: seed?.year ?? null };
  if (known.make === '' && known.model === '' && known.year === null) return withoutSeed(book, bikeId);
  const before: KnownBike | null = book.fromBike ?? (!isEmptyBook(book) && isOnlyFromBike(book) ? { make: book.identity.make, model: book.identity.model, year: book.identity.year } : null);
  if (!isEmptyBook(book) && (before === null || sameKnown(before, known))) return book;
  const base = before ?? { make: '', model: '', year: null };
  const identity = { ...book.identity };
  for (const field of FIELDS) {
    const untouched = identity[field] === base[field] || identity[field] === '' || identity[field] === null;
    if (untouched && known[field] !== '' && known[field] !== null) Object.assign(identity, { [field]: known[field] });
  }
  const next = { ...book, identity, fromBike: known };
  saveBook(bikeId, next);
  return next;
}

/**
 * The book of one bike (identity, service log, reminder settings), kept in this browser only. It is read after the first render so that the
 * server and the browser draw the same page, and again when another bike is chosen. `saved` is false when the browser refused to store it.
 */
export function useBikeBook(bikeId: string, seed?: Partial<BikeIdentity>) {
  const [held, setHeld] = useState<Held>({ bikeId, book: parseBook(null) });
  const [saved, setSaved] = useState(true);
  const latest = useRef(held);
  const seedRef = useRef(seed);
  useEffect(() => { seedRef.current = seed; });
  useEffect(() => {
    latest.current = { bikeId, book: withSeed(loadBook(bikeId), bikeId, seedRef.current) };
    setHeld(latest.current);
  }, [bikeId]);

  const update = useCallback((change: (book: BikeBook) => BikeBook) => {
    const next = { bikeId: latest.current.bikeId, book: change(latest.current.book) };
    latest.current = next;
    setSaved(saveBook(next.bikeId, next.book));
    setHeld(next);
  }, []);
  return { book: held.book, update, saved };
}
