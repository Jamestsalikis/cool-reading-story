'use client';

import { useState, useEffect } from 'react';

/**
 * SSR-safe mobile breakpoint hook.
 * Returns false on the server and first client render, then updates
 * to the real value after mount. Defaults to a 768px breakpoint.
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
