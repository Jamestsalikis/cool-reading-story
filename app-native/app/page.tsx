'use client';

// App launch entry (the bundle's index.html). Routes to the dashboard if there's
// a session, otherwise to login. Shows a brand splash while deciding.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? '/dashboard' : '/login');
    });
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF4E6', gap: '20px' }}>
      <style>{`@keyframes tp-splash{to{transform:rotate(360deg)}}`}</style>
      <img src="/mood-3.png" alt="TalePop" style={{ height: '80px', width: 'auto' }} />
      <div style={{ width: 36, height: 36, border: '4px solid rgba(255,107,53,0.2)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'tp-splash 0.8s linear infinite' }} />
    </div>
  );
}
