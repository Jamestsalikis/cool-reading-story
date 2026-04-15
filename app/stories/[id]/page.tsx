'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Story = {
  id: string;
  title: string;
  content: string;
  theme: string;
  moral: string;
  word_count: number;
  reading_time_minutes: number;
  is_favourite: boolean;
  created_at: string;
  children: { name: string; age: number };
};

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStory() {
      const { data } = await supabase
        .from('stories')
        .select('*, children(name, age)')
        .eq('id', id)
        .single();

      if (data) {
        setStory(data);
        setFavourite(data.is_favourite);
      }
      setLoading(false);
    }
    fetchStory();
  }, [id, supabase]);

  const toggleFavourite = async () => {
    const newVal = !favourite;
    setFavourite(newVal);
    await supabase.from('stories').update({ is_favourite: newVal }).eq('id', id);
  };

  const gradients = [
    'linear-gradient(135deg, #1a3a3a 0%, #2d6a5c 100%)',
    'linear-gradient(135deg, #0a2540 0%, #1a5a7a 100%)',
    'linear-gradient(135deg, #2a1a3a 0%, #5a3a6a 100%)',
    'linear-gradient(135deg, #3a1a1a 0%, #741515 100%)',
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B5E4E', fontSize: '1rem' }}>Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#6B5E4E' }}>Story not found.</p>
        <Link href="/dashboard" className="btn-brand">Back to dashboard</Link>
      </div>
    );
  }

  const coverGradient = gradients[story.title.length % gradients.length];
  const paragraphs = story.content.split('\n\n').filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0' }}>
      {/* Top Bar */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E8E0D0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#741515', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}
        >
          <ArrowLeft size={18} />
          Back to library
        </Link>
        <h1 className="font-serif" style={{ fontSize: '1.1rem', color: '#1A1209', margin: 0, textAlign: 'center', flex: 1, padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {story.title}
        </h1>
        <button
          onClick={toggleFavourite}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <Heart size={20} color="#741515" fill={favourite ? '#741515' : 'none'} />
        </button>
      </div>

      {/* Cover */}
      <div
        style={{
          background: coverGradient,
          height: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>{story.theme || '📖'}</div>
        <h2 className="font-serif" style={{ fontSize: '1.75rem', margin: '0 0 10px', maxWidth: '600px', lineHeight: 1.3 }}>
          {story.title}
        </h2>
        <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.85 }}>
          {story.children?.name} • {story.reading_time_minutes ? `${story.reading_time_minutes} min read` : ''} • {new Date(story.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Story Content */}
      <div style={{ padding: '56px 20px', backgroundColor: 'white' }}>
        <article style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '32px' }}>✦</div>

          <div style={{ lineHeight: 1.9, color: '#1A1209', fontSize: '1.05rem' }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: '1.5rem' }}>{para}</p>
            ))}
          </div>

          {story.moral && (
            <div
              style={{
                borderLeft: '3px solid #741515',
                paddingLeft: '20px',
                margin: '40px 0',
                color: '#6B5E4E',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              {story.moral}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '40px' }}>✦</div>
        </article>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #E8E0D0',
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <button
          className="btn-brand"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.75rem' }}
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.75rem' }}
        >
          Order printed copy
        </button>
      </div>

      <div style={{ height: '80px' }} />
    </div>
  );
}
