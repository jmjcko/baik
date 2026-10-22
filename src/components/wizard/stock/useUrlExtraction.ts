'use client';

import { useState } from 'react';
import { extractStockBikeSpec, type ExtractErrorCode } from '@/app/actions/extractStockBikeSpec';
import type { AiStockSelection } from '@/lib/bikes/types';

export type ExtractionStatus = 'idle' | 'working' | 'review' | 'error';

/** State of "load the bike from a page": the fields, the request, and the AI proposal that waits for the rider's confirmation. */
export function useUrlExtraction() {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('');
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [error, setError] = useState<ExtractErrorCode | null>(null);
  const [proposal, setProposal] = useState<AiStockSelection | null>(null);

  const load = async () => {
    setStatus('working');
    setError(null);
    const result = await extractStockBikeSpec({ url: url.trim(), size });
    if (result.success && result.bike) {
      setProposal(result.bike);
      return setStatus('review');
    }
    setError(result.error ?? 'unavailable');
    setStatus('error');
  };

  /** Forget the proposal and the fields: the link is never kept. */
  const reset = () => {
    setUrl('');
    setSize('');
    setProposal(null);
    setError(null);
    setStatus('idle');
  };

  return { url, setUrl, size, setSize, status, error, proposal, load, reset };
}
