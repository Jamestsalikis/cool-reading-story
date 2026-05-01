'use client';

import { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
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

// ── Only show known character meshes — everything else is a rig cage or IK handle ──
// Blacklisting was missing unnamed materials (Material.010, .013, .015, .017)
// Whitelist is safer and explicit.
const CHARACTER_MATERIALS = new Set([
  'HairBase_S1', 'HairDetail_S1',
  'Skin_Body', 'Skin_Face_2',
  'SHIRTS', 'PANTS',
  'Lips.003', 'Teeth.003', 'Tongue.003',
  'FABRIC 1_FRONT_3426.003', 'Material3413',
]);
const isCharMaterial = (name: string) =>
  CHARACTER_MATERIALS.has(name) ||
  name.startsWith('Tiny Iris') ||
  name.startsWith('Tiny Sclera');

// ── Safe animations (zrig_* shape-key driven — no test/limb animations) ──────
const ANIM = {
  breathing:    'zrig_breathing',
  eyelidsUpper: 'zrig_eyelids_upper',
  eyelidsLower: 'zrig_eyelids_lower',
  cheeks:       'zrig_cheeks',
};

// ── Aim camera at character's upper body ──────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(0, -0.4, 0); }, [camera]);
  return null;
}

// ── 3D Character ──────────────────────────────────────────────────────────────
function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group    = useRef<THREE.Group>(null);
  const headBone = useRef<THREE.Object3D | null>(null);

  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions } = useAnimations(animations, group);

  // Whitelist — hide every mesh whose material is not a known character material
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      // Hide anything that isn't a known character material
      if (!names.some(isCharMaterial)) {
        mesh.visible = false;
        return;
      }

      // Fix colour space on visible character materials
      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;
        m.needsUpdate = true;
        if (m.map)          { m.map.colorSpace          = THREE.SRGBColorSpace;       m.map.needsUpdate = true; }
        if (m.normalMap)    { m.normalMap.colorSpace     = THREE.LinearSRGBColorSpace; }
        if (m.roughnessMap) { m.roughnessMap.colorSpace  = THREE.LinearSRGBColorSpace; }
      });
      mesh.castShadow = true;
    });

    // Find head bone for subtle nod
    scene.traverse((child: THREE.Object3D) => {
      if (!headBone.current && child.name.toLowerCase().includes('head') && !(child as THREE.Mesh).isMesh) {
        headBone.current = child;
      }
    });
  }, [scene]);

  const blinkTimer    = useRef<ReturnType<typeof setTimeout>>();
  const breathStarted = useRef(false);

  const playAction = useCallback((name: string, loop = true, weight = 1) => {
    const action = actions[name];
    if (!action) return;
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;
    action.setEffectiveWeight(weight);
    action.fadeIn(0.4).play();
    return action;
  }, [actions]);

  const stopAction = useCallback((name: string) => {
    actions[name]?.fadeOut(0.3);
  }, [actions]);

  // Breathing — always on
  useEffect(() => {
    if (breathStarted.current) return;
    breathStarted.current = true;
    playAction(ANIM.breathing, true, 0.7);
    playAction(ANIM.eyelidsLower, true, 0.3);
    return () => { stopAction(ANIM.breathing); };
  }, [playAction, stopAction]);

  // Random blink every 3–6 seconds
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
      }, 3000 + Math.random() * 3000);
    };
    scheduleBlink();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [actions]);

  // Cheek flush on excited
  useEffect(() => {
    if (pose === 'excited') {
      playAction(ANIM.cheeks, true, 0.5);
    } else {
      stopAction(ANIM.cheeks);
    }
  }, [pose, playAction, stopAction]);

  // Idle sway + subtle head nod via useFrame
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    // Whole-body gentle sway
    group.current.rotation.y = Math.sin(t * 0.28) * 0.035;
    group.current.position.y = Math.sin(t * 0.55) * 0.012;
    // Head nod on the bone (if found)
    if (headBone.current) {
      headBone.current.rotation.z = Math.sin(t * 0.4) * 0.015;
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
      <div style={{ position:'absolute', bottom:-8,  left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'9px solid #FFFEF9' }} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Fable({ pose = 'welcome', dialogue, size = 180, darkBackground = false }: FableProps) {
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

        <div style={{
          width: size,
          height: h,
          flexShrink: 0,
          background: darkBackground ? '#1C1614' : 'transparent',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: darkBackground ? '0 8px 32px rgba(116,21,21,0.15)' : 'none',
        }}>
          <Canvas
            camera={{ position:[0, 0.5, 5.5], fov:28 }}
            style={{ width:'100%', height:'100%' }}
            gl={{ antialias:true, alpha:true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.3;
            }}
          >
            <CameraRig />
            <ambientLight intensity={1.6} />
            <directionalLight position={[2, 4, 3]} intensity={2.2} color="#fff8f0" />
            <directionalLight position={[-2, 2, -1]} intensity={0.7} color="#d4e0ff" />
            <pointLight position={[0, 2, 3]} intensity={0.9} color="#ffe8d0" />

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
