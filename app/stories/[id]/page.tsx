'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
  @keyframes paintDot {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
  .page-forward { animation: pageForward 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .page-back    { animation: pageBack 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .paint-dot-1 { animation: paintDot 1.4s ease infinite 0s; }
  .paint-dot-2 { animation: paintDot 1.4s ease infinite 0.2s; }
  .paint-dot-3 { animation: paintDot 1.4s ease infinite 0.4s; }

  .book-page {
    background: #FFFEF9;
    box-shadow:
      0 0 0 1px rgba(255,107,53,0.06),
      0 4px 12px rgba(0,0,0,0.15),
      0 16px 48px rgba(0,0,0,0.25),
      0 32px 80px rgba(0,0,0,0.2);
    border-radius: 4px 12px 12px 4px;
    position: relative;
    overflow: hidden;
  }
  .book-page::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 28px;
    background: linear-gradient(to right, #E8DDD0, #FFF0E6);
    border-right: 1px solid rgba(0,0,0,0.06);
    z-index: 1;
  }
  .book-page::after {
    content: '';
    position: absolute;
    left: 12px; top: 0; bottom: 0;
    width: 1px;
    background: rgba(0,0,0,0.04);
    z-index: 1;
  }
  .story-text {
    font-family: 'Lora', Fredoka, cursive;
    font-size: 1.05rem;
    line-height: 1.9;
    color: #0D183D;
    letter-spacing: 0.01em;
  }
  .story-text p { margin-bottom: 1.2em; }
  .page-border {
    position: absolute;
    inset: 36px 16px 16px 36px;
    border: 1.5px solid rgba(13,24,61,0.08);
    border-radius: 4px;
    pointer-events: none;
    z-index: 0;
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
    .print-page { page-break-after: always; break-after: page; width: 100%; padding: 0; margin: 0; }
    .print-page:last-child { page-break-after: avoid; }
    .print-image { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
    .print-text { padding: 24px 32px; font-family: 'Lora', Fredoka, cursive; font-size: 14pt; line-height: 1.8; color: #000; }
    .print-title { font-family: 'Lora', Fredoka, cursive; font-size: 22pt; text-align: center; margin-bottom: 12pt; }
    .print-moral { border-left: 3px solid #FF6B35; padding-left: 16px; font-style: italic; margin-top: 24pt; font-size: 12pt; }
    .print-page-num { text-align: center; font-size: 10pt; color: #666; margin-top: 16pt; }
    .book-page, .book-page::before, .book-page::after { box-shadow: none !important; }
  }
  @media screen { .print-only { display: none !important; } }
`;

function IllustrationPlaceholder({ generating }: { generating: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FFFEF9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {generating ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #FFD4B8', borderTop: '3px solid #FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.8rem', color: '#FF6B35', fontWeight: '600' }}>Painting your illustration...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <svg width="48" height="38" viewBox="0 0 48 38" fill="none" opacity="0.2">
          <path d="M24 7C18 3 7 3 2 5v26c5-2 16-2 22 2 6-4 17-4 22-2V5C44 3 30 3 24 7z" stroke="#FF6B35" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,107,53,0.1)"/>
          <line x1="24" y1="7" x2="24" y2="33" stroke="#FF6B35" strokeWidth="1.5"/>
        </svg>
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
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,107,53,0.2), transparent)' }} />
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,107,53,0.5)' }}>&#10022;</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, rgba(255,107,53,0.2), transparent)' }} />
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
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const imageGenStarted = useRef(false);
  const feedbackShown = useRef(false);
  const [locked, setLocked] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [freeStoriesRemaining, setFreeStoriesRemaining] = useState<number>(1);
  const supabase = createClient();

  // Feedback eligibility — called when reader reaches the last page
  function shouldShowFeedback(status: string | null, freeLeft: number): boolean {
    // Never show again once submitted
    if (localStorage.getItem('feedback_submitted') === 'true') return false;

    // Twice-a-week cadence: don't show again within 3.5 days of last show
    const lastShown = localStorage.getItem('last_feedback_shown_at');
    const halfWeekMs = 3.5 * 24 * 60 * 60 * 1000;
    if (lastShown && Date.now() - new Date(lastShown).getTime() < halfWeekMs) return false;

    if (status === 'subscribed') {
      // Premium: show after 7 days from when subscription was first detected
      const subFirst = localStorage.getItem('subscription_first_seen');
      if (!subFirst) return false;
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - new Date(subFirst).getTime() >= oneWeekMs;
    } else {
      // Free user: show when all 3 free stories have been used
      return freeLeft === 0;
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    async function fetchStory() {
      const { data } = await supabase
        .from('stories')
        .select('*, children(name, age)')
        .eq('id', id)
        .single();

      if (data) {
        // Check subscription access — cancelled users lose library access
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminRow } = await supabase
            .from('admin_emails').select('email').eq('email', user.email ?? '').single();
          if (!adminRow) {
            const { data: sub } = await supabase
              .from('user_subscriptions').select('status, free_stories_remaining').eq('user_id', user.id).single();
            const isActive = sub?.status === 'subscribed';
            // Only lock cancelled (formerly-subscribed) users — free users can always view their stories
            if (sub?.status === 'cancelled') { setLocked(true); setLoading(false); return; }
            // Track subscription state for feedback eligibility
            setSubStatus(sub?.status ?? null);
            setFreeStoriesRemaining(sub?.free_stories_remaining ?? 1);
            // Record when we first see a premium subscription (for 7-day trigger)
            if (sub?.status === 'subscribed' && !localStorage.getItem('subscription_first_seen')) {
              localStorage.setItem('subscription_first_seen', new Date().toISOString());
            }
          }
        }
        setStory(data);
        setFavourite(data.is_favourite);
        const pages: Page[] = data.pages || [];
        const pagesNeedingImages = pages.filter((p) => p.image_prompt && !p.image_url);
        if (pagesNeedingImages.length > 0 && !imageGenStarted.curren4) {
          imageGenStarted.current = true;
          setLoadingPages(new Set(pagesNeedingImages.map((p) => p.page_number)));
          (async () => {
            for (const page of pagesNeedingImages) {
              // Helper: start (or restart) a Replicate prediction for this page
              const startPrediction = async (): Promise<string | null> => {
                try {
                  const res = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ story_id: data.id, page_number: page.page_number }),
                  });
                  if (res.ok) return (await res.json()).poll_url ?? null;
                  if (res.status === 429) await new Promise((r) => setTimeout(r, 10000));
                } catch {}
                return null;
              };

              // Use existing poll_url if present; otherwise kick off a new prediction
              let pollUrl: string | null = page.poll_url ?? null;
              if (!pollUrl) pollUrl = await startPrediction();
              if (!pollUrl) continue;

              let succeeded = false;
              // Allow up to 2 attempts (handles stale/failed predictions from prior sessions)
              for (let attempt = 0; attempt < 2 && !succeeded; attempt++) {
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
                        return { ...prev, pages: prev.pages.map((p) => p.page_number === page.page_number ? { ...p, image_url: result.image_url } : p) };
                      });
                      setLoadingPages((prev) => { const next = new Set(prev); next.delete(page.page_number); return next; });
                      succeeded = true;
                      break;
                    }
                    if (result.status === 'failed') {
                      // Stale or failed prediction — start a fresh one on next attempt
                      pollUrl = await startPrediction();
                      break;
                    }
                  } catch {}
                }
              }
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
    if (story && index === story.pages.length - 1 && !feedbackShown.current) {
      if (shouldShowFeedback(subStatus, freeStoriesRemaining)) {
        feedbackShown.current = true;
        localStorage.setItem('last_feedback_shown_at', new Date().toISOString());
        setTimeout(() => setShowFeedback(true), 15000);
      }
    }
  };

  if (locked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D183D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem' }}>📚</div>
        <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.75rem', color: 'white', marginBottom: '8px' }}>Your library is waiting</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', maxWidth: '360px', lineHeight: 1.7 }}>
          Your stories are saved and ready to read. Reactivate your subscription to open your library again.
        </p>
        <Link href="/dashboard" style={{ background: '#FF6B35', color: 'white', padding: '0.9rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem' }}>
          Reactivate subscription
        </Link>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D183D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Fredoka, cursive' }}>Opening your book...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFF4E6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#5E6A7A' }}>Story not found.</p>
        <Link href="/dashboard" className="btn-brand">Back to dashboard</Link>
      </div>
    );
  }

  const pages: Page[] = story.pages?.length > 0
    ? story.pages
    : story.content.split('\n\n').filter(Boolean).map((para, i) => ({ page_number: i + 1, content: para, image_prompt: '', image_url: null }));

  const totalPages = pages.length;
  const page = pages[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  // Split on double-newline (structured stories). If content has no \n\n,
  // fall back to splitting on sentence boundaries (2 sentences per paragraph)
  // so beginner stories don't display as a single wall of text.
  const rawParas = page.content.split('\n\n').filter(Boolean);
  const paragraphs = rawParas.length > 1
    ? rawParas
    : (page.content.match(/[^.!?]+[.!?]+["'”]?\s*/g) || [page.content])
        .reduce<string[]>((acc, sentence, i) => {
          if (i % 2 === 0) acc.push(sentence.trim());
          else acc[acc.length - 1] += ' ' + sentence.trim();
          return acc;
        }, [])
        .filter(Boolean);
  const isThisPageGenerating = loadingPages.has(page.page_number);

  const illustrationEl = page.image_url ? (
    <img
      src={page.image_url}
      alt={`Page ${currentPage + 1} illustration`}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', background: '#FFFEF9' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  ) : (
    <IllustrationPlaceholder generating={isThisPageGenerating} />
  );

  function TextContent({ mobilePadding }: { mobilePadding: boolean }) {
    return (
      <div style={{ padding: mobilePadding ? '18px 20px 28px 48px' : '28px 28px 32px 24px', position: 'relative' }}>
        <DecorativeRule />
        {currentPage === 0 && (
          <h2 style={{ fontFamily: 'Lora, Fredoka, cursive', fontSize: '1.45rem', color: '#0D183D', marginBottom: '18px', lineHeight: 1.3, fontWeight: 600 }}>
            {story.title}
          </h2>
        )}
        <div className="story-text">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
        </div>
        {isLastPage && story.moral && (
          <div style={{ borderLeft: '3px solid #FF6B35', paddingLeft: '16px', marginTop: '18px', color: '#5E6A7A', fontStyle: 'italic', fontFamily: 'Lora, Fredoka, cursive', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {story.moral}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '18px', color: 'rgba(255,107,53,0.45)', fontSize: '0.78rem', fontFamily: 'Fredoka, cursive' }}>
          · {currentPage + 1} ·
        </div>
      </div>
    );
  }

  function renderPageContent() {
    if (isDesktop) {
      // DESKTOP: image fills left column (cover crop), text right
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          flex: 1,
          minHeight: '460px',
        }}>
          {/* Image column */}
          <div style={{
            flex: '0 0 44%',
            marginLeft: '28px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
              minHeight: '380px',
              background: '#FFFEF9',
            }}>
              {illustrationEl}
              <CornerOrnaments />
            </div>
          </div>
          {/* Text column */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            borderLeft: '1px solid rgba(13,24,61,0.08)',
            position: 'relative',
            zIndex: 2,
          }}>
            <TextContent mobilePadding={false} />
          </div>
        </div>
      );
    }

    // MOBILE: image top (fixed 4:3), scrollable text below
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          marginLeft: '28px',
          width: 'calc(100% - 28px)',
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}>
          {illustrationEl}
          <CornerOrnaments />
        </div>
        <div style={{
          overflowY: 'auto',
          maxHeight: 'calc(100svh - 75vw - 175px)',
          minHeight: '150px',
          position: 'relative',
          zIndex: 2,
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          <TextContent mobilePadding={true} />
        </div>
      </div>
    );
  }

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      <div className="print-only">
        <div className="print-page">
          <h1 className="print-title">{story.title}</h1>
          {pages[0]?.image_url && <img src={pages[0].image_url} alt="Cover" className="print-image" />}
        </div>
        {pages.map((p, i) => (
          <div key={p.page_number} className="print-page">
            {p.image_url && <img src={p.image_url} alt={`Page ${i + 1}`} className="print-image" />}
            <div className="print-text">
              {p.content.split('\n\n').filter(Boolean).map((para, j) => <p key={j}>{para}</p>)}
              {i === totalPages - 1 && story.moral && <div className="print-moral">{story.moral}</div>}
            </div>
            <div className="print-page-num">{i + 1}</div>
          </div>
        ))}
      </div>

      <style>{bookStyles}</style>

      {/* Page background — warm amber glow behind the book, deep midnight sky */}
      <div className="no-print" style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 1100px 550px at 50% 42%, rgba(255,107,53,0.08) 0%, transparent 70%), linear-gradient(160deg, #08101F 0%, #0D183D 50%, #060D24 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 80px',
      }}>

        <div style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(8,16,31,0.96)', backdropFilter: 'blur(8px)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={15} /> Library
          </Link>
          <span style={{ fontFamily: 'Fredoka, cursive', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center', flex: 1, padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {story.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loadingPages.size > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,183,3,0.85)', fontFamily: 'Fredoka, cursive' }}>
                painting&#8230;
              </span>
            )}
            <button onClick={toggleFavourite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex' }}>
              <Heart size={19} color="#FF6B35" fill={favourite ? '#FF6B35' : 'none'} />
            </button>
          </div>
        </div>

        {/* Book — wider on desktop, fills available height */}
        <div
          key={animKey}
          className={`book-page ${direction === 'forward' ? 'page-forward' : 'page-back'}`}
          style={{
            width: '100%',
            maxWidth: isDesktop ? '1060px' : '640px',
            margin: isDesktop ? '28px 24px 0' : '20px 16px 0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: isDesktop ? 'calc(100svh - 160px)' : undefined,
          }}
        >
          <div className="page-border" />
          {renderPageContent()}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(8,16,31,0.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '12px', color: 'rgba(255,255,255,0.85)', padding: '0.75rem 1.25rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.25 : 1, fontSize: '1rem', fontWeight: '600', minWidth: '90px', justifyContent: 'center' }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {pages.map((p, i) => (
              <button key={i} onClick={() => goToPage(i)} style={{ width: i === currentPage ? '22px' : '7px', height: '7px', borderRadius: '4px', background: i === currentPage ? '#FF6B35' : (p.image_url ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'), border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0 }} />
            ))}
          </div>
          {!isLastPage && (
            <button
              onClick={() => goToPage(currentPage + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FF6B35', border: 'none', borderRadius: '12px', color: 'white', padding: '0.75rem 1.25rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, minWidth: '90px', justifyContent: 'center' }}
            >
              Next <ChevronRight size={20} />
            </button>
          )}
          {isLastPage && (
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FF6B35', border: 'none', borderRadius: '12px', color: 'white', padding: '0.75rem 1.25rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, minWidth: '90px', justifyContent: 'center' }}>
              Library
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
