'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FeedbackModal from '@/components/FeedbackModal';

type Page = {
  page_number: number;
  content: string;
  image_prompt: string;
  image_url: string | null;
  poll_url?: string | null;
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

// Layout per page index — alternates image position for visual interest
// 'top' = image above text, 'bottom' = text above image
const PAGE_LAYOUTS: Array<'top' | 'bottom'> = [
  'top',    // Page 1: big image at top
  'bottom', // Page 2: text first, image below
  'top',    // Page 3
  'bottom', // Page 4
  'top',    // Page 5
];

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
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.95; }
  }
  @keyframes paintDot {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
  .page-forward { animation: pageForward 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .page-back    { animation: pageBack 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .shimmer { animation: shimmer 1.8s ease infinite; }
  .paint-dot-1 { animation: paintDot 1.4s ease infinite 0s; }
  .paint-dot-2 { animation: paintDot 1.4s ease infinite 0.2s; }
  .paint-dot-3 { animation: paintDot 1.4s ease infinite 0.4s; }

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
    font-size: 1.05rem;
    line-height: 1.9;
    color: #2C1A0E;
    letter-spacing: 0.01em;
  }
  .story-text p { margin-bottom: 1.2em; }

  .page-border {
    position: absolute;
    inset: 36px 16px 16px 36px;
    border: 1.5px solid rgba(116,21,21,0.10);
    border-radius: 4px;
    pointer-events: none;
    z-index: 0;
  }

  .illus-wrap {
    position: relative;
    overflow: hidden;
  }
  .illus-wrap img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .corner-ornament {
    position: absolute;
    width: 18px; height: 18px;
    border: 1.5px solid rgba(255,255,255,0.55);
    border-radius: 2px;
    pointer-events: none;
  }

  /* ---- Print styles ---- */
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
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
  @media screen {
    .print-only { display: none !important; }
  }
`;

function IllustrationPlaceholder({ generating, theme }: { generating: boolean; theme: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #d4e8d4 0%, #b8d4c8 50%, #c8d4e8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
    }}>
      <span style={{ fontSize: '3.5rem' }}>{theme || '📖'}</span>
      {generating && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <p className="shimmer" style={{ color: '#5a7a6a', fontSize: '0.75rem', margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Painting your illustration
          </p>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span className="paint-dot-1" style={{ fontSize: '0.6rem', color: '#5a7a6a' }}>●</span>
            <span className="paint-dot-2" style={{ fontSize: '0.6rem', color: '#5a7a6a' }}>●</span>
            <span className="paint-dot-3" style={{ fontSize: '0.6rem', color: '#5a7a6a' }}>●</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CornerOrnaments() {
  return (
    <>
      {(['topLeft','topRight','bottomLeft','bottomRight'] as const).map((pos) => (
        <div key={pos} className="corner-ornament" style={{
          top: pos.startsWith('top') ? '7px' : 'auto',
          bottom: pos.startsWith('bottom') ? '7px' : 'auto',
          left: pos.endsWith('Left') ? '7px' : 'auto',
          right: pos.endsWith('Right') ? '7px' : 'auto',
          borderRightColor: pos.endsWith('Left') ? 'transparent' : undefined,
          borderLeftColor: pos.endsWith('Right') ? 'transparent' : undefined,
          borderBottomColor: pos.startsWith('top') ? 'transparent' : undefined,
          borderTopColor: pos.startsWith('bottom') ? 'transparent' : undefined,
        }} />
      ))}
    </>
  );
}

function DecorativeRule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(116,21,21,0.15), transparent)' }} />
      <span style={{ fontSize: '0.7rem', color: 'rgba(116,21,21,0.4)' }}>✦</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, rgba(116,21,21,0.15), transparent)' }} />
    </div>
  );
}

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  // Set of page numbers currently having their image generated
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const imageGenStarted = useRef(false);
  const feedbackShown = useRef(false);
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

        const pages: Page[] = data.pages || [];
        const pagesNeedingImages = pages.filter((p) => p.image_prompt && !p.image_url);

        if (pagesNeedingImages.length > 0 && !imageGenStarted.current) {
          imageGenStarted.current = true;
          setLoadingPages(new Set(pagesNeedingImages.map((p) => p.page_number)));

          // Sequential browser-driven generation — one image at a time.
          // Each Vercel call is <1s (well within Hobby 10s limit).
          // Only one Replicate prediction runs at a time — no 429 rate limits.
          (async () => {
            for (const page of pagesNeedingImages) {
              // Step 1: create prediction — retries on 429 are handled inside the API route
              let pollUrl: string | null = null;
              try {
                const res = await fetch('/api/generate-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ story_id: data.id, page_number: page.page_number }),
                });
                if (res.ok) {
                  const result = await res.json();
                  pollUrl = result.poll_url ?? null;
                } else if (res.status === 429) {
                  // Still rate-limited after retry — wait 10s then try next page
                  await new Promise((r) => setTimeout(r, 10000));
                }
              } catch {}

              if (!pollUrl) continue;

              // Step 2: poll until image is ready, then move to next page
              for (let i = 0; i < 30; i++) {
                await new Promise((r) => setTimeout(r, 3000));
                try {
                  const res = await fetch('/api/poll-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ story_id: data.id, page_number: page.page_number, poll_url: pollUrl }),
                  });
                  const result = await res.json();
                  if (result.status === 'succeeded' && result.image_url) {
                    setStory((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        pages: prev.pages.map((p) =>
                          p.page_number === page.page_number ? { ...p, image_url: result.image_url } : p
                        ),
                      };
                    });
                    setLoadingPages((prev) => {
                      const next = new Set(prev);
                      next.delete(page.page_number);
                      return next;
                    });
                    break;
                  }
                  if (result.status === 'failed') break;
                } catch {}
              }

              // Short pause between images — gives Replicate rate limiter breathing room
              await new Promise((r) => setTimeout(r, 2000));
            }
          })();
        }
      }
      setLoading(false);
    }
    fetchStory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavourite = async () => {
    const newVal = !favourite;
    setFavourite(newVal);
    await supabase.from('stories').update({ is_favourite: newVal }).eq('id', id);
  };

  const goToPage = (index: number) => {
    setDirection(index > currentPage ? 'forward' : 'back');
    setAnimKey((k) => k + 1);
    setCurrentPage(index);

    // Show feedback modal when reaching the last page, once per week
    if (story && index === story.pages.length - 1 && !feedbackShown.current) {
      const last = localStorage.getItem('last_feedback_at');
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (!last || new Date(last).getTime() < sevenDaysAgo) {
        feedbackShown.current = true;
        setTimeout(() => setShowFeedback(true), 2000); // small delay after landing on last page
      }
    }
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
  const layout = PAGE_LAYOUTS[currentPage] ?? 'top';
  const isThisPageGenerating = loadingPages.has(page.page_number);

  // ---- Illustration element ----
  const illustrationEl = page.image_url ? (
    <img src={page.image_url} alt={`Page ${currentPage + 1} illustration`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  ) : (
    <IllustrationPlaceholder generating={isThisPageGenerating} theme={story.theme} />
  );

  // ---- Text content element ----
  const textContentEl = (
    <div style={{ padding: '22px 24px 28px 48px', position: 'relative', zIndex: 2 }}>
      <DecorativeRule />
      {currentPage === 0 && (
        <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.45rem', color: '#2C1A0E', marginBottom: '18px', lineHeight: 1.3, fontWeight: 600 }}>
          {story.title}
        </h2>
      )}
      <div className="story-text">
        {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
      </div>
      {isLastPage && story.moral && (
        <div style={{ borderLeft: '3px solid #741515', paddingLeft: '16px', marginTop: '18px', color: '#5a3a2a', fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {story.moral}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '18px', color: 'rgba(116,21,21,0.3)', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>
        — {currentPage + 1} —
      </div>
    </div>
  );

  // ---- Render layout variant ----
  function renderPageContent() {
    const illustWrap = (
      <div className="illus-wrap" style={{ width: 'calc(100% - 28px)', marginLeft: '28px', aspectRatio: '4/3' }}>
        {illustrationEl}
        <CornerOrnaments />
      </div>
    );

    if (layout === 'bottom') {
      // Text first, image below
      return (
        <>
          {textContentEl}
          {illustWrap}
          <div style={{ height: '16px' }} />
        </>
      );
    }

    // 'top' — image above text (default)
    return (
      <>
        {illustWrap}
        {textContentEl}
      </>
    );
  }

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* Print-only layout: all pages rendered for printing */}
      <div className="print-only">
        <div className="print-page">
          <h1 className="print-title">{story.title}</h1>
          {pages[0]?.image_url && (
            <img src={pages[0].image_url} alt="Cover" className="print-image" />
          )}
        </div>
        {pages.map((p, i) => (
          <div key={p.page_number} className="print-page">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loadingPages.size > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,200,100,0.7)', fontFamily: 'Georgia, serif' }}>
                🎨 {loadingPages.size} painting…
              </span>
            )}
            <button onClick={toggleFavourite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex' }}>
              <Heart size={19} color="#c4784a" fill={favourite ? '#c4784a' : 'none'} />
            </button>
          </div>
        </div>

        {/* Book */}
        <div
          key={animKey}
          className={`book-page ${direction === 'forward' ? 'page-forward' : 'page-back'}`}
          style={{ width: '100%', maxWidth: '640px', margin: '24px 16px 0', flex: 1 }}
        >
          <div className="page-border" />
          {renderPageContent()}
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
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: '2px solid rgba(255,255,255,0.25)',
              borderRadius: '12px', color: 'rgba(255,255,255,0.85)',
              padding: '0.75rem 1.25rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 0 ? 0.25 : 1, fontSize: '1rem', fontWeight: '600',
              minWidth: '90px', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} /> Back
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {pages.map((p, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                style={{
                  width: i === currentPage ? '22px' : '7px',
                  height: '7px', borderRadius: '4px',
                  background: i === currentPage ? '#c4784a' : (p.image_url ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'),
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s', padding: 0,
                }}
                title={p.image_url ? `Page ${i + 1}` : `Page ${i + 1} — painting...`}
              />
            ))}
          </div>

          {isLastPage ? (
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#c4784a', border: 'none', borderRadius: '12px',
                color: 'white', padding: '0.75rem 1.25rem',
                cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
                minWidth: '90px', justifyContent: 'center',
              }}
            >
              <Printer size={18} /> Print
            </button>
          ) : (
            <button
              onClick={() => goToPage(currentPage + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#741515', border: 'none', borderRadius: '12px',
                color: 'white', padding: '0.75rem 1.25rem',
                cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
                minWidth: '90px', justifyContent: 'center',
              }}
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
