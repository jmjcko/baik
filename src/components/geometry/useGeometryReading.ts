'use client';

import { useState } from 'react';
import type { Reading, TableReader } from './readers';

/** The files, the bike name and the reading of the tables: the state that the owner's page and the rider's intake share. */
export function useGeometryReading(reader: TableReader, initialName = '', initial: Reading = { status: 'idle' }) {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState(initialName);
  const [reading, setReading] = useState<Reading>(initial);
  /** Reads the tables in `given` files (default: the chosen ones) under `named` (default: the name box). */
  const read = async (named: string = name, given: File[] = files) => {
    setReading({ status: 'working' });
    setReading(await reader(given, named.trim()));
  };
  return { files, setFiles, name, setName, reading, setReading, read, clear: () => { setFiles([]); setName(''); } };
}
