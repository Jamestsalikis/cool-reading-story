'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
}

// Supabase public URL for Fable images
// These are generated once via /api/admin/generate-fable and stored permanently
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
function fableImageUrl(pose: FablePose): string {
  return `${SUPABASE_URL}/storage/v1/object/public/story-images/fable-${pose}.webp`;
}

const fableStyles = `
  @keyframes fableFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(8px) scale(0.94); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fablePulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  .fable-img {
    animation: fableFloat 3.5s ease-in-out infinite;
    filter: drop-shadow(0 8px 20px rgba(116,21,21,0.15));
  }
  .fable-dot-1 { animation: fablePulse 1.4s ease infinite 0s; }
  .fable-dot-2 { animation: fablePulse 1.4s ease infinite 0.25s; }
  .fable-dot-3 { animation: fablePulse 1.4s ease infinite 0.5s; }
`;

function DialogueBubble({ text }: { text: string }) {
  return (
    <div style={{
      position: 'relative',
      background: '#FFFEF9',
      border: '2px solid #E8E0D0',
      borderRadius: '14px',
      padding: '10px 16px',
      maxWidth: '240px',
      fontSize: '0.875rem',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#1C1614',
      lineHeight: 1.55,
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      animation: 'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      textAlign: 'center',
    }}>
      {text}
      <div style={{ position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '11px solid #E8E0D0' }} />
      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #FFFEF9' }} />
    </div>
  );
}

// SVG fallback — used while images are loading or if generation hasn't run yet
function FableSVGFallback({ size }: { size: number }) {
  const s = size / 160;
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 160 248" style={{ animation: 'fableFloat 3.5s ease-in-out infinite', filter: 'drop-shadow(0 8px 20px rgba(116,21,21,0.15))' }}>
      {/* Simple silhouette placeholder while real image loads */}
      <ellipse cx="80" cy="230" rx="38" ry="6" fill="rgba(0,0,0,0.06)" />
      <rect x="62" y="185" width="14" height="45" rx="7" fill="#741515" />
      <rect x="84" y="185" width="14" height="45" rx="7" fill="#741515" />
      <ellipse cx="69" cy="228" rx="11" ry="6" fill="#1A0A05" />
      <ellipse cx="91" cy="228" rx="11" ry="6" fill="#1A0A05" />
      <path d="M42 100 Q36 140 40 190 Q60 198 80 198 Q100 198 120 190 Q124 140 118 100 Q108 90 80 88 Q52 90 42 100Z" fill="#741515" />
      <rect x="72" y="82" width="16" height="12" rx="4" fill="#D4956A" />
      <ellipse cx="80" cy="55" rx="30" ry="32" fill="#D4956A" />
      {/* Hair */}
      <ellipse cx="80" cy="40" rx="32" ry="20" fill="#1A0A05" />
      <ellipse cx="53" cy="58" rx="13" ry="18" fill="#1A0A05" />
      <ellipse cx="107" cy="58" rx="13" ry="18" fill="#1A0A05" />
      {/* Eyes */}
      <ellipse cx="72" cy="56" rx="6" ry="7" fill="#1A0A05" />
      <ellipse cx="88" cy="56" rx="6" ry="7" fill="#1A0A05" />
      <circle cx="74" cy="53" r="2.5" fill="white" />
      <circle cx="90" cy="53" r="2.5" fill="white" />
      {/* Glasses */}
      <circle cx="72" cy="56" r="9" fill="none" stroke="#8B6040" strokeWidth="2" />
      <circle cx="88" cy="56" r="9" fill="none" stroke="#8B6040" strokeWidth="2" />
      <line x1="81" y1="56" x2="79" y2="56" stroke="#8B6040" strokeWidth="2" />
      {/* Smile */}
      <path d="M73 68 Q80 74 87 68" stroke="#8B4513" strokeWidth="2" fill="rgba(200,80,60,0.15)" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="62" cy="64" rx="8" ry="5" fill="rgba(215,90,55,0.2)" />
      <ellipse cx="98" cy="64" rx="8" ry="5" fill="rgba(215,90,55,0.2)" />
      {/* Wave arm */}
      <path d="M42 108 Q22 88 18 68" stroke="#741515" strokeWidth="16" strokeLinecap="round" fill="none" />
      <ellipse cx="16" cy="62" rx="10" ry="11" fill="#D4956A" />
      {/* Book arm */}
      <path d="M118 108 Q132 128 136 148" stroke="#741515" strokeWidth="16" strokeLinecap="round" fill="none" />
      <rect x="128" y="148" width="24" height="18" rx="3" fill="#1A3A5A" />
    </svg>
  );
}

export default function Fable({ pose = 'welcome', dialogue, size = 160 }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setShowBubble(false);
    setDisplayText('');
    if (!dialogue) return;
    const t1 = setTimeout(() => {
      setShowBubble(true);
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayText(dialogue.slice(0, i));
        if (i >= dialogue.length) clearInterval(iv);
      }, 25);
      return () => clearInterval(iv);
    }, 250);
    return () => clearTimeout(t1);
  }, [dialogue, pose]);

  // Reset image state when pose changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [pose]);

  const imgSrc = fableImageUrl(pose);
  const height = size * 1.55;

  return (
    <>
      <style>{fableStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}

        <div style={{ width: size, height, position: 'relative', flexShrink: 0 }}>
          {/* Real image (hidden until loaded) */}
          <img
            key={pose}
            src={imgSrc}
            alt={`Fable — ${pose}`}
            className="fable-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: imageLoaded && !imageError ? 'block' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(false); }}
          />
          {/* SVG fallback shown while loading or if no image generated yet */}
          {(!imageLoaded || imageError) && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FableSVGFallback size={size} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
