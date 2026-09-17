'use client';
import dynamic from 'next/dynamic';
const OnboardingPage = dynamic(() => import('../../onboarding/page'), { ssr: false });
export default function Page() { return <OnboardingPage />; }
