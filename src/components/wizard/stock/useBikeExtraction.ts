'use client';

import { useState } from 'react';
import { extractStockBikeSpec, extractStockBikeSpecFromImage, type ExtractErrorCode } from '@/app/actions/extractStockBikeSpec';
import { MAX_IMAGE_BASE64_LENGTH, type ExtractedBike } from '@/lib/bikes/extraction';
import { canUseFile, prepareGeometryImage } from '@/lib/bikes/prepareImage';

export type ExtractionStatus = 'idle' | 'working' | 'review' | 'error';
export type ExtractionSource = 'link' | 'image';

/** What the rider has entered: the source (link or picture), the link, the picture and the frame size. */
function useExtractionFields() {
  const [source, setSource] = useState<ExtractionSource>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState('');
  return { source, setSource, url, setUrl, file, setFile, size, setSize, clear: () => { setUrl(''); setFile(null); setSize(''); } };
}

type Fields = ReturnType<typeof useExtractionFields>;

/** The request for the chosen source. The picture is shrunk here, so the server only ever gets a small JPEG without hidden data. */
async function requestFor({ source, url, file, size }: Pick<Fields, 'source' | 'url' | 'file' | 'size'>) {
  if (source === 'link') return extractStockBikeSpec({ url: url.trim(), size });
  const prepared = file ? await prepareGeometryImage(file, MAX_IMAGE_BASE64_LENGTH) : null;
  return prepared ? extractStockBikeSpecFromImage({ ...prepared, size }) : { success: false, error: 'invalid_image' as const };
}

/** State of "read my bike from a link or a picture": the fields, the request, and the proposal that waits for the rider's check. */
export function useBikeExtraction() {
  const fields = useExtractionFields();
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [error, setError] = useState<ExtractErrorCode | null>(null);
  const [proposal, setProposal] = useState<ExtractedBike | null>(null);

  /** A picture the rider chose, dropped or pasted: an unusable file is refused at once with the same fixed text. */
  const chooseFile = (chosen: File | null) => {
    const unusable = chosen !== null && !canUseFile(chosen);
    fields.setFile(unusable ? null : chosen);
    setError(unusable ? 'invalid_image' : null);
    setStatus(unusable ? 'error' : 'idle');
  };

  const load = async () => {
    setStatus('working');
    setError(null);
    const result = await requestFor(fields);
    if (result.success && result.bike) {
      setProposal(result.bike);
      return setStatus('review');
    }
    setError(result.error ?? 'unavailable');
    setStatus('error');
  };

  /** Forget the proposal, the picture and the link: none of them is kept. */
  const reset = () => {
    fields.clear();
    setProposal(null);
    setError(null);
    setStatus('idle');
  };

  return { ...fields, chooseFile, status, error, proposal, load, reset };
}
