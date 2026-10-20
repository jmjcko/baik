import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bAIk — Universal AI Cycling Intelligence Hub',
  description: 'AI Bike Fitting, maintenance diagnostics, cycling advisory and component recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
