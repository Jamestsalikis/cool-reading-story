'use client';

import { useState, useEffect } from 'react';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
  darkBackground?: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
function fableImageUrl(pose: FablePose): string {
  // Map poses we don't have to nearest available
  const available: Record<FablePose, string> = {
    welcome: 'welcome',
    excited: 'welcome',
    thinking: 'writing',
    writing: 'writing',
    painting: 'painting',
    finished: 'welcome',
  };
  return `${SUPABASE_URL}/storage/v1/object/public/story-images/fable-${available[pose]}.webp`;
}

const styles = `
  @keyframes fabBody {
    0%,100% { transform: translateY(0)   rotate(0deg);    }
    20%      { transform: translateY(-7px) rotate(-2deg);   }
    50%      { transform: translateY(-11px) rotate(2deg);  }
    80%      { transform: translateY(-6px) rotate(-1.5deg); }
  }
  @keyframes fabArm {
    0%,100% { transform: rotate(0deg);  }
    25%     { transform: rotate(-35deg); }
    50%     { transform: rotate(-10deg); }
    75%     { transform: rotate(-40deg); }
  }
  @keyframes fabBlink {
    0%,88%,100% { transform: scaleY(1);   }
    92%         { transform: scaleY(0.08); }
  }
  @keyframes fabSpark {
    0%,100% { opacity:0; transform: scale(0.5) rotate(0deg);   }
    50%     { opacity:1; transform: scale(1.2) rotate(180deg);  }
  }
  @keyframes bubbleIn {
    from { opacity:0; transform: translateY(6px) scale(0.95); }
    to   { opacity:1; transform: translateY(0)   scale(1);    }
  }
  .fab-body   { animation: fabBody 3.8s ease-in-out infinite; transform-origin: center bottom; }
  .fab-arm    { animation: fabArm 1.6s ease-in-out infinite;  transform-origin: 12px 8px; }
  .fab-blink  { animation: fabBlink 4s ease-in-out infinite;  transform-origin: center center; }
  .fab-sp1    { animation: fabSpark 2.2s ease-in-out infinite 0s;    }
  .fab-sp2    { animation: fabSpark 2.2s ease-in-out infinite 0.7s;  }
  .fab-sp3    { animation: fabSpark 2.2s ease-in-out infinite 1.4s;  }
`;

