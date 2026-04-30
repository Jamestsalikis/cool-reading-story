'use client';

/**
 * FableRive — Rive-powered animated character component.
 *
 * DROP IN: Put your Fable.riv file at /public/fable/fable.riv
 *
 * The .riv file needs these State Machine inputs (name: "FableStateMachine"):
 *   - "pose"   : Number  (0=idle, 1=wave, 2=write, 3=paint, 4=excited, 5=bow)
 *   - "talk"   : Boolean (true while dialogue is visible)
 *   - "blink"  : Trigger (fires programmatically every ~4s)
 *
 * Get the character from:
 *   https://rive.app/community  — search "character girl" or "cartoon girl"
 *   Then customise colours to match brand (#741515 cardigan, dark hair, glasses)
 */

import { useState, useEffect, useRef } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableRiveProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
}

const POSE_NUMBERS: Record<FablePose, number> = {
  welcome:  0,
  excited:  4,
  thinking: 2,
  writing:  2,
  painting: 3,
  finished: 5,
};

const STATE_MACHINE = 'FableStateMachine';

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
      <style>{`@keyframes bubbleIn { from{opacity:0;transform:translateY(6px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
    </div>
  );
}

export default function FableRive({ pose = 'welcome', dialogue, size = 200 }: FableRiveProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load the Rive file
  const { rive, RiveComponent } = useRive({
    src: '/fable/fable.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // State machine inputs
  const poseInput = useStateMachineInput(rive, STATE_MACHINE, 'pose');
  const talkInput = useStateMachineInput(rive, STATE_MACHINE, 'talk');
  const blinkTrigger = useStateMachineInput(rive, STATE_MACHINE, 'blink');

  // Update pose when prop changes
  useEffect(() => {
    if (poseInput) poseInput.value = POSE_NUMBERS[pose];
  }, [pose, poseInput]);

  // Update talk state
  useEffect(() => {
    if (talkInput) talkInput.value = showBubble;
  }, [showBubble, talkInput]);

  // Auto-blink every 3-5 seconds
  useEffect(() => {
    if (!blinkTrigger) return;
    const randomBlink = () => {
      blinkTrigger.fire();
      blinkTimer.current = setTimeout(randomBlink, 3000 + Math.random() * 2000);
    };
    blinkTimer.current = setTimeout(randomBlink, 2000);
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [blinkTrigger]);

  // Dialogue typewriter
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {showBubble && displayText && <DialogueBubble text={displayText} />}
      <div style={{ width: size, height: size * 1.2 }}>
        <RiveComponent />
      </div>
    </div>
  );
}
