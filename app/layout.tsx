import type { Metadata, Viewport } from 'next';
import { EVENT_NAME } from '../lib/brand';
import './globals.css';

export const metadata: Metadata = { title: EVENT_NAME, description: 'Your Friday assignment awaits.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, colorScheme: 'light dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
