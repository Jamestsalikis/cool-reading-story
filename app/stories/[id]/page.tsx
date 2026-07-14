'use client';

// Web route for the reader (deep links, Stripe return URLs). The native app
// uses the static /story?id= route instead. Both render the shared StoryReader.
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { StoryReader } from '@/components/StoryReader';

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AuthGuard>
      <StoryReader id={id} />
    </AuthGuard>
  );
}
