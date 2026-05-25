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
    from { opacity: 0; transform: translateX(28px) scale(0.988); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes pageBack {
    from { opacity: 0; transform: translateX(-28px) scale(0.988); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .page-forward { animation: pageForward 0.38s cubic-bezier(0.25,0.46,0.45,0.94); }
  .page-back    { animation: pageBack 0.38s cubic-bezier(0.25,0.46,0.45,0.94); }

  .book-page {
    background: #FFF8EC;
    box-shadow:
      0 0 0 1px rgba(40,15,5,0.25),
      2px 0 8px rgba(0,0,0,0.25),
      0 4px 20px rgba(0,0,0,0.3),
      0 20px 60px rgba(0,0,0,0.55),
      0 48px 100px rgba(0,0,0,0.35);
    border-radius: 2px 8px 8px 2px;
    position: relative;
    overflow: hidden;
  }

  /* Leather spine */
  .book-page::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 28px;
    background: linear-gradient(to right,
      #090401 0%,
      #2C1308 20%,
      #4E2412 43%,
      #5A2C16 50%,
      #4E2412 57%,
      #2C1308 80%,
      #090401 100%
    );
    border-right: 1px solid rgba(0,0,0,0.55);
    z-index: 3;
  }

  /* Spine highlight */
  .book-page::after {
    content: '';
    position: absolute;
    left: 8px; top: 6%; bottom: 6%;
    width: 1px;
    background: linear-gradient(to bottom,
      transparent 0%,
      rgba(255,255,255,0.06) 25%,
      rgba(255,255,255,0.14) 50%,
      rgba(255,255,255,0.06) 75%,
      transparent 100%
    );
    z-index: 4;
  }

  .story-text {
    font-family: 'Lora', Georgia, 'Times New Roman', serif;
    font-size: 1.12rem;
    line-height: 1.98;
    color: #1A0E06;
    letter-spacing: 0.01em;
  }
  .story-text p { margin-bottom: 1.25em; }
  .story-text p:last-child { margin-bottom: 0; }

  .page-border {
    position: absolute;
    inset: 36px 12px 12px 36px;
    border: 1px solid rgba(120,80,40,0.08);
    border-radius: 2px;
    pointer-events: none;
    z-index: 0;
  }

  .corner-ornament {
    position: absolute;
    width: 12px; height: 12px;
    border: 1px solid rgba(200,155,85,0.35);
    border-radius: 1px;
    pointer-events: none;
  }

  /* In-book navigation */
  .book-nav-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    font-family: 'Lora', Georgia, serif;
    font-size: 0.82rem;
    font-style: italic;
    color: rgba(90,52,18,0.6);
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
    letter-spacing: 0.02em;
    min-width: 88px;
    justify-content: center;
  }
  .book-nav-btn:hover:not(:disabled) {
    color: rgba(55,28,6,0.9);
    background: rgba(120,80,40,0.07);
  }
  .book-nav-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  /* ---- Print styles ---- */
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .print-page { page-break-after: always; break-after: page; width: 100%; padding: 0; margin: 0; }
    .print-page:last-child { page-break-after: avoid; }
    .print-image { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
    .print-text { padding: 24px 32px; font-family: 'Lora', serif; font-size: 14pt; line-height: 1.8; color: #000; }
    .print-title { font-family: 'Lora', serif; font-size: 22pt; text-align: center; margin-bottom: 12pt; font-style: italic; }
    .print-moral { border-left: 3px solid #8B5E3C; padding-left: 16px; font-style: italic; margin-top: 24pt; font-size: 12pt; }
    .print-page-num { text-align: center; font-size: 10pt; color: #666; margin-top: 16pt; }
    .book-page, .book-page::before, .book-page::after { box-shadow: none !important; }
  }
  @media screen { .print-only { display: none !important; } }
`;

function IllustrationPlaceholder({ generating }: { generating: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F5EDD8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {generating ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', border: '2px solid rgba(160,100,40,0.2)', borderTop: '2px solid rgba(160,100,40,0.7)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.78rem', color: 'rgba(120,70,20,0.65)', fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', letterSpacing: '0.02em' }}>Painting your illustration...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <svg width="44" height="34" viewBox="0 0 48 38" fill="none" opacity="0.18">
          <path d="M24 7C18 3 7 3 2 5v26c5-2 16-2 22 2 6-4 17-4 22-2V5C44 3 30 3 24 7z" stroke="rgba(120,70,20,0.8)" strokeWidth="2" strokeLinejoin="round" fill="rgba(120,70,20,0.1)"/>
          <line x1="24" y1="7" x2="24" y2="33" stroke="rgba(120,70,20,0.8)" strokeWidth="1.5"/>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(140,90,35,0.3), transparent)' }} />
      <span style={{ fontSize: '0.6rem', color: 'rgba(140,90,35,0.4)', lineHeight: 1 }}>&#10022;</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, rgba(140,90,35,0.3), transparent)' }} />
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
  const imagePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackShown = useRef(false);
  const [locked, setLocked] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [freeStoriesRemaining, setFreeStoriesRemaining] = useState<number>(1);
  const supabase = createClient();

  function shouldShowFeedback(status: string | null, freeLeft: number): boolean {
    if (localStorage.getItem('feedback_submitted') === 'true') return false;
    const lastShown = localStorage.getItem('last_feedback_shown_at');
    const halfWeekMs = 3.5 * 24 * 60 * 60 * 1000;
    if (lastShown && Date.now() - new Date(lastShown).getTime() < halfWeekMs) return false;
    if (status === 'subscribed') {
      const subFirst = localStorage.getItem('subscription_first_seen');
      if (!subFirst) return false;
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - new Date(subFirst).getTime() >= oneWeekMs;
    } else {
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminRow } = await supabase
            .from('admin_emails').select('email').eq('email', user.email ?? '').single();
          if (!adminRow) {
            const { data: sub } = await supabase
              .from('user_subscriptions').select('status, free_stories_remaining').eq('user_id', user.id).single();
            if (sub?.status === 'cancelled') { setLocked(true); setLoading(false); return; }
            setSubStatus(sub?.status ?? null);
            setFreeStoriesRemaining(sub?.free_stories_remaining ?? 1);
            if (sub?.status === 'subscribed' && !localStorage.getItem('subscription_first_seen')) {
              localStorage.setItem('subscription_first_seen', new Date().toISOString());
            }
          }
        }
        setStory(data);
        setFavourite(data.is_favourite);
        const pages: Page[] = data.pages || [];
        const pagesNeedingImages = pages.filter((p) => p.image_prompt && !p.image_url);
        if (pagesNeedingImages.length > 0) {
          setLoadingPages(new Set(pagesNeedingImages.map((p) => p.page_number)));

          // Kick off server-side generation — the edge function runs on Supabase
          // infrastructure and continues even if the user closes the browser.
          fetch('/api/trigger-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ story_id: data.id }),
          }).catch(() => {});

          // Poll Supabase every 5s for image_url updates.
          // As each image is saved by the edge function, it appears here automatically.
          if (imagePollRef.current) clearInterval(imagePollRef.current);
          imagePollRef.current = setInterval(async () => {
            const { data: fresh } = await supabase
              .from('stories')
              .select('pages')
              .eq('id', id)
              .single();
            if (fresh?.pages) {
              setStory((prev) => prev ? { ...prev, pages: fresh.pages } : prev);
              const stillMissing = fresh.pages.filter((p: Page) => p.image_prompt && !p.image_url);
              setLoadingPages(new Set(stillMissing.map((p: Page) => p.page_number)));
              if (stillMissing.length === 0) {
                clearInterval(imagePollRef.current!);
                imagePollRef.current = null;
              }
            }
          }, 5000);
        }
      }
      setLoading(false);
    }
    fetchStory();
    return () => {
      if (imagePollRef.current) clearInterval(imagePollRef.current);
    };
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0E0704 0%, #160B05 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>📚</div>
        <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.6rem', color: 'rgba(240,210,160,0.9)', marginBottom: '8px', fontStyle: 'italic' }}>Your library is waiting</h2>
        <p style={{ color: 'rgba(200,170,120,0.55)', fontSize: '0.95rem', maxWidth: '340px', lineHeight: 1.75, fontFamily: 'Lora, Georgia, serif' }}>
          Your stories are saved and ready to read. Reactivate your subscription to open your library again.
        </p>
        <Link href="/dashboard" style={{ background: 'rgba(160,100,40,0.9)', color: 'rgba(255,240,210,0.95)', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Lora, Georgia, serif' }}>
          Reactivate subscription
        </Link>
        <Link href="/dashboard" style={{ color: 'rgba(200,170,120,0.35)', fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic' }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0E0704 0%, #160B05 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(200,165,110,0.5)', fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontSize: '0.95rem', letterSpacing: '0.03em' }}>Opening your book...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0E0704 0%, #160B05 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: 'rgba(200,165,110,0.5)', fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic' }}>Story not found.</p>
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

  const rawParas = page.content.split('\n\n').filter(Boolean);
  const paragraphs = rawParas.length > 1
    ? rawParas
    : (page.content.match(/[^.!?]+[.!?]+["'"]?\s*/g) || [page.content])
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
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', background: '#F5EDD8' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  ) : (
    <IllustrationPlaceholder generating={isThisPageGenerating} />
  );

  function TextContent({ mobilePadding }: { mobilePadding: boolean }) {
    return (
      <div style={{ padding: mobilePadding ? '22px 22px 20px 48px' : '30px 32px 20px 28px', position: 'relative', flex: 1 }}>
        <DecorativeRule />
        {currentPage === 0 && (
          <h2 style={{
            fontFamily: 'Lora, Georgia, serif',
            fontSize: isDesktop ? '1.5rem' : '1.3rem',
            color: '#1A0E06',
            marginBottom: '22px',
            lineHeight: 1.4,
            fontWeight: 600,
            fontStyle: 'italic',
          }}>
            {story.title}
          </h2>
        )}
        <div className="story-text">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
        </div>
        {isLastPage && story.moral && (
          <div style={{
            borderLeft: '2px solid rgba(140,90,35,0.3)',
            paddingLeft: '14px',
            marginTop: '22px',
            color: 'rgba(90,55,18,0.75)',
            fontStyle: 'italic',
            fontFamily: 'Lora, Georgia, serif',
            fontSize: '0.9rem',
            lineHeight: 1.8,
          }}>
            {story.moral}
          </div>
        )}
      </div>
    );
  }

  function BookNav() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktop ? '10px 28px 18px 44px' : '10px 18px 18px 36px',
        borderTop: '1px solid rgba(120,80,40,0.1)',
        flexShrink: 0,
      }}>
        <button
          className="book-nav-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          style={{ justifyContent: 'flex-start' }}
        >
          <ChevronLeft size={15} /> Previous
        </button>

        {/* Page dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              style={{
                width: i === currentPage ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentPage
                  ? 'rgba(140,80,20,0.55)'
                  : (p.image_url ? 'rgba(120,80,40,0.28)' : 'rgba(120,80,40,0.14)'),
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s',
                padding: 0,
              }}
            />
          ))}
        </div>

        {!isLastPage ? (
          <button
            className="book-nav-btn"
            onClick={() => goToPage(currentPage + 1)}
            style={{ justifyContent: 'flex-end' }}
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Lora, Georgia, serif',
            fontSize: '0.82rem',
            fontStyle: 'italic',
            color: 'rgba(90,52,18,0.6)',
            textDecoration: 'none',
            padding: '6px 10px',
            minWidth: '88px',
            justifyContent: 'flex-end',
          }}>
            Library <ChevronRight size={15} />
          </Link>
        )}
      </div>
    );
  }

  function renderPageContent() {
    if (isDesktop) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          flex: 1,
          minHeight: '440px',
        }}>
          {/* Illustration — left page */}
          <div style={{
            flex: '0 0 45%',
            marginLeft: '28px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
              minHeight: '360px',
              background: '#F5EDD8',
            }}>
              {illustrationEl}
              <CornerOrnaments />
            </div>
          </div>

          {/* Text — right page */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            borderLeft: '1px solid rgba(120,80,40,0.1)',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <TextContent mobilePadding={false} />
          </div>
        </div>
      );
    }

    // Mobile: image top, text below
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
          maxHeight: 'calc(100svh - 75vw - 155px)',
          minHeight: '140px',
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

      {/* Print-only layout */}
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

      {/* Reading room */}
      <div className="no-print" style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 700px 380px at 50% 28%, rgba(160,90,20,0.07) 0%, transparent 60%), linear-gradient(180deg, #0E0704 0%, #160B05 55%, #0C0603 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0',
      }}>

        {/* Minimal top controls */}
        <div style={{
          width: '100%',
          maxWidth: isDesktop ? '1040px' : '640px',
          padding: isDesktop ? '16px 4px 10px' : '12px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: 'rgba(210,170,100,0.5)',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontFamily: 'Lora, Georgia, serif',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
          }}>
            <ArrowLeft size={12} /> Library
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loadingPages.size > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'rgba(200,155,60,0.6)', fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic' }}>
                painting&#8230;
              </span>
            )}
            <button onClick={toggleFavourite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <Heart size={16} color="rgba(180,100,40,0.65)" fill={favourite ? 'rgba(180,100,40,0.65)' : 'none'} />
            </button>
          </div>
        </div>

        {/* The book */}
        <div
          key={animKey}
          className={`book-page ${direction === 'forward' ? 'page-forward' : 'page-back'}`}
          style={{
            width: '100%',
            maxWidth: isDesktop ? '1040px' : '640px',
            margin: isDesktop ? '0 24px' : '0 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: isDesktop ? 'calc(100svh - 90px)' : undefined,
          }}
        >
          <div className="page-border" />
          {renderPageContent()}
          <BookNav />
        </div>

        <div style={{ height: isDesktop ? '32px' : '20px', flexShrink: 0 }} />
      </div>
    </>
  );
}
