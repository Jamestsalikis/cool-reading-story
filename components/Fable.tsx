'use client';

import { useState, useEffect } from 'react';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number; // width in px, height scales proportionally
}

const S = '#D4956A';   // skin
const SD = '#B87848';  // skin dark
const H = '#1A0A05';   // hair
const C = '#741515';   // cardigan (brand)
const CD = '#4d0e0e';  // cardigan dark
const CR = '#FFF5E4';  // cream collar
const CH = 'rgba(215,90,55,0.22)'; // cheek blush

const fableStyles = `
  @keyframes fableFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes fableWave {
    0%, 100% { transform: rotate(0deg); transform-origin: 60% 90%; }
    25% { transform: rotate(-18deg); transform-origin: 60% 90%; }
    75% { transform: rotate(12deg); transform-origin: 60% 90%; }
  }
  @keyframes fableWrite {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(8px); }
  }
  @keyframes fableBlink {
    0%, 92%, 100% { scaleY: 1; }
    95% { transform: scaleY(0.1); }
  }
  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(6px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
  }
  @keyframes inkDrop {
    0%, 100% { opacity: 0.6; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.15); }
  }
  .fable-arm-wave { animation: fableWave 1.4s ease-in-out infinite; }
  .fable-arm-write { animation: fableWrite 0.7s ease-in-out infinite; }
  .fable-sparkle-1 { animation: sparkle 2s ease-in-out infinite 0s; }
  .fable-sparkle-2 { animation: sparkle 2s ease-in-out infinite 0.5s; }
  .fable-sparkle-3 { animation: sparkle 2s ease-in-out infinite 1s; }
  .fable-ink { animation: inkDrop 0.9s ease-in-out infinite; }
`;

