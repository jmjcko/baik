import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'bAIk Studio — Your AI-Powered Cycling Hub',
  description: 'AI Bike Fitting, maintenance diagnostics, cycling advisory and component recommendations.',
};

/** Applies the stored theme before the first paint, so a saved dark theme does not flash light on a reload. */
const THEME_SCRIPT = "try{var t=localStorage.getItem('baik_theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
