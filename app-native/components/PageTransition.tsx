'use client';

// Native-style screen transitions. Re-keys on the route path so each new screen
// replays a quick fade + slide-in — giving the app an iOS-like "push" feel
// without a heavy animation library. Only fires on real screen changes (path
// changes), not on in-screen state changes like flipping story pages.
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
