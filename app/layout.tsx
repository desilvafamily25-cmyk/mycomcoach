import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakClinic Coach',
  description: 'Practise the conversation before it matters. A daily communication gym for doctors.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
