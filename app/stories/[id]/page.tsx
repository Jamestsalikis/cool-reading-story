'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
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

const bookStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  @keyframes pageForward {
    from { opacity: 0; transform: translateX(40px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes pageBack {
    from { opacity: 0; transform: translateX(-40px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  .page-forward { animation: pageForward 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .page-back    { animation: pageBack 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .shimmer { animation: shimmer 1.8s ease infinite; }

  .book-page {
    background: #FFFEF9;
    box-shadow:
      0 2px 4px rgba(0,0,0,0.08),
      0 8px 24px rgba(0,0,0,0.12),
      inset 0 0 0 1px rgba(0,0,0,0.04);
    border-radius: 4px 12px 12px 4px;
    position: relative;
    overflow: hidden;
  }
  .book-page::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 28px;
    background: linear-gradient(to right, #E8DDD0, #F5F0E8);
    border-right: 1px solid rgba(0,0,0,0.06);
    z-index: 1;
  }
  .book-page::after {
    content: '';
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(0,0,0,0.04);
    z-index: 1;
  }

  .story-text {
    font-family: 'Lora', Georgia, serif;
    font-size: 1.1rem;
    line-height: 1.9;
    color: #2C1A0E;
    letter-spacing: 0.01em;
  }
  .story-text p { margin-bottom: 1.2em; }

  .page-border {
    position: absolute;
    inset: 36px 16px 16px 36px;
    border: 1.5px solid rgba(116,21,21,0.12);
    border-radius: 4px;
    pointer-events: none;
    z-index: 0;
  }

  /* ---- Print styles ---- */
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .print-page {
      page-break-after: always;
      break-after: page;
      width: 100%;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }
    .print-page:last-child { page-break-after: avoid; }
    .print-image {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
    }
    .print-text {
      padding: 24px 32px;
      font-family: 'Lora', Georgia, serif;
      font-size: 14pt;
      line-height: 1.8;
      color: #000;
    }
    .print-title {
      font-family: 'Lora', Georgia, serif;
      font-size: 22pt;
      text-align: center;
      margin-bottom: 12pt;
    }
    .print-moral {
      border-left: 3px solid #741515;
      padding-left: 16px;
      font-style: italic;
      margin-top: 24pt;
      font-size: 12pt;
    }
    .print-page-num {
      text-align: center;
      font-size: 10pt;
      color: #666;
      margin-top: 16pt;
    }
    .book-page, .book-page::before, .book-page::after { box-shadow: none !important; }
  }
`;

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [generatingImages, setGeneratingImages] = useState(false);
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

        const pages = data.pages || [];
        const needsImages = pages.length > 0 && pages.some((p: Page) => p.image_prompt && !p.image_url);
        if (needsImages) {
          setGeneratingImages(true);
          fetch('/api/generate-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story_id: data.id }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.pages) {
                setStory((prev) => prev ? { ...prev, pages: result.pages } : prev);
              }
            })
            .finally(() => setGeneratingImages(false));
        }
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
      <div style={{ minHeight: '100vh', background: '#2C1810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>Opening your book...</p>
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

  // ---- Screen reading view ----
  return (
    <>
      {/* Print-only layout: all pages rendered for printing */}
      <div style={{ display: 'none' }} className="print-only">
        {pages.map((p, i) => (
          <div key={p.page_number} className="print-page">
            {i === 0 && (
              <h1 className="print-title">{story.title}</h1>
            )}
            {p.image_url && (
              <img src={p.image_url} alt={`Page ${i + 1}`} className="print-image" />
            )}
            <div className="print-text">
              {p.content.split('\n\n').filter(Boolean).map((para, j) => (
                <p key={j}>{para}</p>
              ))}
              {i === totalPages - 1 && story.moral && (
                <div className="print-moral">{story.moral}</div>
              )}
            </div>
            <div className="print-page-num">{i + 1}</div>
          </div>
        ))}
      </div>

      <style>{bookStyles}</style>

      {/* Screen layout */}
      <div className="no-print" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2C1810 0%, #1a0f08 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 100px' }}>

        {/* Top Bar */}
        <div style={{
          width: '100%',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(44,24,16,0.9)',
          backdropFilter: 'blur(8px)',
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={15} /> Library
          </Link>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center', flex: 1, padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {story.title}
          </span>
          <button onClick={toggleFavourite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex' }}>
            <Heart size={19} color="#c4784a" fill={favourite ? '#c4784a' : 'none'} />
          </button>
        </div>

        {/* Book */}
        <div
          key={animKey}
          className={`book-page ${direction === 'forward' ? 'page-forward' : 'page-back'}`}
          style={{ width: '100%', maxWidth: '620px', margin: '24px 16px 0', flex: 1 }}
        >
          <div className="page-border" />

          {/* Illustration */}
          <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', position: 'relative', marginLeft: '28px', width: 'calc(100% - 28px)' }}>
            {page.image_url ? (
              <img
                src={page.image_url}
                alt={`Page ${currentPage + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #d4e8d4 0%, #b8d4c8 50%, #c8d4e8 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <span style={{ fontSize: '4.5rem' }}>{story.theme || '📖'}</span>
                {generatingImages && (
                  <p className="shimmer" style={{ color: '#5a7a6a', fontSize: '0.8rem', margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                    Painting your illustration...
                  </p>
                )}
              </div>
            )}

            {/* Decorative corner ornaments on image */}
            {['topLeft','topRight','bottomLeft','bottomRight'].map((pos) => (
              <div key={pos} style={{
                position: 'absolute',
                width: '20px', height: '20px',
                top: pos.startsWith('top') ? '8px' : 'auto',
                bottom: pos.startsWith('bottom') ? '8px' : 'auto',
                left: pos.endsWith('Left') ? '8px' : 'auto',
                right: pos.endsWith('Right') ? '8px' : 'auto',
                border: '1.5px solid rgba(255,255,255,0.5)',
                borderRadius: '2px',
                borderRightColor: pos.endsWith('Left') ? 'transparent' : undefined,
                borderLeftColor: pos.endsWith('Right') ? 'transparent' : undefined,
                borderBottomColor: pos.startsWith('top') ? 'transparent' : undefined,
                borderTopColor: pos.startsWith('bottom') ? 'transparent' : undefined,
              }} />
            ))}
          </div>

          {/* Text area */}
          <div style={{ padding: '24px 28px 32px 52px', position: 'relative', zIndex: 2 }}>

            {/* Decorative rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(116,21,21,0.15), transparent)' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(116,21,21,0.4)' }}>✦</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, rgba(116,21,21,0.15), transparent)' }} />
            </div>

            {/* Title on first page */}
            {currentPage === 0 && (
              <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.5rem', color: '#2C1A0E', marginBottom: '20px', lineHeight: 1.3, fontWeight: 600 }}>
                {story.title}
              </h2>
            )}

            <div className="story-text">
              {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
            </div>

            {/* Moral on last page */}
            {isLastPage && story.moral && (
              <div style={{ borderLeft: '3px solid #741515', paddingLeft: '16px', marginTop: '20px', color: '#5a3a2a', fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {story.moral}
              </div>
            )}

            {/* Page number */}
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(116,21,21,0.35)', fontSize: '0.8rem', fontFamily: 'Georgia, serif' }}>
              — {currentPage + 1} —
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
          background: 'rgba(44,24,16,0.95)', backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', color: 'rgba(255,255,255,0.7)',
              padding: '0.6rem 1rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 0 ? 0.3 : 1, fontSize: '0.875rem',
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                style={{
                  width: i === currentPage ? '22px' : '7px',
                  height: '7px', borderRadius: '4px',
                  background: i === currentPage ? '#c4784a' : 'rgba(255,255,255,0.25)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s', padding: 0,
                }}
              />
            ))}
          </div>

          {isLastPage ? (
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#c4784a', border: 'none', borderRadius: '8px',
                color: 'white', padding: '0.6rem 1rem',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              <Printer size={15} /> Print book
            </button>
          ) : (
            <button
              onClick={() => goToPage(currentPage + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#741515', border: 'none', borderRadius: '8px',
                color: 'white', padding: '0.6rem 1rem',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
