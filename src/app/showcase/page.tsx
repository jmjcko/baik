import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShowcaseClient } from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'bAIk component showcase',
  robots: { index: false, follow: false },
};

/** Development-only gallery of every bAIkfit report and studio component; it does not exist in production. */
export default function ShowcasePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ShowcaseClient />;
}
