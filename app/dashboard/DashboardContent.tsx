'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { verifyParent } from '@/lib/parentalGate';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Settings, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PaywallModal from '@/components/PaywallModal';
import { updateChild } from '@/lib/supabase/child-actions';
import { isContentAppropriate } from '@/lib/content-filter';

const CHILD_PALETTES = [
  { cover: '#FF6B35', spine: '#CC4B1A', light: '#FFF0E6', emoji: '🦁' },
  { cover: '#8E7BFF', spine: '#5c48e0', light: '#F0EEFF', emoji: '🦊' },
  { cover: '#1496A6', spine: '#0c6a77', light: '#E6F6F8', emoji: '🐬' },
  { cover: '#E8A020', spine: '#b87a10', light: '#FFF6E0', emoji: '🦋' },
  { cover: '#6CC06C', spine: '#4a9a4a', light: '#EEF8EE', emoji: '🐸' },
];

const pageStyles = `
  .book-cover-panel {
    transition: transform 0.55s cubic-bezier(0.4,0,0.2,1), box-shadow 0.55s ease;
  }
  .book-wrap:hover .book-cover-panel {
    transform: rotateY(-162deg);
    box-shadow: -10px 6px 28px rgba(0,0,0,0.3);
  }
  .book-read-hint { opacity:0; transition: opacity 0.2s ease 0.3s; }
  .book-wrap:hover .book-read-hint { opacity:1; }
  .top-nav-tab { transition: all 0.15s ease; border-radius: 999px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 18px; font-weight: 600; font-size: 0.875rem; }
  .top-nav-tab:hover { background: rgba(13,24,61,0.08) !important; }
  .continue-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .continue-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.18) !important; }
  @keyframes writingDot {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }
  @keyframes confetti-fall {
    0%   { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
  }
  @keyframes writing-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(1.08); }
  }
  @keyframes tour-fade-in {
    0%   { opacity: 0; transform: scale(0.95) translateY(8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

type Child = { id: string; name: string; age: number; interests: string[]; has_used_free_story?: boolean };
type Story = {
  id: string; title: string; created_at: string; word_count: number;
  series_id: string | null; series_title: string | null; volume_number: number | null;
  pages: Array<{ page_number: number; image_url?: string }> | null;
  children: { name: string; age: number };
};
type Palette = typeof CHILD_PALETTES[0];

function getBookTilt(id: string): number {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ((hash % 5) - 2) * 0.5;
}

function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  const dots = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${3 + (i * 1.6) % 94}%`,
    color: ['#FF6B35','#FFB703','#1496A6','#8E7BFF','#6CC06C','#FF3366','#FFD700','#FF6B35'][i % 8],
    delay: `${((i * 0.051) % 0.85).toFixed(2)}s`,
    dur: `${(1.3 + (i * 0.031) % 1.3).toFixed(2)}s`,
    size: `${6 + (i % 7)}px`,
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0%',
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      {dots.map(d => (
        <div key={d.id} style={{ position: 'absolute', top: '-20px', left: d.left, width: d.size, height: d.size, background: d.color, borderRadius: d.shape, animation: `confetti-fall ${d.dur} ${d.delay} ease-in forwards` }} />
      ))}
    </div>
  );
}

// ── Product Tour ───────────────────────────────────────────────────────────────

type TourStep = { title: string; body: string; targetId: string | null };

