import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('./DashboardContent'), { ssr: false });

export default function Page() {
  return <DashboardPage />;
}
