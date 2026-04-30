'use client';

import { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
import * as THREE from 'three';

export type FablePose = 'welcome' | 'excited' | 'thinking' | 'writing' | 'painting' | 'finished';

interface FableProps {
  pose?: FablePose;
  dialogue?: string;
  size?: number;
  darkBackground?: boolean;
}

const styles = `
  @keyframes bubbleIn {
    from { opacity:0; transform:translateY(6px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1);    }
  }
`;

// ── Animation names from the GLB ──────────────────────────────────────────────
const ANIM = {
  breathing:     'zrig_breathing',
  eyelidsUpper:  'zrig_eyelids_upper',
  eyelidsLower:  'zrig_eyelids_lower',
  cheeks:        'zrig_cheeks',
  eyes:          'EYES',
  facial:        'Facial_Expression',
  armTest:       'ARM-TEST',
  headTest:      'HEAD-TEST',
  pose:          'Aurora_Pose',
  handClose:     'zrig_hand_close',
  mouthU:        'zrig_U',
};

// ── 3D Character ─────────────────────────────────────────────────────────────
function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions } = useAnimations(animations, group);

  // Fix on load — hide rig cages, fix colour space
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      // Hide rig deformation cages & control shapes — they're brightly coloured internals
      const isCage = names.some(n =>
        n.includes('BlenRig') || n.startsWith('cs_') || n.includes('Cage')
      );
      if (isCage) { mesh.visible = false; return; }

      // Fix colour space on real character materials
      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;
        m.needsUpdate = true;
        if (m.map)          { m.map.colorSpace          = THREE.SRGBColorSpace;       m.map.needsUpdate = true; }
        if (m.normalMap)    { m.normalMap.colorSpace     = THREE.LinearSRGBColorSpace; }
        if (m.roughnessMap) { m.roughnessMap.colorSpace  = THREE.LinearSRGBColorSpace; }
      });
      mesh.castShadow = true;
    });
  }, [scene]);

  const blinkTimer    = useRef<ReturnType<typeof setTimeout>>();
  const breathStarted = useRef(false);
  const armWaving     = useRef(false);
  const waveTimer     = useRef<ReturnType<typeof setTimeout>>();

  // Helper — fade an action in
  const playAction = useCallback((name: string, loop = true, weight = 1) => {
    const action = actions[name];
    if (!action) return;
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;
    action.setEffectiveWeight(weight);
    action.fadeIn(0.3).play();
    return action;
  }, [actions]);

  const stopAction = useCallback((name: string, fadeTime = 0.3) => {
    actions[name]?.fadeOut(fadeTime);
  }, [actions]);

  // Start breathing on mount — plays forever
  useEffect(() => {
    if (breathStarted.current) return;
    breathStarted.current = true;
    playAction(ANIM.breathing, true, 0.6);
    playAction(ANIM.eyelidsLower, true, 0.3);
    return () => { stopAction(ANIM.breathing); };
  }, [playAction, stopAction]);

  // Random blinking every 3–5 seconds
  useEffect(() => {
    const scheduleBlink = () => {
      blinkTimer.current = setTimeout(() => {
        const a = actions[ANIM.eyelidsUpper];
        if (a) {
          a.setLoop(THREE.LoopOnce, 1);
          a.clampWhenFinished = true;
          a.reset().setEffectiveWeight(1).play();
        }
        scheduleBlink();
      }, 3000 + Math.random() * 2000);
    };
    scheduleBlink();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [actions]);

  // Pose changes — arm wave for welcome/excited
  useEffect(() => {
    if (waveTimer.current) clearTimeout(waveTimer.current);

    if (pose === 'welcome' || pose === 'excited') {
      // Trigger arm wave periodically
      const doWave = () => {
        if (!armWaving.current) {
          armWaving.current = true;
          const a = actions[ANIM.armTest];
          if (a) {
            a.setLoop(THREE.LoopOnce, 1);
            a.clampWhenFinished = true;
            a.reset().setEffectiveWeight(1).fadeIn(0.2).play();
            setTimeout(() => {
              a.fadeOut(0.3);
              armWaving.current = false;
            }, (a.getClip().duration * 1000) - 100);
          }
        }
        waveTimer.current = setTimeout(doWave, 4000 + Math.random() * 2000);
      };
      doWave();
    }

    if (pose === 'excited') {
      playAction(ANIM.cheeks, true, 0.5);
    } else {
      stopAction(ANIM.cheeks);
    }

    return () => { if (waveTimer.current) clearTimeout(waveTimer.current); };
  }, [pose, actions, playAction, stopAction]);

  // Subtle idle sway
  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.rotation.y = Math.sin(t * 0.3) * 0.04;
      group.current.position.y = Math.sin(t * 0.6) * 0.02 - 1.8;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.9} position={[0, -1.8, 0]} />
    </group>
  );
}

// ── Dialogue bubble ───────────────────────────────────────────────────────────
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
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Fable({ pose = 'welcome', dialogue, size = 180 }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble, setShowBubble]   = useState(false);

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

        <div style={{ width:size, height:h, flexShrink:0, borderRadius:'12px', overflow:'hidden' }}>
          <Canvas
            camera={{ position:[0, 0.8, 4.5], fov:30 }}
            style={{ background:'transparent' }}
            gl={{ alpha:true, antialias:true }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.1;
            }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[2, 4, 3]} intensity={2} color="#fff8f0" />
            <directionalLight position={[-2, 2, -1]} intensity={0.6} color="#d4e0ff" />
            <pointLight position={[0, 2, 3]} intensity={0.8} color="#ffe8d0" />

            <Suspense fallback={null}>
              <AuroraCharacter pose={pose} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </>
  );
}

useGLTF.preload('/fable/aurora.glb');