function ProductTour({ steps, pendingStoryId, onDone }: {
  steps: TourStep[];
  pendingStoryId?: string;
  onDone: (navigateTo?: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const PAD = 10;
  const TOOLTIP_W = typeof window !== 'undefined' ? Math.min(300, window.innerWidth - 32) : 300;

  // Block user-initiated scroll during tour so spotlight doesn't drift,
  // but use event listeners instead of overflow:hidden so that programmatic
  // scrollIntoView still works for spotlighting off-screen elements.
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
    };
  }, []);

  useEffect(() => {
    if (!current.targetId) {
      setSpotlightRect(null);
      return;
    }
    const update = () => {
      const el = document.getElementById(current.targetId!) || document.getElementById(current.targetId! + '-mobile');
      if (el && el.getClientRects().length > 0) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) { setSpotlightRect(null); return; }
          // Cap very tall targets so the highlight stays a visible box and the
          // tooltip has room to sit on small screens.
          const cappedH = Math.min(r.height, Math.round(window.innerHeight * 0.4));
          setSpotlightRect(new DOMRect(r.left, r.top, r.width, cappedH));
        }, 80);
      } else {
        setSpotlightRect(null);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [step, current.targetId]);

  const goNext = () => {
    if (isLast) onDone(pendingStoryId ? `/stories/${pendingStoryId}` : undefined);
    else setStep(s => s + 1);
  };
  const goBack = () => setStep(s => s - 1);
  const skip = () => onDone(pendingStoryId ? `/stories/${pendingStoryId}` : undefined);

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties;
  let arrowStyle: React.CSSProperties | null = null;

  const TOOLTIP_H = 210;
  if (!spotlightRect) {
    tooltipStyle = {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', width: `${TOOLTIP_W}px`,
    };
  } else {
    const sr = spotlightRect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = PAD + 14;
    const centreX = Math.max(16, Math.min(vw - TOOLTIP_W - 16, sr.left + sr.width / 2 - TOOLTIP_W / 2));
    const arrowLeft = Math.max(14, Math.min(TOOLTIP_W - 28, sr.left + sr.width / 2 - centreX - 7));
    if (vh - sr.bottom >= TOOLTIP_H + 24) {
      // Room below — anchor from the top, grows downward
      tooltipStyle = { position: 'fixed', top: `${sr.bottom + gap}px`, left: `${centreX}px`, width: `${TOOLTIP_W}px` };
      arrowStyle = { position: 'absolute', top: '-7px', left: `${arrowLeft}px`, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid #fff' };
    } else if (sr.top >= 120) {
      // Room above — anchor from the BOTTOM so the box can never cover its target
      tooltipStyle = { position: 'fixed', bottom: `${vh - sr.top + gap}px`, left: `${centreX}px`, width: `${TOOLTIP_W}px`, maxHeight: `${Math.max(160, sr.top - gap - 12)}px`, overflowY: 'auto' };
      arrowStyle = { position: 'absolute', bottom: '-7px', left: `${arrowLeft}px`, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #fff' };
    } else {
      // No room either side — centre it
      tooltipStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${TOOLTIP_W}px` };
      arrowStyle = null;
    }
  }

  return (
    <>
      {/* Overlay / spotlight */}
      {spotlightRect ? (
        <div style={{
          position: 'fixed',
          left: spotlightRect.left - PAD,
          top: spotlightRect.top - PAD,
          width: spotlightRect.width + PAD * 2,
          height: spotlightRect.height + PAD * 2,
          borderRadius: '14px',
          zIndex: 600,
          boxShadow: '0 0 0 9999px rgba(13,10,8,0.78)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }} />
      ) : (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(13,10,8,0.78)',
          zIndex: 599,
        }} onClick={e => e.stopPropagation()} />
      )}

      {/* Tooltip card */}
      <div style={{
        ...tooltipStyle,
        zIndex: 601,
        background: '#fff',
        borderRadius: '16px',
        padding: '22px 22px 18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        animation: 'tour-fade-in 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {arrowStyle && <div style={{ position: 'relative' }}><div style={arrowStyle} /></div>}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.15rem', color: '#0D183D', lineHeight: 1.25, flex: 1, paddingRight: '8px' }}>
            {current.title}
          </h3>
          <button onClick={skip} title="Skip tour" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0C8D4', fontSize: '1.2rem', lineHeight: 1, padding: 0, flexShrink: 0, marginTop: '1px' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#5E6A7A', lineHeight: 1.6, marginBottom: '18px' }}>
          {current.body}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === step ? '#FF6B35' : '#E5E7EB',
                transition: 'all 0.25s ease',
              }} />
            ))}
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {step > 0 && (
              <button onClick={goBack} style={{
                padding: '0.5rem 1rem', border: '1.5px solid #F0E4D0', borderRadius: '8px',
                background: '#fff', color: '#5E6A7A', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
              }}>
                Back
              </button>
            )}
            <button onClick={goNext} style={{
              padding: '0.5rem 1.3rem', border: 'none', borderRadius: '8px',
              background: '#FF6B35', color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700',
              boxShadow: '0 3px 10px rgba(255,107,53,0.35)',
            }}>
              {isLast ? (pendingStoryId ? 'Read my story →' : 'Done ✓') : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── BookCard ───────────────────────────────────────────────────────────────────

function BookCard({ story, palette, onContinue, isWriting }: { story: Story; palette: Palette; onContinue?: () => void; isWriting?: boolean }) {
  const router = useRouter();
  const coverImage = story.pages?.[0]?.image_url;
  const tilt = getBookTilt(story.id);
  const vol = story.volume_number;
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;

  return (
    <div style={{ transform: `rotate(${tilt}deg)`, transition: 'transform 0.2s ease', transformOrigin: 'bottom center' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${tilt}deg) scale(1)`)}>
      <div className="book-wrap" onClick={() => !isWriting && router.push(`/stories/${story.id}`)}
        style={{ perspective: '900px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '140px', height: '196px', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '18px', height: '100%', background: `linear-gradient(90deg, ${palette.spine} 0%, ${palette.cover} 100%)`, borderRadius: '3px 0 0 3px', zIndex: 3, boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3)' }} />
          {[4, 2].map(o => <div key={o} style={{ position: 'absolute', left: `${18+o}px`, top: `${o*.4}px`, width: `calc(100% - ${18+o}px)`, height: `calc(100% - ${o*.8}px)`, background: '#FFF0E6', borderRadius: '0 3px 3px 0' }} />)}
          <div style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', borderRadius: '0 6px 6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px', overflow: 'hidden', background: '#FFF8F0' }}>
            {coverImage && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />}
            <div style={{ position: 'relative', zIndex: 1, width: '40px', height: '2px', background: palette.cover, borderRadius: '1px', opacity: 0.4 }} />
            <p style={{ position: 'relative', zIndex: 1, fontSize: '0.72rem', fontFamily: 'Fredoka, cursive', textAlign: 'center', color: '#0D183D', lineHeight: 1.45 }}>{story.title}</p>
            <div className="book-read-hint" style={{ position: 'relative', zIndex: 1, fontSize: '0.68rem', fontWeight: '700', color: palette.cover, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Read</div>
          </div>
          <div className="book-cover-panel" style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', background: palette.cover, borderRadius: '0 6px 6px 0', transformOrigin: 'left center', backfaceVisibility: 'hidden', zIndex: 2, overflow: 'hidden', boxShadow: '3px 3px 14px rgba(0,0,0,0.22)' }}>
            {isWriting ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: palette.cover, padding: '12px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', animation: `writingDot 1.2s ease infinite ${i * 0.2}s` }} />
                  ))}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', fontFamily: 'Fredoka, cursive', textAlign: 'center', lineHeight: 1.3 }}>Writing your story...</p>
              </div>
            ) : coverImage ? (
              <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)' }} />
                <div style={{ position: 'absolute', top: '8px', right: '7px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.58rem', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', zIndex: 1 }}>VOL {vol || 1}</div>
                <p style={{ position: 'absolute', bottom: '22px', left: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Fredoka, cursive', color: '#fff', lineHeight: 1.35, textShadow: '0 1px 4px rgba(0,0,0,0.7)', zIndex: 1 }}>{story.title}</p>
                <p style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', fontSize: '0.55rem', color: 'rgba(255,255,255,0.65)', zIndex: 1, letterSpacing: '0.03em' }}>{new Date(story.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern }} />
                <div style={{ position: 'absolute', top: '10px', right: '8px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.6rem', fontWeight: '800', padding: '2px 7px', borderRadius: '10px' }}>VOL {vol || 1}</div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '3px', transform: 'rotate(45deg)' }} />
                  <p style={{ fontSize: '0.75rem', fontFamily: 'Fredoka, cursive', textAlign: 'center', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4 }}>{story.title}</p>
                  <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{new Date(story.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {onContinue && (
        <button id="tour-next-chapter" onClick={e => { e.stopPropagation(); onContinue(); }}
          style={{ marginTop: '6px', padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,53,0.35)' }}>
          Next chapter →
        </button>
      )}
    </div>
  );
}

function SeriesFan({ volumes, palette, onContinue }: { volumes: Story[]; palette: Palette; onContinue?: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();
  const n = volumes.length;
  const spread = n === 1 ? 0 : n === 2 ? 20 : n === 3 ? 28 : 34;
  const angles = volumes.map((_, i) => n === 1 ? 0 : -spread / 2 + (spread / (n - 1)) * i);
  const containerW = 140 + (n - 1) * 22 + 40;
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;
  const seriesTitle = volumes[0].series_title || 'Series';
  const seriesTitleDisplay = seriesTitle.length > 30 ? seriesTitle.slice(0, 28) + '…' : seriesTitle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: `${containerW}px`, height: '196px' }}>
        {volumes.map((vol, i) => {
          const isHovered = hoveredId === vol.id;
          const coverImage = vol.pages?.[0]?.image_url;
          return (
            <div key={vol.id} onClick={() => router.push(`/stories/${vol.id}`)} onMouseEnter={() => setHoveredId(vol.id)} onMouseLeave={() => setHoveredId(null)}
              style={{ position: 'absolute', bottom: 0, left: '50%', width: '120px', height: '168px', cursor: 'pointer', transformOrigin: 'center bottom', transform: `translateX(-50%) rotate(${angles[i]}deg) translateY(${isHovered ? -20 : 0}px)`, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', zIndex: isHovered ? 50 : i + 1, borderRadius: '3px 6px 6px 3px', overflow: 'hidden', boxShadow: isHovered ? '0 16px 36px rgba(0,0,0,0.35)' : '2px 4px 10px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '13px', height: '100%', background: palette.spine, zIndex: 1, boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.25)' }} />
              <div style={{ position: 'absolute', left: '13px', top: 0, width: 'calc(100% - 13px)', height: '100%', background: palette.cover, overflow: 'hidden' }}>
                {coverImage ? (
                  <>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
                  </>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern }} />
                )}
                <div style={{ position: 'absolute', top: '6px', right: '5px', background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '0.5rem', fontWeight: '800', padding: '1px 5px', borderRadius: '6px', zIndex: 2 }}>VOL {vol.volume_number}</div>
                {!coverImage && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px' }}>
                    <p style={{ fontSize: '0.56rem', fontFamily: 'Fredoka, cursive', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.3 }}>{vol.title.length > 36 ? vol.title.slice(0, 34) + '…' : vol.title}</p>
                  </div>
                )}
                <p style={{ position: 'absolute', bottom: '18px', left: '5px', right: '5px', fontSize: '0.52rem', fontFamily: 'Fredoka, cursive', color: '#fff', textAlign: 'center', zIndex: 2, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{vol.title.length > 30 ? vol.title.slice(0, 28) + '…' : vol.title}</p>
                <p style={{ position: 'absolute', bottom: '6px', left: '5px', right: '5px', fontSize: '0.44rem', color: 'rgba(255,255,255,0.65)', textAlign: 'center', zIndex: 2 }}>{new Date(vol.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.68rem', color: '#5E6A7A', textAlign: 'center', maxWidth: `${containerW}px` }}>{seriesTitleDisplay} · {n} {n === 1 ? 'vol' : 'vols'}</p>
      {onContinue && n < 4 && (
        <button onClick={e => { e.stopPropagation(); onContinue(); }}
          style={{ marginTop: '6px', padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,53,0.35)' }}>
          Next chapter →
        </button>
      )}
    </div>
  );
}

type ShelfItem = { type: 'single'; story: Story } | { type: 'series'; seriesId: string; volumes: Story[] };

function buildShelf(stories: Story[], childName: string): ShelfItem[] {
  const mine = stories.filter(s => s.children?.name === childName);
  const seriesMap = new Map<string, Story[]>();
  const singles: Story[] = [];
  mine.forEach(s => {
    if (s.series_id) {
      if (!seriesMap.has(s.series_id)) seriesMap.set(s.series_id, []);
      seriesMap.get(s.series_id)!.push(s);
    } else singles.push(s);
  });
  const items: ShelfItem[] = [];
  singles.forEach(story => items.push({ type: 'single', story }));
  seriesMap.forEach((vols, seriesId) => {
    items.push({ type: 'series', seriesId, volumes: [...vols].sort((a, b) => (a.volume_number ?? 1) - (b.volume_number ?? 1)) });
  });
  items.sort((a, b) => {
    const aDate = a.type === 'single' ? new Date(a.story.created_at).getTime() : Math.max(...a.volumes.map(v => new Date(v.created_at).getTime()));
    const bDate = b.type === 'single' ? new Date(b.story.created_at).getTime() : Math.max(...b.volumes.map(v => new Date(v.created_at).getTime()));
    return bDate - aDate;
  });
  return items;
}

const INTERESTS = ['Superheroes','Fantasy','Fairies','Unicorns','Princesses','Pirates','Magic','Aliens','Dinosaurs','Animals','Ocean','Nature','Space','Robots','Science','Gaming','Soccer','Football','Gymnastics','Dancing','Karate','Swimming','Art','Music','Cooking','Dolls','Cars & Trucks'];

type ChildRecord = { id: string; name: string; age: number; gender: string | null; interests: string[]; reading_level: string; appearance: Record<string, unknown> };

function EditChildModal({ child, palette, onClose, onSaved }: { child: ChildRecord; palette: typeof CHILD_PALETTES[0]; onClose: () => void; onSaved: () => void }) {
  const app = child.appearance || {};
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [gender, setGender] = useState(child.gender || 'Skip');
  const [interests, setInterests] = useState<string[]>(child.interests || []);
  const [skinColour, setSkinColour] = useState((app.skinColour as string) || '');
  const [hairColour, setHairColour] = useState((app.hairColour as string) || '');
  const [eyeColour, setEyeColour] = useState((app.eyeColour as string) || '');
  const [city, setCity] = useState((app.city as string) || '');
  const [country, setCountry] = useState((app.country as string) || '');
  const [readingLevel, setReadingLevel] = useState(() => { const m: Record<string,string> = { beginner:'simple', intermediate:'medium', advanced:'imaginative' }; return m[child.reading_level] || 'medium'; });
  const [siblings, setSiblings] = useState<{name:string;nickname:string}[]>((app.siblings as {name:string;nickname:string}[]) || []);
  const [friends, setFriends] = useState<{name:string;nickname:string}[]>((app.friends as {name:string;nickname:string}[]) || []);
  const [petName, setPetName] = useState((app.petName as string) || '');
  const [petType, setPetType] = useState((app.petType as string) || '');
  const [followUpAnswers, setFollowUpAnswers] = useState<{question:string; answer:string}[]>((app.followUpAnswers as {question:string; answer:string}[] | undefined) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toggleInterest = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : prev.length >= 5 ? prev : [...prev, i]);
  const [customInterestVal, setCustomInterestVal] = useState('');
  const handleAddCustom = () => {
    const val = customInterestVal.trim();
    if (!val) return;
    if (!isContentAppropriate(val)) {
      setError(`\u201c${val}\u201d isn\u2019t something we can use for a children\u2019s story. Please choose a different interest.`);
      return;
    }
    if (interests.length < 5 && !interests.includes(val)) {
      setInterests(prev => [...prev, val]);
      setCustomInterestVal('');
      setError('');
    }
  };
  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    const result = await updateChild(child.id, { name, age, gender, interests, skinColour, hairColour, eyeColour, city, country, readingLevel, siblings, friends, petName, petType, followUpAnswers });
    if (result.error) {
      setError(result.error === 'inappropriate_content'
        ? "Some of these details aren\u2019t suitable for a children\u2019s story. Please review the name and interests, then try again."
        : result.error);
      setSaving(false);
      return;
    }
    onSaved(); onClose();
  };
  const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff' };
  const chip = (active: boolean): React.CSSProperties => ({ cursor: 'pointer', borderRadius: '8px', fontWeight: '500', fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: `1.5px solid ${active ? palette.cover : '#F0E4D0'}`, background: active ? palette.cover : '#fff', color: active ? '#fff' : '#0D183D' });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFEF9', borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.3rem', color: '#0D183D' }}>Edit {child.name}&apos;s profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6A7A' }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '0.85rem', color: '#991B1B' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Name</label><input style={inp} value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Age</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setAge(a => Math.max(3, a - 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>-</button>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{age}</span>
              <button onClick={() => setAge(a => Math.min(12, a + 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
            </div>
          </div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Gender</label><div style={{ display: 'flex', gap: '8px' }}>{['Boy','Girl','Skip'].map(g => <button key={g} onClick={() => setGender(g)} style={chip(gender === g)}>{g}</button>)}</div></div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '4px' }}>Interests</label>
            <p style={{ fontSize: '0.75rem', color: interests.length >= 5 ? '#FF6B35' : '#9CA3AF', marginBottom: '8px' }}>{interests.length}/5 selected{interests.length >= 5 ? '. Remove one to add another' : ''}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} style={chip(interests.includes(i))} disabled={!interests.includes(i) && interests.length >= 5}>{i}</button>)}
              {interests.filter(i => !INTERESTS.includes(i)).map(i => (
                <button key={i} onClick={() => toggleInterest(i)} style={{ ...chip(true), display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i} <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>×</span>
                </button>
              ))}
            </div>
            {interests.length < 5 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Add a custom interest..."
                  value={customInterestVal}
                  onChange={e => { setCustomInterestVal(e.target.value); if (error) setError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
                />
                {customInterestVal.trim() && (
                  <button onClick={handleAddCustom} style={{ padding: '0.6rem 1rem', background: palette.cover, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Skin colour</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([{ label: 'White', hex: '#F5D5B5' }, { label: 'Tanned', hex: '#C8956C' }, { label: 'Semi Brown', hex: '#8D5524' }, { label: 'Brown', hex: '#4A2512' }] as {label:string;hex:string}[]).map(({ label, hex }) => (
                  <button key={label} type="button" title={label}
                    onClick={() => setSkinColour(skinColour === label ? '' : label)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: hex, border: skinColour === label ? '3px solid #FF6B35' : '3px solid transparent', outline: skinColour === label ? '2px solid #FF6B35' : '2px solid #E0CDB8', outlineOffset: '2px', cursor: 'pointer', flexShrink: 0 }}
                  />
                ))}
              </div>
            </div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Hair colour</label><input style={inp} value={hairColour} onChange={e => setHairColour(e.target.value)} placeholder="e.g. Brown" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Eye colour</label><input style={inp} value={eyeColour} onChange={e => setEyeColour(e.target.value)} placeholder="e.g. Blue" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>City</label><input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Sydney" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Country</label><input style={inp} value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Australia" /></div>
          </div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Reading level</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{id:'simple',label:'Simple',sub:'3-5'},{id:'medium',label:'Medium',sub:'6-8'},{id:'imaginative',label:'Imaginative',sub:'9-12'}].map(o => (
                <button key={o.id} onClick={() => setReadingLevel(o.id)} style={{ ...chip(readingLevel === o.id), display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 14px' }}><span>{o.label}</span><span style={{ fontSize: '0.68rem', opacity: 0.75 }}>{o.sub}</span></button>
              ))}
            </div>
          </div>
          {/* Siblings */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Siblings <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
            {siblings.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1 }} placeholder="Name" value={s.name} onChange={e => { const u = [...siblings]; u[i] = { ...u[i], name: e.target.value }; setSiblings(u); }} />
                <input style={{ ...inp, flex: 1 }} placeholder="Nickname (optional)" value={s.nickname} onChange={e => { const u = [...siblings]; u[i] = { ...u[i], nickname: e.target.value }; setSiblings(u); }} />
                <button onClick={() => setSiblings(siblings.filter((_, idx) => idx !== i))} style={{ background: 'none', border: '1.5px solid #F0E4D0', borderRadius: '8px', padding: '0.5rem 0.7rem', cursor: 'pointer', color: '#5E6A7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={() => setSiblings([...siblings, { name: '', nickname: '' }])} style={{ fontSize: '0.82rem', color: palette.cover, background: 'none', border: `1.5px dashed ${palette.cover}`, borderRadius: '8px', padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: '600' }}>+ Add sibling</button>
          </div>
          {/* Best friends */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Best friends <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
            {friends.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1 }} placeholder="Name" value={f.name} onChange={e => { const u = [...friends]; u[i] = { ...u[i], name: e.target.value }; setFriends(u); }} />
                <input style={{ ...inp, flex: 1 }} placeholder="Nickname (optional)" value={f.nickname} onChange={e => { const u = [...friends]; u[i] = { ...u[i], nickname: e.target.value }; setFriends(u); }} />
                <button onClick={() => setFriends(friends.filter((_, idx) => idx !== i))} style={{ background: 'none', border: '1.5px solid #F0E4D0', borderRadius: '8px', padding: '0.5rem 0.7rem', cursor: 'pointer', color: '#5E6A7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={() => setFriends([...friends, { name: '', nickname: '' }])} style={{ fontSize: '0.82rem', color: palette.cover, background: 'none', border: `1.5px dashed ${palette.cover}`, borderRadius: '8px', padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: '600' }}>+ Add friend</button>
          </div>
          {/* Pet */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Pet <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input style={inp} placeholder="Pet name (e.g. Biscuit)" value={petName} onChange={e => setPetName(e.target.value)} />
              <input style={inp} placeholder="Pet type (e.g. Dog)" value={petType} onChange={e => setPetType(e.target.value)} />
            </div>
          </div>
          {/* Follow-up Q&A */}
          {followUpAnswers.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>
                Story details <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(shapes future stories)</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {followUpAnswers.map((qa, i) => (
                  <div key={i}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '4px' }}>{qa.question}</label>
                    <textarea
                      value={qa.answer}
                      onChange={e => {
                        const updated = [...followUpAnswers];
                        updated[i] = { ...updated[i], answer: e.target.value };
                        setFollowUpAnswers(updated);
                      }}
                      rows={2}
                      style={{ ...inp, resize: 'vertical' as const, fontFamily: 'inherit' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', color: '#5E6A7A', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.7rem', border: 'none', borderRadius: '8px', background: palette.cover, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('stories');
  const [isMobile, setIsMobile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const generatingLock = useRef(false);
  const [generatingName, setGeneratingName] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [dailyLimitChild, setDailyLimitChild] = useState<string | null>(null);
  const [paywallReason, setPaywallReason] = useState<'free_exhausted' | 'monthly_limit' | 'no_subscription' | 'daily_limit' | null>(null);
  const [editingChild, setEditingChild] = useState<ChildRecord | null>(null);
  const [sub, setSub] = useState<{ status: string; stories_this_month: number; stories_today: number; extra_books_today: number; extra_child_slots: number; current_period_end: string | null; has_seen_tour: boolean } | null>(null);
  const [writingStoryIds, setWritingStoryIds] = useState<Set<string>>(new Set());
  const [imagePollingIds, setImagePollingIds] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [pendingTourStoryId, setPendingTourStoryId] = useState('');
  const [pendingTourChildName, setPendingTourChildName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [accountSection, setAccountSection] = useState<null | 'email' | 'password'>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { setUserEmail(user.email ?? ''); setUserId(user.id); }
    const { data: childrenData } = await supabase.from('children').select('*').order('created_at', { ascending: true });
    const { data: storiesData } = await supabase.from('stories').select('id, title, created_at, word_count, series_id, series_title, volume_number, pages, children(name, age)').order('created_at', { ascending: false });
    const { data: subData } = await supabase.from('user_subscriptions').select('status, stories_this_month, stories_today, extra_books_today, extra_child_slots, current_period_end, has_seen_tour').eq('user_id', user?.id ?? '').single();
    const { data: adminRow } = await supabase.from('admin_emails').select('email').eq('email', user?.email ?? '').maybeSingle();
    setSub(subData);
    setIsAdmin(!!adminRow);
    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
    return { subData, userId: user?.id ?? '' };
  }, [supabase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    const params = new URLSearchParams(search);
    if (params.get('subscribed') === 'true') {
      window.history.replaceState({}, '', '/dashboard');
      fetch('/api/stripe/sync-subscription', { method: 'POST' })
        .then(() => fetchData())
        .catch(() => fetchData());
    } else if (params.get('extra_book') === 'true') {
      window.history.replaceState({}, '', '/dashboard');
      fetchData();
    } else if (params.get('extra_child') === 'true') {
      window.history.replaceState({}, '', '/dashboard');
      fetchData();
    } else if (params.get('new_story')) {
      // Coming from onboarding - show confetti + product tour for first-timers
      const storyId = params.get('new_story')!;
      const childName = params.get('child_name') || '';
      window.history.replaceState({}, '', '/dashboard');
      fetchData().then(({ subData }) => {
        const decodedName = decodeURIComponent(childName);
        setPendingTourStoryId(storyId);
        setPendingTourChildName(decodedName);
        setShowConfetti(true);
        if (!subData?.has_seen_tour) {
          setShowTour(true);
          // Pre-generate all 5 page images in background while user reads tour.
          // Sequential with 400ms stagger to avoid Replicate rate limits.
          // generate-image stores poll_url in DB; story page picks it up and goes
          // straight to polling instead of re-submitting to Replicate.
          void (async () => {
            // Pre-generate AND fully poll all 5 images in background during tour.
            // generate-image starts the Replicate prediction + saves poll_url to DB.
            // poll-image polls until done, downloads, uploads to Supabase Storage,
            // and saves image_url to DB  -  so images are ready when story page opens
            // and page 1 image appears on the dashboard book cover.
            for (let _page = 1; _page <= 5; _page++) {
              try {
                // Step 1: Start prediction
                const genRes = await fetch('/api/generate-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ story_id: storyId, page_number: _page }),
                });
                if (genRes.ok) {
                  const genData = await genRes.json();
                  const pollUrl = genData.poll_url;
                  if (pollUrl) {
                    // Step 2: Poll until image is uploaded to Supabase Storage
                    for (let attempt = 0; attempt < 30; attempt++) {
                      await new Promise(r => setTimeout(r, 2000));
                      const pollRes = await fetch('/api/poll-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story_id: storyId, page_number: _page, poll_url: pollUrl }),
                      });
                      if (!pollRes.ok) break;
                      const pollData = await pollRes.json();
                      if (pollData.status === 'succeeded') {
                        // After page 1, refresh dashboard so cover image appears
                        if (_page === 1) fetchData();
                        break;
                      }
                      if (pollData.status === 'failed') break;
                    }
                  }
                }
              } catch { /* story page handles regeneration on open */ }
              await new Promise(r => setTimeout(r, 300));
            }
            // Final refresh so all covers are up to date
            fetchData();
          })();
        } else {
          // Tour already seen - go straight to the story
          router.push(`/stories/${storyId}`);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);
  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Phase 1: poll for story text — removes "Writing..." animation when pages arrive
  useEffect(() => {
    if (writingStoryIds.size === 0) return;
    const supabase = createClient();
    const interval = setInterval(async () => {
      const ids = [...writingStoryIds];
      for (const storyId of ids) {
        const { data } = await supabase
          .from('stories')
          .select('id, pages')
          .eq('id', storyId)
          .single();
        if (data?.pages && Array.isArray(data.pages) && data.pages.length > 0) {
          setWritingStoryIds(prev => { const next = new Set(prev); next.delete(storyId); return next; });
          // If cover image not yet ready, continue polling for it
          if (!data.pages[0]?.image_url) {
            setImagePollingIds(prev => new Set([...prev, storyId]));
          }
          fetchData();
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writingStoryIds]);
  // Phase 2: poll for cover image — refreshes shelf once server-side image is ready
  useEffect(() => {
    if (imagePollingIds.size === 0) return;
    const supabase = createClient();
    const interval = setInterval(async () => {
      const ids = [...imagePollingIds];
      for (const storyId of ids) {
        const { data } = await supabase
          .from('stories')
          .select('id, pages')
          .eq('id', storyId)
          .single();
        if (data?.pages?.[0]?.image_url) {
          setImagePollingIds(prev => { const next = new Set(prev); next.delete(storyId); return next; });
          fetchData();
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePollingIds]);
  useEffect(() => { const onFocus = () => fetchData(); window.addEventListener('focus', onFocus); return () => window.removeEventListener('focus', onFocus); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const booksRemainingToday = sub?.status === 'subscribed' ? Math.max(0, 1 + (sub.extra_books_today ?? 0) - (sub.stories_today ?? 0)) : 0;
  const booksRemainingThisMonth = sub?.status === 'subscribed'
    ? Math.max(0, 15 - (sub.stories_this_month ?? 0))
    : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const childStoriesUsedToday = new Set(
    stories
      .filter(s => s.created_at && s.created_at.startsWith(todayStr))
      .map(s => s.children?.name)
      .filter(Boolean)
  );
  const childrenAvailableToday = children.filter(c => !childStoriesUsedToday.has(c.name)).length;
  const freeStoriesRemaining = sub?.status === 'subscribed' ? 0 : children.filter(c => !c.has_used_free_story).length;

  const storiesByChild = (childId: string) => { const child = children.find(c => c.id === childId); if (!child) return []; return stories.filter(s => s.children?.name === child.name); };
  const isSeriesComplete = (childId: string) => { const latest = storiesByChild(childId)[0]; if (!latest?.series_id) return false; return stories.filter(s => s.series_id === latest.series_id).some(s => s.volume_number === 4); };

  // Poll the story row until the edge function has written the text (pages populated),
  // so the full-screen "Writing..." overlay stays up until the book actually exists
  // instead of clearing the instant the API returns its placeholder.
  const waitForStoryText = async (storyId: string, timeoutMs = 60000) => {
    const sb = createClient();
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const { data } = await sb.from('stories').select('pages').eq('id', storyId).single();
      if (data?.pages && Array.isArray(data.pages) && data.pages.length > 0) return true;
      await new Promise((r) => setTimeout(r, 2000));
    }
    return false;
  };

  const handleGenerateStory = async (childId: string) => {
    if (generatingLock.current) return;
    generatingLock.current = true;
    const child = children.find(c => c.id === childId);
    setGeneratingName(child?.name || '');
    setGenerating(`new-${childId}`); setGenerateError(''); setDailyLimitChild(null);
    try {
      const res = await fetch('/api/generate-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ child_id: childId }) });
      const data = await res.json();
      if (res.status === 402) { setPaywallReason(data.reason); return; }
      if (res.status === 429) { const child = children.find(c => c.id === childId); setDailyLimitChild(child?.name || 'your child'); return; }
      if (!res.ok) { setGenerateError(data.error || data.message || 'Something went wrong. Please try again.'); return; }
      const storyId = data.story?.id;
      if (!storyId) { await fetchData(); return; }
      setWritingStoryIds(prev => new Set([...prev, storyId]));
      // Keep the writing overlay up until the text is actually written, so we don't
      // flash confetti + drop the user on the dashboard before the book exists.
      await waitForStoryText(storyId);
      await fetchData();
      setShowConfetti(true);
      // Book is now text-ready and clickable; images keep loading via polling
    } finally { setGenerating(null); generatingLock.current = false; }
  };

  const handleContinueStory = async (storyId: string) => {
    if (generatingLock.current) return;
    generatingLock.current = true;
    const storyRef = stories.find(s => s.id === storyId);
    if (!storyRef) return;
    const childName = storyRef.children?.name || '';
    setGeneratingName(childName);
    setGenerating(`sequel-${storyId}`); setGenerateError(''); setDailyLimitChild(null);
    try {
      const res = await fetch('/api/generate-sequel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: storyId }) });
      const data = await res.json();
      if (res.status === 402) { setPaywallReason(data.reason); return; }
      if (res.status === 429) { const sr = stories.find(s => s.id === storyId); const chName = sr?.children?.name || 'your child'; setDailyLimitChild(chName); return; }
      if (!res.ok) { setGenerateError(data.error || 'Something went wrong.'); return; }
      const newStoryId = data.story?.id;
      if (!newStoryId) { await fetchData(); return; }
      setWritingStoryIds(prev => new Set([...prev, newStoryId]));
      await waitForStoryText(newStoryId);
      await fetchData();
      setShowConfetti(true);
      // Book is now text-ready and clickable; images keep loading via polling
    } finally { setGenerating(null); generatingLock.current = false; }
  };

  const handleBuyExtraBook = async () => {
    if (!(await verifyParent())) return;
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'extra_book' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setGenerateError('Could not start checkout. Please try again.');
    } catch {
      setGenerateError('Could not start checkout. Please try again.');
    }
  };

  // Tour steps - defined here so they can reference pendingTourChildName
  const tourSteps: TourStep[] = [
    {
      title: pendingTourChildName ? `${pendingTourChildName}'s story is ready! 🎉` : 'Welcome to TalePop! 🎉',
      body: "Your first personalised story has been written. Let us give you a quick tour so you know your way around.",
      targetId: null,
    },
    {
      title: 'Your bookshelf',
      body: "Every story lives here. Click any book cover to open it and read with your child. Illustrations generate as you flip through.",
      targetId: 'tour-shelf',
    },
    {
      title: 'Write new stories',
      body: "Tap 'New story' whenever you want a fresh adventure. Each book is uniquely crafted around your child's interests, age, and reading level.",
      targetId: 'tour-new-story',
    },
    {
      title: 'Continue the series',
      body: "Loved a story? Tap 'Next chapter' on any book to add a new volume. Each child can have up to 3 chapters, building their very own series.",
      targetId: 'tour-next-chapter',
    },
    {
      title: 'Children profiles',
      body: "Head to Children to add more kids or update their details like interests, appearance, and reading level, so every story feels truly personal.",
      targetId: 'tour-children-nav',
    },
  ];

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
  ];

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstChild = children[0];
  const mostRecentStory = stories[0];
  const mostRecentCover = mostRecentStory?.pages?.[0]?.image_url;
  const mostRecentChildIndex = mostRecentStory ? children.findIndex(c => c.name === mostRecentStory.children?.name) : 0;
  const mostRecentPalette = CHILD_PALETTES[Math.max(0, mostRecentChildIndex) % CHILD_PALETTES.length];

  return (
    <div style={{ minHeight: '100vh', background: '#FFF4E6' }}>
      <style>{pageStyles}</style>

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      {paywallReason && <PaywallModal reason={paywallReason} onClose={() => setPaywallReason(null)} />}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          palette={CHILD_PALETTES[children.findIndex(c => c.id === editingChild.id) % CHILD_PALETTES.length]}
          onClose={() => setEditingChild(null)}
          onSaved={fetchData}
        />
      )}

      {/* Product tour */}
      {showTour && (
        <ProductTour
          steps={tourSteps}
          pendingStoryId={pendingTourStoryId || undefined}
          onDone={(navigateTo) => {
            setShowTour(false);
            supabase.from('user_subscriptions').update({ has_seen_tour: true }).eq('user_id', userId).then(() => {});
            if (navigateTo) router.push(navigateTo);
          }}
        />
      )}

      {generating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,8,0.93)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ fontSize: '4rem', animation: 'writing-pulse 1.4s ease-in-out infinite' }}>
            {generating.startsWith('painting') ? '🎨' : '✨'}
          </div>
          <p style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', color: '#FFB703', textAlign: 'center', lineHeight: 1.3 }}>
            {generating.startsWith('painting') ? 'Painting the illustrations...' : generating.startsWith('sequel') ? `Writing the next adventure for ${generatingName}!` : `Writing ${generatingName}'s story...`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', animation: 'writing-pulse 2s ease infinite' }}>Usually takes about 30 seconds</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB703', animation: `writing-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {/* Top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFF4E6', borderBottom: '2px solid #F0E4D0', padding: 'var(--safe-top) calc(1.5rem + var(--safe-right)) 0 calc(1.5rem + var(--safe-left))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'calc(68px + var(--safe-top))', gap: '12px' }}>
        <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src="/mood-3.png" alt="TalePop" style={{ height: '52px', width: 'auto' }} />
        </a>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(13,24,61,0.06)', borderRadius: '999px', padding: '4px' }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  id={`tour-${id}-nav`}
                  className="top-nav-tab"
                  onClick={() => setActiveNav(id)}
                  style={{ background: active ? '#0D183D' : 'transparent', color: active ? '#fff' : '#5E6A7A' }}
                >
                  <Icon size={15} />{label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {sub && !isMobile && sub.status !== 'subscribed' && freeStoriesRemaining > 0 && !isAdmin && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', background: '#FFF0E6', color: '#FF6B35' }}>
              {freeStoriesRemaining} free {freeStoriesRemaining === 1 ? 'story' : 'stories'} left
            </span>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', background: 'white', border: '1.5px solid #F0E4D0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ padding: isMobile ? '24px 16px 100px' : '40px 48px 60px', maxWidth: '1400px', margin: '0 auto' }}>

        {!loading && children.length > 0 && activeNav === 'stories' && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#0D183D', fontWeight: '400', marginBottom: '6px' }}>
              {timeGreeting}, {firstChild?.name}! {hour >= 18 ? '🌙' : hour >= 12 ? '☀️' : '🌟'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <p style={{ color: '#5E6A7A', fontSize: '0.95rem' }}>
                {stories.length === 0 ? 'Your library is waiting for its first story.' : `${stories.length} ${stories.length === 1 ? 'book' : 'books'} in the library`}
              </p>
              {sub && sub.status === 'subscribed' && (
                <>
                  <span style={{ color: '#D1D5DB', fontSize: '0.8rem' }}>·</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: childrenAvailableToday > 0 ? '#F0FDF4' : '#F9FAFB', color: childrenAvailableToday > 0 ? '#15803D' : '#9CA8B4', border: `1px solid ${childrenAvailableToday > 0 ? '#BBF7D0' : '#E5E7EB'}` }}>
                    {childrenAvailableToday}/{children.length} {children.length === 1 ? 'child' : 'children'} available today
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                    1 story per child · resets midnight
                  </span>
                </>
              )}
              {sub && sub.status !== 'subscribed' && freeStoriesRemaining > 0 && !isAdmin && (
                <>
                  <span style={{ color: '#D1D5DB', fontSize: '0.8rem' }}>·</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
                    {freeStoriesRemaining} free {freeStoriesRemaining === 1 ? 'story' : 'stories'} left
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {activeNav === 'stories' && (
          <>
            {dailyLimitChild && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌙</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#92400E', marginBottom: '2px' }}>{dailyLimitChild}&apos;s story for today is done!</div>
                  <div style={{ fontSize: '0.82rem', color: '#B45309' }}>Each child gets one new story per day. A fresh story unlocks at midnight — or grab an extra one now for 99¢.</div>
                </div>
                <button onClick={() => setDailyLimitChild(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', fontSize: '1.1rem', padding: '4px', flexShrink: 0 }}>✕</button>
              </div>
            )}
            {generateError && <div style={{ background: '#FEE2E2', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.875rem', color: '#991B1B' }}>{generateError}</div>}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '80px 0' }}>
                <div style={{ fontSize: '3rem', animation: 'writing-pulse 1.2s ease-in-out infinite' }}>📚</div>
                <p style={{ color: '#5E6A7A', fontFamily: 'Fredoka, cursive', fontSize: '1.1rem' }}>Loading your library...</p>
              </div>
            ) : children.length === 0 ? (
              <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '60px auto 0' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px', animation: 'writing-pulse 2s ease-in-out infinite' }}>📖</div>
                <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.6rem', color: '#0D183D', marginBottom: '8px' }}>Your library is empty!</h3>
                <p style={{ color: '#5E6A7A', marginBottom: '24px', lineHeight: 1.6 }}>Let&apos;s create a child&apos;s profile and write their very first story.</p>
                <Link href="/onboarding" style={{ display: 'inline-block', padding: '0.85rem 2rem', background: '#FF6B35', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 16px rgba(255,107,53,0.35)' }}>Let&apos;s get started!</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                {/* Continue reading hero */}
                {mostRecentStory && (
                  <div className="continue-card" onClick={() => router.push(`/stories/${mostRecentStory.id}`)}
                    style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', height: isMobile ? '180px' : '220px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backgroundImage: 'url(/continue-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {mostRecentCover && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mostRecentCover})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.35 }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(30,10,0,0.82) 0%, rgba(20,6,0,0.55) 45%, rgba(0,0,0,0.08) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '24px', left: '28px' }}>
                      <p style={{ color: 'rgba(255,210,140,0.85)', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.12em', marginBottom: '6px', textTransform: 'uppercase' }}>
                        ▶ Continue reading · {mostRecentStory.children?.name}
                      </p>
                      <p style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: '#fff', marginBottom: '14px', lineHeight: 1.2, maxWidth: '400px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {mostRecentStory.title}
                      </p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FF6B35', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.875rem', boxShadow: '0 2px 12px rgba(255,107,53,0.5)' }}>
                        Keep reading →
                      </span>
                    </div>
                  </div>
                )}

                {/* Child shelves */}
                {children.map((child, childIndex) => {
                  const palette = CHILD_PALETTES[childIndex % CHILD_PALETTES.length];
                  const shelf = buildShelf(stories, child.name);
                  const canContinue = storiesByChild(child.id).length > 0 && !isSeriesComplete(child.id);
                  const latestStory = storiesByChild(child.id)[0];
                  const seriesStoriesForChild = latestStory?.series_id ? storiesByChild(child.id).filter(s => s.series_id === latestStory.series_id) : [];
                  const nextVolForChild = latestStory?.series_id ? (seriesStoriesForChild.length + 1) : 2;

                  return (
                    <div key={child.id}>
                      <div style={{ background: palette.light, borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{palette.emoji}</span>
                          <div>
                            <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.3rem', color: '#0D183D', fontWeight: '400', marginBottom: '2px' }}>{child.name}&apos;s Library</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ fontSize: '0.78rem', color: '#5E6A7A' }}>{storiesByChild(child.id).length} {storiesByChild(child.id).length === 1 ? 'story' : 'stories'}</p>
                            {sub?.status === 'subscribed' && (
                              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: childStoriesUsedToday.has(child.name) ? '#F3F4F6' : '#F0FDF4', color: childStoriesUsedToday.has(child.name) ? '#9CA8B4' : '#15803D', border: `1px solid ${childStoriesUsedToday.has(child.name) ? '#E5E7EB' : '#BBF7D0'}` }}>
                                {childStoriesUsedToday.has(child.name) ? '✓ Story used today' : '⚡ Story ready'}
                              </span>
                            )}
                          </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {sub?.status === 'subscribed' && childStoriesUsedToday.has(child.name) ? (
                            <button onClick={handleBuyExtraBook} disabled={!!generating}
                              style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '2px solid #FF6B35', background: '#FF6B35', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Plus size={14} /> Extra story
                            </button>
                          ) : (
                            <button
                              id={childIndex === 0 ? 'tour-new-story' : undefined}
                              onClick={() => handleGenerateStory(child.id)}
                              disabled={!!generating}
                              style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `2px solid ${palette.cover}`, background: 'white', color: palette.cover, cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Plus size={14} /> New story
                            </button>
                          )}
                        </div>
                      </div>

                      {shelf.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA8B4', fontSize: '0.9rem' }}>
                          No stories yet. Hit &quot;New story&quot; to write the first one!
                        </div>
                      ) : (
                        <div style={{ background: `linear-gradient(to bottom, ${palette.light}88, ${palette.light}22)`, borderRadius: '16px 16px 0 0', padding: '24px 24px 0' }} id={childIndex === 0 ? 'tour-shelf' : undefined}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 20px', alignItems: 'flex-end', paddingBottom: '20px' }}>
                            {shelf.map(item =>
                              item.type === 'single'
                                ? <BookCard key={item.story.id} story={item.story} palette={palette} onContinue={!generating && !writingStoryIds.has(item.story.id) ? () => handleContinueStory(item.story.id) : undefined} isWriting={writingStoryIds.has(item.story.id)} />
                                : item.volumes.length === 1
                                  ? <BookCard key={item.seriesId} story={item.volumes[0]} palette={palette} onContinue={!generating && !writingStoryIds.has(item.volumes[0].id) ? () => handleContinueStory(item.volumes[0].id) : undefined} isWriting={writingStoryIds.has(item.volumes[0].id)} />
                                  : <SeriesFan key={item.seriesId} volumes={item.volumes} palette={palette} onContinue={item.volumes.length < 4 && !generating ? () => handleContinueStory(item.volumes[item.volumes.length - 1].id) : undefined} />
                            )}
                          </div>
                          <div style={{ height: '14px', background: 'linear-gradient(to bottom, #D4974E 0%, #A87240 50%, #8B5E30 100%)', borderRadius: '0 0 4px 4px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.12), 0 5px 12px rgba(0,0,0,0.2)' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeNav === 'children' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400' }}>Children</h3>
              {(() => {
                const extraSlots = sub?.extra_child_slots ?? 0;
                const hasSlot = isAdmin || children.length < 1 + extraSlots;
                if (hasSlot) {
                  return (
                    <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', background: '#0D183D', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add child
                    </Link>
                  );
                }
                return (
                  <button
                    onClick={async () => {
                      if (!(await verifyParent())) return;
                      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'extra_child', locale: navigator.language || 'en-AU' }) });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', background: '#0D183D', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> Add child <span style={{ fontSize: '0.7rem', opacity: 0.75, marginLeft: '2px' }}>$3.99/mo</span>
                  </button>
                );
              })()}
            </div>
            {children.length === 0 ? <p style={{ color: '#5E6A7A' }}>No children added yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children.map((child, i) => {
                  const palette = CHILD_PALETTES[i % CHILD_PALETTES.length];
                  return (
                    <div key={child.id} style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${palette.cover}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{palette.emoji}</span>
                          <h4 style={{ fontFamily: 'Fredoka, cursive', fontWeight: '600', color: '#0D183D' }}>{child.name}</h4>
                        </div>
                        <button onClick={() => setEditingChild(child as ChildRecord)} style={{ fontSize: '0.75rem', fontWeight: '600', color: palette.cover, background: palette.light, border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                      </div>
                      <p style={{ color: '#5E6A7A', fontSize: '0.875rem', marginBottom: child.interests?.length ? '12px' : 0, paddingLeft: '34px' }}>Age {child.age}</p>
                      {child.interests?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: '34px' }}>
                          {child.interests.slice(0, 6).map(interest => (
                            <span key={interest} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: palette.light, color: palette.cover, fontWeight: '500' }}>{interest}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeNav === 'account' && (
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '16px' }}>Account</h3>
              <div style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.72rem', color: '#5E6A7A', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Signed in as</p>
                <p style={{ fontWeight: '600', color: '#0D183D', fontSize: '0.95rem' }}>{userEmail || (firstChild?.name ? `${firstChild.name}'s family` : 'Your account')}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button onClick={() => { setAccountSection(accountSection === 'email' ? null : 'email'); setAccountMsg(null); }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: accountSection === 'email' ? '#FFF0E6' : '#fff', color: '#0D183D', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                  Change email
                </button>
                <button onClick={() => { setAccountSection(accountSection === 'password' ? null : 'password'); setAccountMsg(null); }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: accountSection === 'password' ? '#FFF0E6' : '#fff', color: '#0D183D', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                  Change password
                </button>
              </div>
              {accountSection && (
                <div style={{ background: '#FFF8F3', border: '1.5px solid #F0E4D0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  {accountSection === 'email' ? (
                    <>
                      <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '10px' }}>Enter a new email address. We&apos;ll send a confirmation link.</p>
                      <input type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                      <button disabled={accountLoading || !newEmail} onClick={async () => {
                        setAccountLoading(true); setAccountMsg(null);
                        const { error } = await supabase.auth.updateUser({ email: newEmail });
                        setAccountLoading(false);
                        setAccountMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Confirmation sent. Check your new inbox.' });
                        if (!error) setNewEmail('');
                      }} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', opacity: accountLoading || !newEmail ? 0.5 : 1 }}>
                        {accountLoading ? 'Sending…' : 'Send confirmation'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '10px' }}>Choose a new password (minimum 8 characters).</p>
                      <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
                      <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                      <button disabled={accountLoading || newPassword.length < 8 || newPassword !== confirmPassword} onClick={async () => {
                        setAccountLoading(true); setAccountMsg(null);
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        setAccountLoading(false);
                        setAccountMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Password updated successfully.' });
                        if (!error) { setNewPassword(''); setConfirmPassword(''); setAccountSection(null); }
                      }} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', opacity: (accountLoading || newPassword.length < 8 || newPassword !== confirmPassword) ? 0.5 : 1 }}>
                        {accountLoading ? 'Updating…' : 'Update password'}
                      </button>
                    </>
                  )}
                  {accountMsg && (
                    <p style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: '600', color: accountMsg.ok ? '#1a7a4a' : '#cc2200' }}>{accountMsg.text}</p>
                  )}
                </div>
              )}
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: '#fff', color: '#FF6B35', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                Sign out
              </button>
            </div>

            {/* Subscription */}
            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '16px' }}>Subscription</h3>
              <div style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: sub?.status === 'subscribed' ? '12px' : '0' }}>
                  <p style={{ fontWeight: '600', color: '#0D183D', fontSize: '0.95rem' }}>Current plan</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: isAdmin ? '#EDE9FE' : sub?.status === 'subscribed' ? '#E6F4EC' : '#FFF0E6', color: isAdmin ? '#6D28D9' : sub?.status === 'subscribed' ? '#1a7a4a' : '#FF6B35' }}>
                    {isAdmin ? 'Admin' : sub?.status === 'subscribed' ? 'Active' : 'Free'}
                  </span>
                </div>
                {sub?.status === 'subscribed' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#5E6A7A', fontSize: '0.875rem' }}>Children on plan</p>
                    <span style={{ fontWeight: '700', color: '#0D183D' }}>{children.length}</span>
                  </div>
                )}
                {!sub?.status && !isAdmin && (
                  <p style={{ color: '#5E6A7A', fontSize: '0.875rem', marginTop: '8px' }}>
                    {freeStoriesRemaining} free {freeStoriesRemaining === 1 ? 'story' : 'stories'} remaining. Subscribe for a new story every night.
                  </p>
                )}
              </div>
              {sub?.status === 'subscribed' || isAdmin ? (
                <button onClick={async () => { if (!(await verifyParent())) return; const res = await fetch('/api/stripe/portal', { method: 'POST' }); const d = await res.json(); if (d.url) window.location.href = d.url; }}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #FF6B35', background: '#fff', color: '#FF6B35', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                  Manage billing
                </button>
              ) : isAdmin ? null : (
                <button onClick={() => setPaywallReason('free_exhausted')}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none', background: '#FF6B35', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                  Subscribe - from A$9.99/month
                </button>
              )}
            </div>

            {/* Referral */}
            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '8px' }}>Refer a friend 🎁</h3>
              <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '12px' }}>Share your code. Your friend gets <strong>10% off</strong> their first month.</p>
              <div style={{ background: '#fff', border: '1.5px solid #F0E4D0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '0.12em', color: '#FF6B35' }}>
                  {userId ? `TALE-${userId.replace(/-/g,'').slice(0,8).toUpperCase()}` : 'N/A'}
                </span>
                <button onClick={() => {
                  const code = `TALE-${userId.replace(/-/g,'').slice(0,8).toUpperCase()}`;
                  navigator.clipboard.writeText(code).then(() => { setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); });
                }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: referralCopied ? '#1a7a4a' : '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                  {referralCopied ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>



          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 'calc(72px + var(--safe-bottom))', paddingBottom: 'var(--safe-bottom)', background: '#fff', borderTop: '2px solid #F0E4D0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 40 }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} id={`tour-${id}-nav-mobile`} onClick={() => setActiveNav(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', border: 'none', background: 'none', cursor: 'pointer', color: active ? '#FF6B35' : '#9CA8B4', padding: '8px 12px', flex: 1 }}>
                <Icon size={22} />
                <span style={{ fontSize: '0.6rem', fontWeight: active ? '700' : '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


