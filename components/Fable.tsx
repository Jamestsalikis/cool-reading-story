'use client';

import { useState, useEffect } from 'react';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
  darkBackground?: boolean;
}

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/story-images';

// Images stored in Supabase — one per pose/state
const IMGS = {
  welcome:     `${BASE}/fable-welcome.webp`,
  wave:        `${BASE}/fable-welcome-wave.webp`,
  eyesClosed:  `${BASE}/fable-eyes-closed.webp`,
  writing:     `${BASE}/fable-writing.webp`,
  painting:    `${BASE}/fable-painting.webp`,
};

const POSE_BASE: Record<FablePose, string> = {
  welcome:  IMGS.welcome,
  excited:  IMGS.wave,
  thinking: IMGS.writing,
  writing:  IMGS.writing,
  painting: IMGS.painting,
  finished: IMGS.welcome,
};

const styles = `
  @keyframes bubbleIn {
    from { opacity:0; transform:translateY(6px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1);    }
  }
  @keyframes fabFloat {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-8px); }
  }
  @keyframes fabSpark {
    0%,100% { opacity:0; transform:scale(0.5) rotate(0deg);   }
    50%     { opacity:1; transform:scale(1.3) rotate(180deg); }
  }
  .fab-float { animation: fabFloat 3.8s ease-in-out infinite; }
  .fab-sp1   { animation: fabSpark 2.6s ease-in-out infinite 0s;   }
  .fab-sp2   { animation: fabSpark 2.6s ease-in-out infinite 0.9s; }
  .fab-sp3   { animation: fabSpark 2.6s ease-in-out infinite 1.8s; }
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

  // Waving: alternates between base and wave image
  const [waving, setWaving] = useState(false);
  // Blinking: briefly shows eyes-closed image
  const [blinking, setBlinking] = useState(false);

  // Wave animation: arm up for 0.6s, down for 0.8s, repeat
  useEffect(() => {
    if (pose !== 'welcome' && pose !== 'excited') return;
    let t: ReturnType<typeof setTimeout>;
    const doWave = () => {
      setWaving(true);
      t = setTimeout(() => {
        setWaving(false);
        t = setTimeout(doWave, 900 + Math.random() * 600);
      }, 600);
    };
    t = setTimeout(doWave, 1200);
    return () => clearTimeout(t);
  }, [pose]);

  // Blink: eyes shut for 120ms every 3-5 seconds
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const doBlink = () => {
      setBlinking(true);
      t = setTimeout(() => {
        setBlinking(false);
        t = setTimeout(doBlink, 3000 + Math.random() * 2000);
      }, 140);
    };
    t = setTimeout(doBlink, 2000);
    return () => clearTimeout(t);
  }, []);

  // Dialogue typewriter
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
  const blend: React.CSSProperties['mixBlendMode'] = darkBackground ? 'normal' : 'multiply';

  // Which image is on top at any moment
  const baseImg  = POSE_BASE[pose];
  const waveImg  = IMGS.wave;
  const blinkImg = IMGS.eyesClosed;

  const isWaving = waving && (pose === 'welcome' || pose === 'excited');

  return (
    <>
      <style>{styles}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}

        <div className="fab-float" style={{ position:'relative', width:size, height:h, flexShrink:0 }}>

          {/* Base image — always present */}
          <img
            src={baseImg}
            alt="Fable"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', mixBlendMode: blend,
              opacity: (isWaving || blinking) ? 0 : 1, transition: 'opacity 0.08s ease' }}
          />

          {/* Wave image — arm raised */}
          <img
            src={waveImg}
            alt=""
            aria-hidden
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', mixBlendMode: blend,
              opacity: isWaving && !blinking ? 1 : 0, transition: 'opacity 0.1s ease' }}
          />

          {/* Blink image — eyes shut, brief flash */}
          <img
            src={blinkImg}
            alt=""
            aria-hidden
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', mixBlendMode: blend,
              opacity: blinking ? 1 : 0, transition: 'opacity 0.06s ease' }}
          />

          {/* Sparkles */}
          <span className="fab-sp1" style={{ position:'absolute', top:'5%',  left:'-10%', fontSize: size > 120 ? '1.1rem' : '0.85rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
          <span className="fab-sp2" style={{ position:'absolute', top:'3%',  right:'-6%', fontSize: size > 120 ? '0.85rem' : '0.65rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
          <span className="fab-sp3" style={{ position:'absolute', top:'18%', right:'-12%', fontSize: size > 120 ? '0.65rem' : '0.5rem', color:'#F4C542', pointerEvents:'none' }}>✦</span>
        </div>
      </div>
    </>
  );
}
