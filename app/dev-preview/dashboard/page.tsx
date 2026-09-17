'use client';
import dynamic from 'next/dynamic';
const DashboardContent = dynamic(() => import('../../dashboard/DashboardContent'), { ssr: false });
export default function Page() { return <DashboardContent />; }
