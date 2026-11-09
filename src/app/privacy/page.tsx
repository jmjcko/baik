import type { Metadata } from 'next';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'bAIk Privacy',
  description: 'What bAIk does with your data.',
};

/** The privacy page: the language follows the choice of the app, and the rider can change every consent here, signed in or not. */
export default function PrivacyPage() {
  return <PrivacyClient />;
}
