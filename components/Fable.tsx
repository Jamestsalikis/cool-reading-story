'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
  darkBackground?: boolean;
}

// Map our pose names to Aurora's animation names (adjust once you see what's in the file)
// Run with ?debug=1 to print available animations in the console
const ANIMATION_MAP: Record<FablePose, string[]> = {
  welcome:  ['Idle', 'idle', 'TPose', 'Stand'],
  excited:  ['Wave', 'wave', 'Hello', 'Greet'],
  thinking: ['Think', 'think', 'Idle', 'idle'],
  writing:  ['Write', 'write', 'Idle', 'idle'],
  painting: ['Paint', 'point', 'Idle', 'idle'],
  finished: ['Bow', 'bow', 'Idle', 'idle'],
};

function findAnimation(clips: THREE.AnimationClip[], candidates: string[]): THREE.AnimationClip | null {
  for (const name of candidates) {
    const clip = clips.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (clip) return clip;
  }
  return clips[0] || null; // fallback to first animation
}

interface AuroraModelProps {
  pose: FablePose;
}

function AuroraModel({ pose }: AuroraModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions, mixer } = useAnimations(animations, group);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  // Log available animations once (helps identify names)
  useEffect(() => {
    console.log('Fable animations available:', animations.map(a => a.name));
  }, [animations]);

  // Switch animation when pose changes
  useEffect(() => {
    const candidates = ANIMATION_MAP[pose];
    const clip = findAnimation(animations, candidates);
    if (!clip) return;

    const action = actions[clip.name];
    if (!action) return;

    if (currentAction.current && currentAction.current !== action) {
      currentAction.current.fadeOut(0.4);
    }

    action.reset().fadeIn(0.4).play();
    currentAction.current = action;
  }, [pose, actions, animations]);

  // Gentle idle breathing when no specific animation
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(Date.now() * 0.0004) * 0.05;
    }
    mixer.update(delta);
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.8} position={[0, -1.8, 0]} />
    </group>
  );
}

// Dialogue bubble (outside the Canvas — regular HTML)
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
      <div style={{ position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'9px solid #FFFEF9' }} />
      <style>{`@keyframes bubbleIn{from{opacity:0;transform:translateY(6px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

// Fallback while GLB loads
function FableFallback({ size }: { size: number }) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    <img
      src={`${SUPABASE_URL}/storage/v1/object/public/story-images/fable-welcome.webp`}
      alt="Fable"
      style={{ width: size, height: size * 1.55, objectFit: 'contain', mixBlendMode: 'multiply', animation: 'fabFloat 3.5s ease-in-out infinite' }}
    />
  );
}

export default function Fable({ pose = 'welcome', dialogue, size = 180, darkBackground = false }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [glbReady, setGlbReady] = useState(false);

  // Check if the GLB file exists
  useEffect(() => {
    fetch('/fable/aurora.glb', { method: 'HEAD' })
      .then(r => { if (r.ok) setGlbReady(true); })
      .catch(() => {});
  }, []);

  // Typewriter dialogue
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

  return (
    <>
      <style>{`@keyframes fabFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}

        <div style={{ width: size, height: size * 1.55, flexShrink: 0 }}>
          {glbReady ? (
            <Canvas
              camera={{ position: [0, 0.5, 3.5], fov: 35 }}
              style={{ background: 'transparent' }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[2, 4, 3]} intensity={1.5} castShadow />
              <directionalLight position={[-2, 2, -1]} intensity={0.4} color="#ffd4a8" />

              <Suspense fallback={null}>
                <AuroraModel pose={pose} />
                <Environment preset="studio" />
              </Suspense>
            </Canvas>
          ) : (
            <FableFallback size={size} />
          )}
        </div>
      </div>
    </>
  );
}

// Preload the model
useGLTF.preload('/fable/aurora.glb');
