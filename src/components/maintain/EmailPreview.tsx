'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { copyText } from '@/lib/clipboard';
import { buildReminderEmail } from '@/lib/notifications/emailTemplate';
import type { Reminder } from '@/lib/notifications/reminderEngine';

interface PreviewProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeName: string;
  reminders: Reminder[];
}

/** The reminder e-mail as it would look: the subject, the page itself in a sandbox without scripts, and a button that copies the text version. Nothing is sent. */
export const EmailPreview: React.FC<PreviewProps> = ({ t, locale, bikeName, reminders }) => {
  const e = t.service.reminders.email;
  const mail = useMemo(() => buildReminderEmail({ texts: t.service, bikeName, reminders, appUrl: window.location.origin, locale }), [t, bikeName, reminders, locale]);
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => setState((await copyText(mail.text)) ? 'copied' : 'failed');
  return (
    <div className="rounded-xl border border-line bg-sunken p-4 space-y-3" data-testid="email-preview">
      <div>
        <h3 className="text-sm font-bold text-ink">{e.title}</h3>
        <p className="text-xs text-ink-2 mt-1">{e.hint}</p>
      </div>
      <p className="text-sm text-ink"><span className="font-semibold">{e.subject}:</span> <span data-testid="email-subject">{mail.subject}</span></p>
      <iframe title={e.title} sandbox="" srcDoc={mail.html} data-testid="email-frame" className="w-full h-96 rounded-xl border border-line bg-surface" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} data-testid="email-copy" className="h-10 px-5 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken inline-flex items-center gap-2">
          {state === 'copied' ? <Check aria-hidden="true" className="w-4 h-4" /> : <Copy aria-hidden="true" className="w-4 h-4" />}
          {state === 'copied' ? e.copied : e.copy}
        </button>
        {state === 'failed' && <p role="alert" className="text-sm font-semibold text-tone-danger-ink">{e.failed}</p>}
      </div>
    </div>
  );
};
