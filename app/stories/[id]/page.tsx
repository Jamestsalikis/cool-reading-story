'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

  @keyframes flipFwd {
    0%   { transform: perspective(1800px) rotateY(0deg); }
    100% { transform: perspective(1800px) rotateY(-178deg); }
  }
  @keyframes flipBack {
    0%   { transform: perspective(1800px) rotateY(0deg); }
    100% { transform: perspective(1800px) rotateY(178deg); }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.95; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes paintDot {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
  .page-flip {
    position: absolute; inset: 0; z-index: 6; pointer-events: none;
    background: #F4EDDD; overflow: hidden;
    border-radius: 4px 12px 12px 4px;
    box-shadow: 0 0 34px rgba(0,0,0,0.30);
    backface-visibility: hidden;
  }
  .page-flip::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(105deg, rgba(255,255,255,0) 45%, rgba(60,30,10,0.12) 100%);
  }
  .flip-fwd  { transform-origin: left center;  animation: flipFwd  0.6s cubic-bezier(0.42,0.04,0.22,1) forwards; }
  .flip-back { transform-origin: right center; animation: flipBack 0.6s cubic-bezier(0.42,0.04,0.22,1) forwards; }
  @media (prefers-reduced-motion: reduce) {
    .page-flip { display: none; }
  }
  .shimmer { animation: shimmer 1.8s ease infinite; }
  .paint-dot-1 { animation: paintDot 1.4s ease infinite 0s; }
  .paint-dot-2 { animation: paintDot 1.4s ease infinite 0.2s; }
  .paint-dot-3 { animation: paintDot 1.4s ease infinite 0.4s; }

  .book-page {
    background-color: #F4EDDD;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.05'/%3E%3C/svg%3E"),
      linear-gradient(175deg, #F8F2E4 0%, #EFE6D0 100%);
    box-shadow:
      0 5px 0 -1px #EFE7D2, 0 7px 3px -2px rgba(0,0,0,0.06),
      0 10px 0 -2px #E9DFC8, 0 12px 3px -3px rgba(0,0,0,0.06),
      0 15px 0 -4px #E3D9C0, 0 17px 4px -4px rgba(0,0,0,0.07),
      0 -5px 0 -1px #EFE7D2,
      0 -10px 0 -2px #E9DFC8,
      0 -15px 0 -4px #E3D9C0,
      0 24px 46px rgba(0,0,0,0.36),
      inset 0 0 0 1px rgba(0,0,0,0.05);
    border-radius: 6px 12px 12px 6px;
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
  .story-text p:first-of-type::first-letter {
    font-size: 3.1em; line-height: 0.72; float: left;
    font-family: 'Lora', Georgia, serif; font-weight: 700;
    color: #D87E34; padding: 6px 10px 0 0;
  }

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
    background: #F5F0E8;
  }
  .illus-wrap img {
    width: 100%; height: 100%; object-fit: contain; display: block;
  }
  .illus-wrap::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0;
    height: 13%; pointer-events: none; z-index: 2;
    background: linear-gradient(to bottom, rgba(244,237,221,0), #F4EDDD);
  }
  .corner-ornament {
    position: absolute;
    width: 18px; height: 18px;
    border: 1.5px solid rgba(255,255,255,0.55);
    border-radius: 2px;
    pointer-events: none;
  }

  /* ===== RESPONSIVE SIDE-BY-SIDE LAYOUT ===== */

  /* Shared layout shell */
  .book-page-layout {
    display: flex;
  }

  /* Illustration column */
  .book-illus-col {
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
  }

  /* Text column */
  .book-text-col {
    position: relative;
    z-index: 2;
  }

  /* Text inner padding — default is mobile (includes 28px spine offset) */
  .book-text-inner {
    padding: 22px 20px 28px 48px;
  }

  /* ---- MOBILE (<768px): image top, scrollable text below ---- */
  @media (max-width: 767px) {
    .book-page-layout {
      flex-direction: column;
    }
    .book-illus-col {
      margin-left: 28px;
      width: calc(100% - 28px);
      aspect-ratio: 1 / 1;
    }
    .book-text-col {
      overflow-y: auto;
      /* Image height ≈ 75vw (4:3). Top bar ≈52px, nav ≈70px, margins ≈50px */
      max-height: calc(100svh - 90vw - 150px);
      min-height: 150px;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    .book-text-inner {
      padding: 18px 20px 28px 48px;
    }
  }

  /* ---- TABLET + DESKTOP (≥768px): side by side ---- */
  @media (min-width: 768px) {
    .book-page-layout {
      flex-direction: row;
      align-items: stretch;
    }
    /* Image column: flex column so illus-wrap can fill full height */
    .book-illus-col {
      flex: 0 0 45%;
      margin-left: 28px;
      display: flex;
      flex-direction: column;
    }
    /* Image fills the full column height — no gap at bottom */
    .book-illus-col .illus-wrap {
      flex: 1;
      width: 100%;
      min-height: 380px;
    }
    /* Subtle gutter between image and text — like a page edge */
    .book-text-col {
      flex: 1;
      overflow-y: auto;
      border-left: 1px solid rgba(116,21,21,0.10);
    }
    /* No spine offset — text sits to the right of the image */
    .book-text-inner {
      padding: 28px 28px 32px 24px;
    }
    /* Wider book for side-by-side */
    .book-page-wide {
      max-width: 860px !important;
    }
  }

  /* ---- LANDSCAPE PHONES (short viewport): force a fit-to-screen open book, override stacked-mobile rules ---- */
  @media (orientation: landscape) and (max-height: 600px) {
    .no-print { padding-bottom: 54px !important; }
    .book-page {
      flex: none !important;
      margin: 8px 16px 0 !important;
      max-width: 1000px !important;
      height: calc(100svh - 108px);
    }
    .book-page-layout {
      flex-direction: row !important;
      align-items: stretch !important;
      height: 100%;
    }
    .book-illus-col {
      flex: 0 0 42% !important;
      width: auto !important;
      margin-left: 28px !important;
      aspect-ratio: auto !important;
      display: flex !important;
      flex-direction: column;
    }
    .book-illus-col .illus-wrap {
      flex: 1 !important;
      width: 100% !important;
      min-height: 0 !important;
      height: auto !important;
    }
    .book-text-col {
      flex: 1 !important;
      overflow-y: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      border-left: 1px solid rgba(116,21,21,0.10);
    }
    .book-text-inner { padding: 16px 20px 18px 20px !important; }
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

function IllustrationPlaceholder({ generating }: { generating: boolean; theme?: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#F5F0E8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
    }}>
      {generating ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(116,21,21,0.15)', borderTopColor: 'rgba(116,21,21,0.6)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(116,21,21,0.4)', fontStyle: 'italic' }}>Painting…</span>
        </div>
      ) : (
        <svg width="48" height="38" viewBox="0 0 48 38" fill="none" opacity="0.2">
          <path d="M24 7C18 3 7 3 2 5v26c5-2 16-2 22 2 6-4 17-4 22-2V5C44 3 30 3 24 7z" stroke="#741515" strokeWidth="2" strokeLinejoin="round" fill="rgba(116,21,21,0.08)"/>
          <line x1="24" y1="7" x2="24" y2="33" stroke="#741515" strokeWidth="1.5"/>
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

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [flip, setFlip] = useState<{ dir: 'forward' | 'back'; img: string | null; key: number } | null>(null);
  // Set of page numbers whose images are still being generated server-side
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackShown = useRef(false);
  const supabase = createClient();
  const router = useRouter();
  const [userCtx, setUserCtx] = useState<{ status: string; stories_today: number; extra_books_today: number; isAdmin: boolean } | null>(null);
  const [continuing, setContinuing] = useState(false);
  const continueLock = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const continueAutoStarted = useRef(false);

  // Fetch story + poll DB for image updates (server-side edge fn generates them)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

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
        const pending = pages.filter((p) => p.image_prompt && !p.image_url);
        if (pending.length > 0) {
          setLoadingPages(new Set(pending.map((p) => p.page_number)));
          // Poll DB every 5s until all images are ready — edge fn writes them in background
          interval = setInterval(async () => {
            const { data: updated } = await supabase
              .from('stories')
              .select('pages')
              .eq('id', id)
              .single();
            if (updated?.pages) {
              const stillPending = updated.pages.filter((p: Page) => p.image_prompt && !p.image_url);
              setLoadingPages(new Set(stillPending.map((p: Page) => p.page_number)));
              setStory((prev) => prev ? { ...prev, pages: updated.pages } : prev);
              if (stillPending.length === 0 && interval) {
                clearInterval(interval);
                interval = null;
              }
            }
          }, 5000);
        }
      }
      setLoading(false);
    }
    fetchStory();
    return () => { if (interval) clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavourite = async () => {
    const newVal = !favourite;
    setFavourite(newVal);
    await supabase.from('stories').update({ is_favourite: newVal }).eq('id', id);
  };

  const goToPage = (index: number) => {
    if (index === currentPage) return;
    const dir = index > currentPage ? 'forward' : 'back';
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setFlip({ dir, img: story?.pages?.[currentPage]?.image_url ?? null, key: Date.now() });
    setTimeout(() => setFlip(null), 620);
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

  // Load the viewer's subscription/admin context for the end-of-book CTA
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: adminRow } = await supabase.from('admin_emails').select('email').eq('email', user.email ?? '').maybeSingle();
      const { data: subRow } = await supabase.from('user_subscriptions').select('status, stories_today, extra_books_today').eq('user_id', user.id).maybeSingle();
      setUserCtx({
        status: subRow?.status ?? 'free',
        stories_today: subRow?.stories_today ?? 0,
        extra_books_today: subRow?.extra_books_today ?? 0,
        isAdmin: !!adminRow,
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll a story until its text (pages) is written, so the loading overlay stays up
  const waitForText = async (storyId: string, timeoutMs = 90000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const { data } = await supabase.from('stories').select('pages').eq('id', storyId).single();
      if (data?.pages && Array.isArray(data.pages) && data.pages.length > 0) return true;
      await new Promise((r) => setTimeout(r, 2000));
    }
    return false;
  };

  // Generate the next chapter (sequel) from this story, then open it when ready
  const startSequel = async () => {
    if (continueLock.current) return;
    continueLock.current = true;
    setContinuing(true);
    try {
      const res = await fetch('/api/generate-sequel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: id }) });
      const data = await res.json();
      if (!res.ok) {
        // paywall / daily limit / other — send to dashboard where the options live
        if (res.status === 402 || res.status === 429) { router.push('/dashboard'); return; }
        setContinuing(false); continueLock.current = false; return;
      }
      const newId = data.story?.id;
      if (!newId) { setContinuing(false); continueLock.current = false; return; }
      await waitForText(newId);
      router.push(`/stories/${newId}`);
    } catch {
      setContinuing(false); continueLock.current = false;
    }
  };

  // Buy the next chapter for 99c, returning to this page to auto-start it
  const buyNextChapter = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'extra_book', continue_story_id: id, locale: typeof navigator !== 'undefined' ? navigator.language : 'en-AU' }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* ignore */ }
  };

  // After a 99c purchase we return to /stories/[id]?continue=1 — auto-start the sequel
  useEffect(() => {
    if (continueAutoStarted.current || !story) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('continue') === '1') {
      continueAutoStarted.current = true;
      window.history.replaceState({}, '', `/stories/${id}`);
      void startSequel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

  if (loading) {
    return (
      <>
        <style>{bookStyles}</style>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2C1810 0%, #1a0f08 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 100px' }}>

          {/* Top bar — functional even while loading */}
          <div style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(44,24,16,0.9)', backdropFilter: 'blur(8px)' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.875rem' }}>
              <ArrowLeft size={15} /> Library
            </Link>
            {/* shimmer title placeholder */}
            <div style={{ flex: 1, maxWidth: '260px', height: '14px', margin: '0 16px', borderRadius: '4px', background: 'rgba(255,255,255,0.10)', animation: 'shimmer 1.8s ease infinite' }} />
            <div style={{ width: '27px' }} />
          </div>

          {/* Book skeleton — same shape as the real page */}
          <div className="book-page book-page-wide" style={{ width: '100%', maxWidth: '640px', margin: '24px 16px 0', flex: 1 }}>
            <div className="book-page-layout">

              {/* Image column shimmer */}
              <div className="book-illus-col">
                <div className="illus-wrap" style={{ width: '100%', height: '100%', minHeight: '280px' }}>
                  <div style={{
                    width: '100%', height: '100%', minHeight: '280px',
                    background: 'linear-gradient(90deg, #EDE8DF 0%, #F5F0E8 40%, #EDE8DF 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s ease infinite',
                  }} />
                </div>
              </div>

              {/* Text column shimmer */}
              <div className="book-text-col">
                <div className="book-text-inner" style={{ position: 'relative' }}>
                  {/* Decorative rule placeholder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(116,21,21,0.10)' }} />
                    <span style={{ fontSize: '0.7rem', color: 'rgba(116,21,21,0.2)' }}>✦</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(116,21,21,0.10)' }} />
                  </div>
                  {/* Title line */}
                  <div style={{ height: '26px', width: '75%', borderRadius: '4px', background: 'rgba(44,26,14,0.10)', marginBottom: '20px', animation: 'shimmer 1.8s ease infinite' }} />
                  {/* Body text lines */}
                  {[100, 96, 88, 100, 94, 82, 100, 90, 76, 100, 88].map((w, i) => (
                    <div key={i} style={{ height: '14px', width: `${w}%`, borderRadius: '3px', background: 'rgba(44,26,14,0.07)', marginBottom: '13px', animation: `shimmer 1.8s ease ${(i * 0.07).toFixed(2)}s infinite` }} />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Page nav skeleton */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(44,24,16,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: i === 0 ? '22px' : '7px', height: '7px', borderRadius: '4px', background: i === 0 ? 'rgba(196,120,74,0.6)' : 'rgba(255,255,255,0.15)', transition: 'all 0.25s' }} />
            ))}
          </div>

        </div>
      </>
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
    : (story.content || '').split('\n\n').filter(Boolean).map((para, i) => ({
        page_number: i + 1,
        content: para,
        image_prompt: '',
        image_url: null,
      }));

  const totalPages = pages.length;
  const page = pages[currentPage] ?? pages[0];
  if (!page) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#6B5E4E' }}>This story is still being written. Please check back in a moment.</p>
        <a href="/dashboard" style={{ color: '#741515', textDecoration: 'underline', fontSize: '0.9rem' }}>Back to dashboard</a>
      </div>
    );
  }
  const isLastPage = currentPage === totalPages - 1;
  const paragraphs = (page.content || '').split('\n\n').filter(Boolean);
  const isThisPageGenerating = loadingPages.has(page.page_number);

  // ---- Illustration element ----
  const illustrationEl = page.image_url ? (
    <img
      src={page.image_url}
      alt={`Page ${currentPage + 1} illustration`}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      onError={(e) => {
        // Replicate CDN URLs expire — hide the broken image and show placeholder
        (e.target as HTMLImageElement).style.display = 'none';
        (e.target as HTMLImageElement).parentElement?.classList.add('show-placeholder');
      }}
    />
  ) : (
    <IllustrationPlaceholder generating={isThisPageGenerating} />
  );

  // ---- End-of-book CTA helpers ----
  const currentVol = story.volume_number ?? 1;
  const seriesComplete = currentVol >= 3;
  const canContinueNow = !!userCtx && (
    userCtx.isAdmin ||
    (userCtx.status === 'subscribed'
      ? (1 + (userCtx.extra_books_today ?? 0) - (userCtx.stories_today ?? 0)) > 0
      : (userCtx.extra_books_today ?? 0) > 0)
  );
  const ctaBox = { marginTop: '22px', padding: '18px', borderRadius: '14px', background: 'rgba(116,21,21,0.06)', border: '1px solid rgba(116,21,21,0.12)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' };
  const ctaTitle = { fontFamily: 'Lora, Georgia, serif', fontWeight: 700, color: '#2C1A0E', fontSize: '1.05rem' };
  const ctaText = { color: '#5a3a2a', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 };
  const ctaSecondaryBtn = { background: 'transparent', color: '#741515', border: '1.5px solid #741515', borderRadius: '10px', padding: '0.6rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };

  // ---- Text content element ----
  const textContentEl = (
    <div className="book-text-inner" style={{ position: 'relative' }}>
      {currentPage === 0 && (
        <>
        <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.5rem', color: '#2C1A0E', marginBottom: '10px', lineHeight: 1.25, fontWeight: 600 }}>
          {story.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 18px' }}>
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, rgba(208,170,96,0), #D0AA60)' }} />
          <span style={{ color: '#D0AA60', fontSize: '0.8rem' }}>✦</span>
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, rgba(208,170,96,0), #D0AA60)' }} />
        </div>
        </>
      )}
      <div className="story-text">
        {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
      </div>
      {isLastPage && story.moral && (
        <div style={{ borderLeft: '3px solid #741515', paddingLeft: '16px', marginTop: '18px', color: '#5a3a2a', fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {story.moral}
        </div>
      )}
      {isLastPage && userCtx && (
        seriesComplete ? (
          <div style={ctaBox}>
            <div style={ctaTitle}>🎉 You finished the series!</div>
            <p style={ctaText}>All three chapters are complete. Time to start a brand-new adventure.</p>
            <Link href="/dashboard" className="btn-brand" style={{ textDecoration: 'none' }}>Back to library</Link>
          </div>
        ) : canContinueNow ? (
          <div style={ctaBox}>
            <div style={ctaTitle}>Want to know what happens next?</div>
            <button onClick={startSequel} disabled={continuing} className="btn-brand">{continuing ? 'Writing the next chapter…' : 'Continue to the next chapter →'}</button>
          </div>
        ) : userCtx.status === 'subscribed' ? (
          <div style={ctaBox}>
            <div style={ctaTitle}>The next chapter unlocks at midnight</div>
            <p style={ctaText}>Come back tomorrow for the next free chapter — or unlock it right now.</p>
            <button onClick={buyNextChapter} className="btn-brand">Unlock the next chapter now — 99¢</button>
          </div>
        ) : (
          <div style={ctaBox}>
            <div style={ctaTitle}>Continue the adventure</div>
            <p style={ctaText}>Subscribe for unlimited stories, or unlock just the next chapter now.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => router.push('/dashboard')} className="btn-brand">Subscribe</button>
              <button onClick={buyNextChapter} style={ctaSecondaryBtn}>Next chapter — 99¢</button>
            </div>
          </div>
        )
      )}
      <div style={{ textAlign: 'center', marginTop: '18px', color: 'rgba(116,21,21,0.3)', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>
        — {currentPage + 1} —
      </div>
    </div>
  );

  // ---- Responsive layout: side-by-side on tablet/desktop, stacked+scroll on mobile ----
  function renderPageContent() {
    return (
      <div className="book-page-layout">
        {/* Illustration column */}
        <div className="book-illus-col">
          <div className="illus-wrap" style={{ width: '100%', height: '100%' }}>
            {illustrationEl}
            <CornerOrnaments />
          </div>
        </div>
        {/* Text column */}
        <div className="book-text-col">
          {textContentEl}
        </div>
      </div>
    );
  }

  const onBookTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const onBookTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && currentPage < totalPages - 1) goToPage(currentPage + 1);
      else if (dx > 0 && currentPage > 0) goToPage(currentPage - 1);
    }
  };

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {continuing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,8,0.93)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '24px' }}>
          <style>{`@keyframes tp-spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#c4784a', borderRadius: '50%', animation: 'tp-spin 0.9s linear infinite' }} />
          <p style={{ color: '#fff', fontFamily: 'Fredoka, cursive', fontSize: '1.1rem', textAlign: 'center', margin: 0 }}>Writing the next chapter for {story?.children?.name || 'your child'}…</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px', margin: 0 }}>This takes a moment. We&apos;ll open the new book as soon as it&apos;s ready.</p>
        </div>
      )}

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

        {page.image_url && (
          <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${page.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(64px) brightness(0.42) saturate(1.15)', transform: 'scale(1.25)', transition: 'background-image 0.4s ease' }} />
        )}

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
          className="book-page book-page-wide"
          style={{ width: '100%', maxWidth: '640px', margin: '24px 16px 0', flex: 1, touchAction: 'pan-y', position: 'relative', zIndex: 1 }}
          onTouchStart={onBookTouchStart}
          onTouchEnd={onBookTouchEnd}
        >
          <div className="page-border" />
          {renderPageContent()}
          {flip && (
            <div key={flip.key} className={`page-flip ${flip.dir === 'forward' ? 'flip-fwd' : 'flip-back'}`}>
              {flip.img && (
                <img src={flip.img} alt="" style={{ position: 'absolute', top: 0, left: '28px', width: 'calc(100% - 28px)', aspectRatio: '1 / 1', objectFit: 'contain', background: '#F5F0E8' }} />
              )}
            </div>
          )}
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

          {!isLastPage && (
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
          {isLastPage && (
            <Link
              href="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#c4784a', border: 'none', borderRadius: '12px',
                color: 'white', padding: '0.75rem 1.25rem',
                textDecoration: 'none', fontSize: '1rem', fontWeight: 700,
                minWidth: '90px', justifyContent: 'center',
              }}
            >
              Library
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
