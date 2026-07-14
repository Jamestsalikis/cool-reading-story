'use client';

import dynamic from 'next/dynamic';
import { AuthGuard } from '@/components/AuthGuard';

const DashboardContent = dynamic(() => import('./DashboardContent'), { ssr: false });

export default function DashboardWrapper() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
