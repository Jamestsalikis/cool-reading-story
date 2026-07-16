'use client';

// Static reader route for the bundled native app: reads the story id from the
// query string (/story?id=<uuid>) so it survives `output: export` (no dynamic
// route segment to prerender). The web app keeps /stories/[id] as well.
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { StoryReader } from '@/components/StoryReader';

function StoryFromQuery() {
  const id = useSearchParams().get('id') ?? '';
  return <StoryReader id={id} />;
}

export default function StoryQueryPage() {
  return (
    <AuthGuard>
      {/* useSearchParams requires a Suspense boundary under static export */}
      <Suspense fallback={null}>
        <StoryFromQuery />
      </Suspense>
    </AuthGuard>
  );
}
