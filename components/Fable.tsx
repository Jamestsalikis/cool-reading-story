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
const POSE_MAP: Record<FablePose, string> = {
  welcome: 'welcome', excited: 'welcome', thinking: 'writing',
  writing: 'writing', painting: 'painting', finished: 'welcome',
};
const fableUrl = (pose: FablePose) =>
  `${SUPABASE_URL}/storage/v1/object/public/story-images/fable-${POSE_MAP[pose]}.webp`;

const styles = `
  /* Breathing — chest gently rises, overall subtle scale, slight tilt */
  @keyframes fabBreathe {
    0%,100% { transform: scale(1)     translateY(0px)  rotate(0deg);    }
    15%     { transform: scale(1.008) translateY(-3px) rotate(0.4deg);  }
    30%     { transform: scale(1.014) translateY(-6px) rotate(0.6deg);  }
    50%     { transform: scale(1.010) translateY(-5px) rotate(0deg);    }
    70%     { transform: scale(1.014) translateY(-7px) rotate(-0.5deg); }
    85%     { transform: scale(1.008) translateY(-4px) rotate(-0.3deg); }
  }

  /* Blink — eyelid drops down from top of eye, very fast */
  @keyframes fabBlink {
    0%,89%,100% { transform: scaleY(0);   opacity: 0; }
    91%,97%     { transform: scaleY(1);   opacity: 1; }
  }

  /* Sparkles pulse */
  @keyframes fabSpark {
    0%,100% { opacity:0; transform:scale(0.5) rotate(0deg);   }
    50%     { opacity:1; transform:scale(1.3) rotate(180deg); }
  }

  /* Dialogue bubble */
  @keyframes bubbleIn {
    from { opacity:0; transform:translateY(6px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1);    }
  }

  .fab-body  {
    animation: fabBreathe 4.2s ease-in-out infinite;
    transform-origin: center 60%; /* pivot from chest, not top */
  }
  .fab-sp1 { animation: fabSpark 2.6s ease-in-out infinite 0s;   }
  .fab-sp2 { animation: fabSpark 2.6s ease-in-out infinite 0.9s; }
  .fab-sp3 { animation: fabSpark 2.6s ease-in-out infinite 1.8s; }
  .fab-lid { animation: fabBlink 5s ease-in-out infinite;        }
  .fab-lid2{ animation: fabBlink 5s ease-in-out infinite 0.06s;  }
`;

function DialogueBubble({ text }: { text: string }) {
  return (
    <div style={{
      position: 'relative', background: '#FFFEF9', border: '2px solid #E8E0D0',
      borderRadius: '14px', padding: '10px 16px', maxWidth: '240px',
      fontSize: '0.875rem', fontFamily: 'Georgia,serif', fontStyle: 'italic',
      color: '#1C1614', lineHeight: 1.55, textAlign: 'center',
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      animation: 'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {text}
      <div style={{ position:'absolute', bottom:-11, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'9px solid transparent', borderRight:'9px solid transparent', borderTop:'11px solid #E8E0D0' }} />
      <div style={{ position:'absolute', bottom:-8,  left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'9px solid #FFFEF9' }} />
    </div>
  );
}

export default function Fable({ pose = 'welcome', dialogue, size = 160, darkBackground = false }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setShowBubble(false);
    setDisplayText('');
    if (!dialogue) return;
    const t = setTimeout(() => {
      setShowBubble(true);
      let i = 0;
      const iv = setInterval(() => { i++; setDisplayText(dialogue.slice(0, i)); if (i >= dialogue.length) clearInterval(iv); }, 25);
      return () => clearInterval(iv);
    }, 250);
    return () => clearTimeout(t);
  }, [dialogue, pose]);

  const h = size * 1.55;

  // Eye positions as % of image — calibrated from the welcome.webp render
  // Eyes sit at ~24% from top, left eye ~43% from left, right eye ~56% from left
  // Each eyelid covers ~9% width, ~4.5% height of the image
  const eyeTop  = '23%';
  const lidW    = `${size * 0.09}px`;
  const lidH    = `${h * 0.048}px`;
  const skinTop = '#C8855A';
  const skinBot = '#B87040';

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

        {showBubble && displayText && <DialogueBubble text={displayText} />}

        {/* Outer wrapper — no background, lets mix-blend-mode reach the page */}
        <div style={{ position: 'relative', width: size, height: h, flexShrink: 0 }}>

          {/* The real Fable — breathing + floating */}
          <img
            src={fableUrl(pose)}
            alt="Fable"
            className="fab-body"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              mixBlendMode: darkBackground ? 'normal' : 'multiply',
            }}
          />

          {/* ── Blinking eyelids — positioned over her eyes ── */}
          {/* Left eyelid (viewer's left = her right) */}
          <div
            className="fab-lid"
            style={{
              position: 'absolute',
              top: eyeTop,
              left: '41%',
              width: lidW,
              height: lidH,
              background: `linear-gradient(to bottom, ${skinTop}, ${skinBot})`,
              borderRadius: '0 0 60% 60%',
              transformOrigin: 'top center',
              pointerEvents: 'none',
            }}
          />
          {/* Right eyelid (viewer's right = her left) */}
          <div
            className="fab-lid2"
            style={{
              position: 'absolute',
              top: eyeTop,
              left: '53%',
              width: lidW,
              height: lidH,
              background: `linear-gradient(to bottom, ${skinTop}, ${skinBot})`,
              borderRadius: '0 0 60% 60%',
              transformOrigin: 'top center',
              pointerEvents: 'none',
            }}
          />

          {/* ── Sparkles ── */}
          <span className="fab-sp1" style={{ position:'absolute', top:'5%',  left:'-10%', fontSize: size > 120 ? '1.1rem' : '0.85rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
          <span className="fab-sp2" style={{ position:'absolute', top:'3%',  right:'-6%', fontSize: size > 120 ? '0.85rem' : '0.65rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
          <span className="fab-sp3" style={{ position:'absolute', top:'18%', right:'-12%', fontSize: size > 120 ? '0.65rem' : '0.5rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
        </div>
      </div>
    </>
  );
}