// ── Dialogue bubble ───────────────────────────────────────────────────────────
function DialogueBubble({ text }: { text: string }) {
  return (
    <div style={{
      position: 'relative',
      background: '#FFFEF9',
      border: '2px solid #E8E0D0',
      borderRadius: '14px',
      padding: '10px 16px',
      maxWidth: '230px',
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
      {/* Tail pointing down toward Fable */}
      <div style={{ position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '11px solid #E8E0D0' }} />
      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #FFFEF9' }} />
    </div>
  );
}

// ── Main Fable SVG ────────────────────────────────────────────────────────────
function FableSVG({ pose }: { pose: FablePose }) {
  // Expression variants
  const isExcited = pose === 'excited';
  const isThinking = pose === 'thinking';
  const isFinished = pose === 'finished';
  const isWriting = pose === 'writing';
  const isPainting = pose === 'painting';

  return (
    <svg viewBox="0 0 200 310" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>

      {/* Ground shadow */}
      <ellipse cx="100" cy="298" rx="46" ry="7" fill="rgba(0,0,0,0.07)" />

      {/* ── BODY ── */}
      {/* Legs */}
      <rect x="80" y="232" width="17" height="58" rx="8" fill={C} />
      <rect x="103" y="232" width="17" height="58" rx="8" fill={C} />
      {/* Shoes */}
      <ellipse cx="88" cy="286" rx="14" ry="8" fill={H} />
      <ellipse cx="112" cy="286" rx="14" ry="8" fill={H} />

      {/* Cardigan body */}
      <path d="M56 125 Q46 170 50 238 Q74 246 100 246 Q126 246 150 238 Q154 170 144 125 Q130 113 100 110 Q70 113 56 125Z" fill={C} />
      {/* Cardigan lapels / centre line */}
      <path d="M93 110 L100 148 L107 110" fill={CD} opacity="0.45" />
      {/* Cream collar */}
      <path d="M90 110 Q100 126 110 110 Q107 102 100 99 Q93 102 90 110Z" fill={CR} />
      {/* Buttons */}
      {[170, 190, 212].map(y => <circle key={y} cx="100" cy={y} r="3.5" fill={CD} />)}
      {/* Cardigan pockets */}
      <rect x="62" y="195" width="22" height="16" rx="4" fill={CD} opacity="0.35" />
      <rect x="116" y="195" width="22" height="16" rx="4" fill={CD} opacity="0.35" />

      {/* ── ARMS ── */}
      {/* LEFT ARM (viewer left = Fable's right) — wave in welcome/excited */}
      {(pose === 'welcome' || pose === 'excited') ? (
        <g className="fable-arm-wave">
          <path d={pose === 'excited' ? 'M62 130 Q38 105 28 82' : 'M62 130 Q42 108 32 88'} stroke={C} strokeWidth="22" strokeLinecap="round" fill="none" />
          <ellipse cx={pose === 'excited' ? 25 : 28} cy={pose === 'excited' ? 76 : 82} rx="13" ry="14" fill={S} />
          {/* Fingers */}
          <ellipse cx={pose === 'excited' ? 18 : 21} cy={pose === 'excited' ? 68 : 74} rx="5" ry="7" fill={S} />
          <ellipse cx={pose === 'excited' ? 26 : 29} cy={pose === 'excited' ? 64 : 70} rx="5" ry="7" fill={S} />
          <ellipse cx={pose === 'excited' ? 33 : 36} cy={pose === 'excited' ? 66 : 72} rx="5" ry="7" fill={S} />
        </g>
      ) : pose === 'thinking' ? (
        // Right arm raised to chin
        <g>
          <path d="M62 132 Q55 155 68 175" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="72" cy="180" rx="13" ry="12" fill={S} />
        </g>
      ) : (
        // Writing/painting/finished — left arm down with prop
        <g className={isWriting ? 'fable-arm-write' : ''}>
          <path d="M62 130 Q48 158 42 182" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="42" cy="188" rx="12" ry="13" fill={S} />
        </g>
      )}

      {/* RIGHT ARM (viewer right = Fable's left) */}
      {isThinking ? (
        // Arm bent up, hand at chin
        <g>
          <path d="M138 130 Q150 150 142 172" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="138" cy="176" rx="12" ry="11" fill={S} />
          {/* Chin resting hand */}
          <path d="M132 84 Q138 90 142 86" stroke={S} strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      ) : isWriting ? (
        // Arm extended forward holding quill
        <g className="fable-arm-write">
          <path d="M138 130 Q160 148 172 170" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="174" cy="174" rx="12" ry="13" fill={S} />
          {/* Quill */}
          <path d="M182 162 Q192 140 188 128" stroke="#F4C542" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M188 128 Q196 118 190 114 Q184 128 182 134Z" fill="#F4C542" />
          {/* Ink drop */}
          <circle cx="182" cy="166" r="3" fill={CD} className="fable-ink" />
        </g>
      ) : isPainting ? (
        // Arm raised with brush
        <g>
          <path d="M138 130 Q158 112 165 92" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="166" cy="87" rx="12" ry="13" fill={S} />
          {/* Paintbrush */}
          <rect x="162" y="62" width="6" height="28" rx="2" fill="#8B6040" transform="rotate(10 165 76)" />
          <ellipse cx="167" cy="63" rx="5" ry="7" fill="#741515" transform="rotate(10 165 76)" />
          {/* Paint splash */}
          <circle cx="180" cy="55" r="4" fill="#741515" opacity="0.5" className="fable-sparkle-1" />
          <circle cx="172" cy="48" r="3" fill="#C4784A" opacity="0.6" className="fable-sparkle-2" />
        </g>
      ) : isFinished ? (
        // Both hands clasped at chest
        <g>
          <path d="M138 130 Q148 160 138 178" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="134" cy="182" rx="12" ry="12" fill={S} />
        </g>
      ) : (
        // Welcome/excited — arm down holding small book
        <g>
          <path d="M138 130 Q156 158 160 180" stroke={C} strokeWidth="20" strokeLinecap="round" fill="none" />
          <ellipse cx="162" cy="185" rx="12" ry="13" fill={S} />
          {/* Small book */}
          <rect x="155" y="196" width="28" height="22" rx="3" fill="#1A3A5A" />
          <rect x="157" y="198" width="11" height="18" rx="1" fill="#2A4A6A" />
          <line x1="168" y1="199" x2="168" y2="215" stroke="#0A2030" strokeWidth="1" />
          {[203, 207, 211].map(y => <line key={y} x1="170" y1={y} x2="181" y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />)}
        </g>
      )}

      {/* Finished pose — clasped hands in front */}
      {isFinished && (
        <ellipse cx="100" cy="185" rx="18" ry="14" fill={S} />
      )}

      {/* ── NECK ── */}
      <rect x="89" y="102" width="22" height="15" rx="5" fill={S} />

      {/* ── HAIR back layer ── */}
      <ellipse cx="100" cy="68" rx="40" ry="46" fill={H} />

      {/* ── HEAD ── */}
      <ellipse cx="100" cy="68" rx="34" ry="38" fill={S} />

      {/* ── HAIR CURLS over face sides + top ── */}
      <circle cx="68" cy="54" r="16" fill={H} />
      <circle cx="62" cy="74" r="13" fill={H} />
      <circle cx="132" cy="54" r="16" fill={H} />
      <circle cx="138" cy="74" r="13" fill={H} />
      <circle cx="84" cy="34" r="15" fill={H} />
      <circle cx="100" cy="28" r="14" fill={H} />
      <circle cx="116" cy="34" r="15" fill={H} />
      {/* Hair highlight */}
      <ellipse cx="95" cy="34" rx="8" ry="5" fill="rgba(80,30,10,0.5)" />

      {/* ── PENCIL in hair ── */}
      <g transform="rotate(-25, 128, 36)">
        <rect x="124" y="22" width="5" height="28" rx="1.5" fill="#F4C542" />
        <polygon points="124,50 129,50 126.5,58" fill={SD} />
        <rect x="124" y="22" width="5" height="6" fill="#E05050" />
        <rect x="124" y="28" width="5" height="3" fill="#DDD" />
      </g>

      {/* ── FACE ── */}
      {/* Eyebrows */}
      <path
        d={isExcited ? 'M78 52 Q88 45 97 50' : isThinking ? 'M78 58 Q88 53 97 57' : 'M79 57 Q88 52 97 56'}
        stroke={H} strokeWidth="2.5" fill="none" strokeLinecap="round"
      />
      <path
        d={isExcited ? 'M103 50 Q112 45 122 52' : isThinking ? 'M103 54 Q112 50 122 57' : 'M103 56 Q112 52 121 57'}
        stroke={H} strokeWidth="2.5" fill="none" strokeLinecap="round"
      />

      {/* Eyes */}
      <ellipse cx="88" cy={isExcited ? 63 : 66} rx="8" ry={isExcited ? 10 : 9} fill={H} />
      <ellipse cx="112" cy={isExcited ? 63 : 66} rx="8" ry={isExcited ? 10 : 9} fill={H} />
      {/* Eye shines */}
      <circle cx="91" cy={isExcited ? 60 : 63} r="3" fill="white" />
      <circle cx="115" cy={isExcited ? 60 : 63} r="3" fill="white" />
      <circle cx="85" cy={isExcited ? 65 : 68} r="1.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="109" cy={isExcited ? 65 : 68} r="1.5" fill="rgba(255,255,255,0.55)" />

      {/* Nose */}
      <path d="M97 77 Q100 81 103 77" stroke={SD} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <ellipse cx="76" cy={isExcited ? 74 : 77} rx="11" ry="6" fill={CH} />
      <ellipse cx="124" cy={isExcited ? 74 : 77} rx="11" ry="6" fill={CH} />

      {/* Mouth — varies by expression */}
      {isFinished ? (
        // Satisfied closed-eye smile
        <path d="M88 88 Q100 98 112 88" stroke="#8B4513" strokeWidth="2.2" fill="rgba(200,80,60,0.15)" strokeLinecap="round" />
      ) : isThinking ? (
        // Thoughtful slightly open
        <path d="M90 88 Q100 93 110 88" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isExcited ? (
        // Big open smile
        <path d="M86 86 Q100 100 114 86" stroke="#8B4513" strokeWidth="2.2" fill="rgba(200,80,60,0.2)" strokeLinecap="round" />
      ) : (
        // Default warm smile
        <path d="M88 88 Q100 97 112 88" stroke="#8B4513" strokeWidth="2.2" fill="rgba(200,80,60,0.15)" strokeLinecap="round" />
      )}

      {/* Finished pose — eyes slightly closed (happy squint) */}
      {isFinished && (
        <>
          <path d="M81 64 Q88 60 95 64" stroke={H} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M105 64 Q112 60 119 64" stroke={H} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ── SPARKLES / STARS ── */}
      <g className="fable-sparkle-1">
        <text x="16" y="108" fontSize="13" fill="#F4C542">✦</text>
      </g>
      <g className="fable-sparkle-2">
        <text x="172" y="94" fontSize="9" fill="#F4C542">✦</text>
      </g>
      <g className="fable-sparkle-3">
        <text x="168" y="114" fontSize="7" fill="#F4C542">✦</text>
      </g>
      {isExcited && (
        <>
          <g className="fable-sparkle-1"><text x="10" y="76" fontSize="10" fill="#F4C542">✦</text></g>
          <g className="fable-sparkle-2"><text x="178" y="72" fontSize="11" fill="#F4C542">✦</text></g>
        </>
      )}

      {/* Writing — floating paper lines */}
      {isWriting && (
        <g opacity="0.7" className="fable-sparkle-1">
          {[0, 8, 16].map((offset, i) => (
            <line key={i} x1="30" y1={192 + offset} x2="58" y2={192 + offset} stroke="#C4784A" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </g>
      )}
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Fable({ pose = 'welcome', dialogue, size = 160 }: FableProps) {
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

  const height = size * (310 / 200);

  return (
    <>
      <style>{fableStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}
        <div style={{ width: size, height, animation: 'fableFloat 3.5s ease-in-out infinite', flexShrink: 0 }}>
          <FableSVG pose={pose} />
        </div>
      </div>
    </>
  );
}
