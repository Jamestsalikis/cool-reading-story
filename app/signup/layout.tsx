import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start for free',
  alternates: { canonical: '/signup' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
