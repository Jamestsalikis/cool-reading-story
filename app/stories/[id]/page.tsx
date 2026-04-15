'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Page = {
  page_number: number;
  content: string;
  image_prompt: string;
  image_url: string | null;
};

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
  pages: Page[];
  children: { name: string; age: number };
};

const pageStyles = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeSlideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .page-enter { animation: fadeSlideIn 0.35s ease; }
  .page-enter-left { animation: fadeSlideInLeft 0.35s ease; }
`;

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
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

  const goToPage = (index: number) => {
    setDirection(index > currentPage ? 'forward' : 'back');
    setAnimKey((k) => k + 1);
    setCurrentPage(index);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B5E4E' }}>Loading story...</p>
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

  const pages: Page[] = story.pages?.length > 0
    ? story.pages
    : story.content.split('\n\n').filter(Boolean).map((para, i) => ({
        page_number: i + 1,
        content: para,
        image_prompt: '',
        image_url: null,
      }));

  const totalPages = pages.length;
  const page = pages[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  const paragraphs = page.content.split('\n\n').filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1A1209', display: 'flex', flexDirection: 'column' }}>
      <style>{pageStyles}</style>

      {/* Top Bar */}
      <div style={{
        backgroundColor: 'rgba(26,18,9,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} />
          Library
        </Link>
        <h1 className="font-serif" style={{ fontSize: '1rem', color: 'white', margin: 0, textAlign: 'center', flex: 1, padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {story.title}
        </h1>
        <button
          onClick={toggleFavourite}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <Heart size={20} color="#741515" fill={favourite ? '#741515' : 'none'} />
        </button>
      </div>

      {/* Book Page */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '680px', width: '100%', margin: '0 auto' }}>

        {/* Page Image */}
        <div
          key={`img-${animKey}`}
          className={direction === 'forward' ? 'page-enter' : 'page-enter-left'}
          style={{
            width: '100%',
            aspectRatio: '4/3',
            backgroundColor: '#2a1f14',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {page.image_url ? (
            <img
              src={page.image_url}
              alt={`Page ${currentPage + 1} illustration`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a3a3a 0%, #2d6a5c 100%)',
            }}>
              <span style={{ fontSize: '5rem' }}>{story.theme || '📖'}</span>
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
          }}>
            {currentPage + 1} / {totalPages}
          </div>
        </div>

        {/* Page Text */}
        <div
          key={`text-${animKey}`}
          className={direction === 'forward' ? 'page-enter' : 'page-enter-left'}
          style={{
            backgroundColor: '#FAF7F0',
            flex: 1,
            padding: '28px 24px 120px',
          }}
        >
          {currentPage === 0 && (
            <h2 className="font-serif" style={{ fontSize: '1.4rem', color: '#1A1209', marginBottom: '20px', lineHeight: 1.3 }}>
              {story.title}
            </h2>
          )}

          <div style={{ lineHeight: 1.85, color: '#1A1209', fontSize: '1.05rem' }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
            ))}
          </div>

          {isLastPage && story.moral && (
            <div style={{
              borderLeft: '3px solid #741515',
              paddingLeft: '16px',
              margin: '24px 0 0',
              color: '#6B5E4E',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}>
              {story.moral}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FAF7F0',
        borderTop: '1px solid #E8E0D0',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 10,
      }}>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.7rem 1.2rem',
            border: '2px solid #741515',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: '#741515',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 0 ? 0.3 : 1,
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <ChevronLeft size={18} /> Prev
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              style={{
                width: i === currentPage ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === currentPage ? '#741515' : '#D4C4B0',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>

        {isLastPage ? (
          <Link
            href="/dashboard"
            className="btn-brand"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.7rem 1.2rem', fontSize: '0.9rem' }}
          >
            Done <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            onClick={() => goToPage(currentPage + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.7rem 1.2rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#741515',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
