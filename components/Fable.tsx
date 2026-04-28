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

// Map every pose to the nearest generated image
const POSE_MAP: Record<FablePose, string> = {
  welcome:  'welcome',
  excited:  'welcome',
  thinking: 'writing',
  writing:  'writing',
  painting: 'painting',
  finished: 'welcome',
};

function fableUrl(pose: FablePose) {
  return `${SUPABASE_URL}/storage/v1/object/public/story-images/fable-${POSE_MAP[pose]}.webp`;
}

const styles = `
  @keyframes fabFloat {
    0%,100% { transform: translateY(0px)    rotate(0deg);    }
    25%      { transform: translateY(-7px)   rotate(-1.5deg); }
    50%      { transform: translateY(-12px)  rotate(1.5deg);  }
    75%      { transform: translateY(-7px)   rotate(-1deg);   }
  }
  @keyframes fabSpark {
    0%,100% { opacity:0; transform:scale(0.6) rotate(0deg);   }
    50%     { opacity:1; transform:scale(1.3) rotate(180deg); }
  }
  @keyframes bubbleIn {
    from { opacity:0; transform:translateY(6px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1);    }
  }
  .fab-char { animation: fabFloat 3.5s ease-in-out infinite; transform-origin: center bottom; }
  .fab-sp1  { animation: fabSpark 2.4s ease-in-out infinite 0s;   }
  .fab-sp2  { animation: fabSpark 2.4s ease-in-out infinite 0.8s; }
  .fab-sp3  { animation: fabSpark 2.4s ease-in-out infinite 1.6s; }
`;

function DialogueBubble({ text }: { text: string }) {
  return (
    <div style={{
      position:'relative', background:'#FFFEF9', border:'2px solid #E8E0D0',
      borderRadius:'14px', padding:'10px 16px', maxWidth:'240px',
      fontSize:'0.875rem', fontFamily:'Georgia,serif', fontStyle:'italic',
      color:'#1C1614', lineHeight:1.55, textAlign:'center',
      boxShadow:'0 2px 16px rgba(0,0,0,0.07)',
      animation:'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {text}
      <div style={{position:'absolute',bottom:-11,left:'50%',transform:'translateX(-50%)',
        width:0,height:0,borderLeft:'9px solid transparent',
        borderRight:'9px solid transparent',borderTop:'11px solid #E8E0D0'}}/>
      <div style={{position:'absolute',bottom:-8,left:'50%',transform:'translateX(-50%)',
        width:0,height:0,borderLeft:'7px solid transparent',
        borderRight:'7px solid transparent',borderTop:'9px solid #FFFEF9'}}/>
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
      const iv = setInterval(() => {
        i++;
        setDisplayText(dialogue.slice(0, i));
        if (i >= dialogue.length) clearInterval(iv);
      }, 25);
      return () => clearInterval(iv);
    }, 250);
    return () => clearTimeout(t);
  }, [dialogue, pose]);

  const h = size * 1.55;

  return (
    <>
      <style>{styles}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>

        {showBubble && displayText && <DialogueBubble text={displayText} />}

        {/* Character wrapper — transparent so mix-blend-mode reaches page bg */}
        <div className="fab-char" style={{ position:'relative', width:size, height:h, flexShrink:0 }}>

          {/* The real Fable image */}
          <img
            src={fableUrl(pose)}
            alt="Fable"
            style={{
              width:'100%',
              height:'100%',
              objectFit:'contain',
              // multiply blends white pixels with whatever is behind —
              // on cream page bg the white disappears; on dark overlay use normal
              mixBlendMode: darkBackground ? 'normal' : 'multiply',
              display:'block',
            }}
          />

          {/* Sparkle stars layered ON TOP of the image */}
          <span className="fab-sp1" style={{
            position:'absolute', top:'8%', left:'-8%',
            fontSize:size > 120 ? '1.2rem' : '0.9rem', color:'#F4C542', pointerEvents:'none',
          }}>✦</span>
          <span className="fab-sp2" style={{
            position:'absolute', top:'5%', right:'-5%',
            fontSize:size > 120 ? '0.9rem' : '0.7rem', color:'#F4C542', pointerEvents:'none',
          }}>✦</span>
          <span className="fab-sp3" style={{
            position:'absolute', top:'20%', right:'-10%',
            fontSize:size > 120 ? '0.7rem' : '0.55rem', color:'#F4C542', pointerEvents:'none',
          }}>✦</span>
        </div>
      </div>
    </>
  );
}