// ── Fully CSS/SVG Fable — animated arm, blinking eyes, sparkles ─────────────
function FableAnimated({ size, pose }: { size: number; pose: FablePose }) {
  const s = size / 180; // scale factor
  const isWriting = pose === 'writing';
  const isPainting = pose === 'painting';

  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 180 270"
      className="fab-body"
      style={{ overflow: 'visible' }}
    >
      {/* Sparkles */}
      <g className="fab-sp1" style={{ transformOrigin: '22px 80px' }}>
        <text x="14" y="84" fontSize="16" fill="#F4C542">✦</text>
      </g>
      <g className="fab-sp2" style={{ transformOrigin: '158px 65px' }}>
        <text x="150" y="70" fontSize="12" fill="#F4C542">✦</text>
      </g>
      <g className="fab-sp3" style={{ transformOrigin: '155px 100px' }}>
        <text x="149" y="104" fontSize="9" fill="#F4C542">✦</text>
      </g>

      {/* Shadow */}
      <ellipse cx="90" cy="262" rx="42" ry="6" fill="rgba(0,0,0,0.08)" />

      {/* LEGS */}
      <rect x="72" y="200" width="16" height="55" rx="8" fill="#741515" />
      <rect x="92" y="200" width="16" height="55" rx="8" fill="#741515" />
      <ellipse cx="80" cy="252" rx="13" ry="7" fill="#1A0A05" />
      <ellipse cx="100" cy="252" rx="13" ry="7" fill="#1A0A05" />

      {/* BODY - cardigan */}
      <path d="M48 118 Q40 158 44 208 Q66 216 90 216 Q114 216 136 208 Q140 158 132 118 Q120 106 90 104 Q60 106 48 118Z" fill="#741515" />
      {/* Cardigan details */}
      <path d="M84 104 L90 138 L96 104" fill="#4d0e0e" opacity="0.5" />
      <path d="M86 104 Q90 118 94 104 Q91 97 90 95 Q89 97 86 104Z" fill="#FFF5E4" />
      {[168,186,206].map(y => <circle key={y} cx="90" cy={y} r="3.5" fill="#4d0e0e" />)}

      {/* LEFT ARM - static, holding book */}
      <path d="M50 122 Q34 148 30 172" stroke="#741515" strokeWidth="20" strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="178" rx="12" ry="13" fill="#D4956A" />
      {/* Book */}
      <rect x="18" y="186" width="26" height="20" rx="3" fill="#1A3A5A" />
      <rect x="20" y="188" width="10" height="16" rx="1" fill="#2A4A6A" />
      <line x1="30" y1="189" x2="30" y2="203" stroke="#0A2030" strokeWidth="1" />

      {/* RIGHT ARM - WAVING (animated separately) */}
      <g className="fab-arm" style={{ transformOrigin: '130px 125px' }}>
        <path d="M130 122 Q148 100 155 78" stroke="#741515" strokeWidth="20" strokeLinecap="round" fill="none" />
        <ellipse cx="156" cy="73" rx="13" ry="14" fill="#D4956A" />
        {/* Fingers spread */}
        <ellipse cx="148" cy="63" rx="5" ry="8" fill="#D4956A" />
        <ellipse cx="156" cy="60" rx="5" ry="8" fill="#D4956A" />
        <ellipse cx="163" cy="63" rx="5" ry="8" fill="#D4956A" />
      </g>

      {/* NECK */}
      <rect x="82" y="96" width="16" height="13" rx="4" fill="#D4956A" />

      {/* HAIR back */}
      <ellipse cx="90" cy="60" rx="38" ry="44" fill="#1A0A05" />

      {/* HEAD */}
      <ellipse cx="90" cy="58" rx="32" ry="36" fill="#D4956A" />

      {/* GLASSES */}
      <circle cx="78" cy="58" r="11" fill="none" stroke="#5A3A20" strokeWidth="2.5" />
      <circle cx="102" cy="58" r="11" fill="none" stroke="#5A3A20" strokeWidth="2.5" />
      <line x1="89" y1="58" x2="91" y2="58" stroke="#5A3A20" strokeWidth="2.5" />
      <line x1="67" y1="56" x2="62" y2="54" stroke="#5A3A20" strokeWidth="2" />
      <line x1="113" y1="56" x2="118" y2="54" stroke="#5A3A20" strokeWidth="2" />

      {/* HAIR front curls */}
      <circle cx="60" cy="46" r="15" fill="#1A0A05" />
      <circle cx="56" cy="66" r="12" fill="#1A0A05" />
      <circle cx="120" cy="46" r="15" fill="#1A0A05" />
      <circle cx="124" cy="66" r="12" fill="#1A0A05" />
      <circle cx="76" cy="28" r="14" fill="#1A0A05" />
      <circle cx="90" cy="22" r="13" fill="#1A0A05" />
      <circle cx="104" cy="28" r="14" fill="#1A0A05" />

      {/* EYEBROWS */}
      <path d="M70 46 Q78 41 86 45" stroke="#1A0A05" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M94 45 Q102 41 110 46" stroke="#1A0A05" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* EYES with blink */}
      <g className="fab-blink">
        <ellipse cx="78" cy="58" rx="7" ry="8" fill="#1A0A05" />
        <ellipse cx="102" cy="58" rx="7" ry="8" fill="#1A0A05" />
      </g>
      <circle cx="81" cy="55" r="2.5" fill="white" />
      <circle cx="105" cy="55" r="2.5" fill="white" />

      {/* NOSE */}
      <path d="M88 70 Q90 74 92 70" stroke="#B87848" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* CHEEKS */}
      <ellipse cx="66" cy="68" rx="10" ry="6" fill="rgba(215,90,55,0.22)" />
      <ellipse cx="114" cy="68" rx="10" ry="6" fill="rgba(215,90,55,0.22)" />

      {/* SMILE */}
      <path d="M80 80 Q90 90 100 80" stroke="#8B4513" strokeWidth="2.2" fill="rgba(200,80,60,0.15)" strokeLinecap="round" />

      {/* Writing extras */}
      {isWriting && (
        <g opacity="0.7">
          <path d="M22 192 L46 192" stroke="#C4784A" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 198 L46 198" stroke="#C4784A" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 204 L38 204" stroke="#C4784A" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Painting brush */}
      {isPainting && (
        <g style={{ transformOrigin: '156px 73px' }} className="fab-arm">
          <rect x="152" y="48" width="5" height="26" rx="2" fill="#8B6040" />
          <ellipse cx="154.5" cy="48" rx="5" ry="7" fill="#741515" />
          <circle cx="152" cy="46" r="3" fill="#C4784A" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}

// ── Dialogue bubble ───────────────────────────────────────────────────────────
function DialogueBubble({ text }: { text: string }) {
  return (
    <div style={{
      position: 'relative', background: '#FFFEF9', border: '2px solid #E8E0D0',
      borderRadius: '14px', padding: '10px 16px', maxWidth: '240px',
      fontSize: '0.875rem', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      color: '#1C1614', lineHeight: 1.55, boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      animation: 'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)', textAlign: 'center',
    }}>
      {text}
      <div style={{ position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '11px solid #E8E0D0' }} />
      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #FFFEF9' }} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Fable({ pose = 'welcome', dialogue, size = 160, darkBackground = false }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble] = useState(false);

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

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}
        <FableAnimated size={size} pose={pose} />
      </div>
    </>
  );
}
