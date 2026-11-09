import { useState } from 'react';
import { useConsent } from '@/lib/consent/useConsent';
import type { PrePurchaseGeometry } from '@/types/baikfit';

/** What the audit is run for: the bike's name and its geometry (the typed bike, or a bike that the finder suggested). */
export interface AuditTarget {
  name: string;
  geometry: PrePurchaseGeometry;
}

/**
 * The AI part of the audit is asked for once, before the first audit; a refusal still gives the report of the rules.
 * `execute` runs the audit and is told whether the AI service may be used.
 */
export function useAuditConsent(execute: (target: AuditTarget, aiConsent: boolean) => Promise<void>) {
  const ai = useConsent('ai_processing');
  const [held, setHeld] = useState<AuditTarget | null>(null);
  const [aiUsed, setAiUsed] = useState(true);

  const run = async (target: AuditTarget, aiConsent: boolean) => {
    setAiUsed(aiConsent);
    await execute(target, aiConsent);
  };
  const begin = async (target: AuditTarget) => {
    if (ai.state === 'unknown') return setHeld(target);
    await run(target, ai.state === 'granted');
  };
  const answer = async (agreed: boolean) => {
    if (agreed) ai.grant();
    else ai.decline();
    const target = held;
    setHeld(null);
    if (target) await run(target, agreed);
  };
  return { held, aiUsed, begin, answer };
}
