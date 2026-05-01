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
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
`;

// ── Whitelist: only known character materials ─────────────────────────────────
const CHAR_MATS = new Set([
  'HairBase_S1','HairDetail_S1','Skin_Body','Skin_Face_2',
  'SHIRTS','PANTS','Lips.003','Teeth.003','Tongue.003',
  'FABRIC 1_FRONT_3426.003','Material3413',
]);
const isCharMat = (n: string) =>
  CHAR_MATS.has(n) || n.startsWith('Tiny Iris') || n.startsWith('Tiny Sclera');

// ── Bone names confirmed as skin joints that deform the mesh ─────────────────
const B = {
  armR:     'arm.r',
  forearmR: 'forearm.r',
  shoulderR:'shoulder.r',
  headX:    'head.x',
  neckX:    'neck.x',
  spine02:  'spine_02.x',
};

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(0, 0.2, 0); }, [camera]);
  return null;
}

// ── 3D character ──────────────────────────────────────────────────────────────
function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group = useRef<THREE.Group>(null);
  const bones = useRef<Record<string, THREE.Object3D>>({});
  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions, mixer }    = useAnimations(animations, group);

  // ── One-time scene setup ─────────────────────────────────────────────────
  useEffect(() => {
    const boneSet = new Set(Object.values(B));

    scene.traverse((child: THREE.Object3D) => {
      // Collect deformation bones
      if (boneSet.has(child.name)) bones.current[child.name] = child;

      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats  = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      // Hide non-character meshes
      if (!names.some(isCharMat)) { mesh.visible = false; return; }

      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;

        // Colour space fixes
        if (m.map)          { m.map.colorSpace         = THREE.SRGBColorSpace; m.map.needsUpdate = true; }
        if (m.normalMap)    { m.normalMap.colorSpace    = THREE.LinearSRGBColorSpace; }
        if (m.roughnessMap) { m.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace; }

        // Clothes colours
        if (m.name === 'SHIRTS' || m.name === 'FABRIC 1_FRONT_3426.003') {
          m.map = null; m.color.set('#EDEAE4'); m.roughness = 0.65; m.metalness = 0;
        }
        if (m.name === 'PANTS' || m.name === 'Material3413') {
          m.map = null; m.color.set('#1A4FA8'); m.roughness = 0.7; m.metalness = 0;
        }

        // Iris: force visible dark pupil
        // depthTest=false + renderOrder so iris renders on top of sclera
        if (m.name.startsWith('Tiny Iris')) {
          m.map = null;
          m.color.set('#1A0E05');
          m.roughness = 0.05; m.metalness = 0;
          m.depthTest = false;
          m.depthWrite = false;
          mesh.renderOrder = 10;
        }
        if (m.name.startsWith('Tiny Sclera')) {
          m.color.set('#F8F4F0'); m.roughness = 0.2; m.metalness = 0;
        }

        m.needsUpdate = true;
        mesh.castShadow = true;
      });
    });
  }, [scene]);

  // ── Animations ───────────────────────────────────────────────────────────
  const started  = useRef(false);
  const blinkT   = useRef<ReturnType<typeof setTimeout>>();
  const browT    = useRef<ReturnType<typeof setTimeout>>();

  const playLoop = useCallback((name: string, w = 1) => {
    const a = actions[name]; if (!a) return;
    a.setLoop(THREE.LoopRepeat, Infinity).setEffectiveWeight(w).fadeIn(0.3).play();
  }, [actions]);

  const playOnce = useCallback((name: string, w = 1) => {
    const a = actions[name]; if (!a) return;
    a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true;
    a.reset().setEffectiveWeight(w).fadeIn(0.2).play();
  }, [actions]);

  const stopAnim = useCallback((name: string) => {
    actions[name]?.fadeOut(0.3);
  }, [actions]);

  // Breathing always on
  useEffect(() => {
    if (started.current) return; started.current = true;
    playLoop('zrig_breathing', 0.8);
    playLoop('zrig_eyelids_lower', 0.4);
  }, [playLoop]);

  // Blink every 3–5 s
  useEffect(() => {
    const next = () => {
      blinkT.current = setTimeout(() => { playOnce('zrig_eyelids_upper', 1); next(); }, 3000 + Math.random() * 2000);
    };
    next();
    return () => { if (blinkT.current) clearTimeout(blinkT.current); };
  }, [playOnce]);

  // Eyebrow — the ONE animation confirmed to work visually
  // Use it heavily for enthusiasm
  useEffect(() => {
    if (browT.current) clearTimeout(browT.current);
    stopAnim('Eyebrow');

    const isEnergetic = pose === 'welcome' || pose === 'excited' || pose === 'finished';
    const interval    = isEnergetic ? 1800 : 5000;

    if (isEnergetic) {
      // Play immediately then keep repeating for continuous enthusiasm
      playOnce('Eyebrow', 1);
    }

    const pulse = () => {
      playOnce('Eyebrow', isEnergetic ? 1 : 0.5);
      browT.current = setTimeout(pulse, interval + Math.random() * 1000);
    };
    browT.current = setTimeout(pulse, isEnergetic ? 800 : 2000);

    return () => { if (browT.current) clearTimeout(browT.current); };
  }, [pose, playOnce, stopAnim]);

  // ── Bone-driven motion — priority 1 runs AFTER the AnimationMixer ────────
  // This is critical: at priority 0 the mixer overwrites our rotations.
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    // Body sway
    const bobSpeed = pose === 'excited' ? 2.2 : 1.2;
    group.current.rotation.y  = Math.sin(t * 0.3)       * 0.04;
    group.current.position.y  = Math.sin(t * bobSpeed)  * (pose === 'excited' ? 0.022 : 0.01);

    // Head tilt
    const h = bones.current[B.headX];
    if (h) {
      h.rotation.z = Math.sin(t * 0.4) * 0.025 + (pose === 'thinking' ? 0.14 : 0);
      h.rotation.x = Math.sin(t * 0.5) * 0.015;
    }

    // ARM WAVE — right arm (confirmed deformation bone)
    const sR = bones.current[B.shoulderR];
    const aR = bones.current[B.armR];
    const fR = bones.current[B.forearmR];

    if (pose === 'welcome' || pose === 'excited') {
      const spd = pose === 'excited' ? 3.8 : 2.8;
      const amp = pose === 'excited' ? 0.55 : 0.4;
      // Try rotating on Y axis (different from Z which didn't work)
      if (sR) { sR.rotation.y = 0.5 + Math.sin(t * spd * 0.4) * 0.15; sR.rotation.x = -0.3; }
      if (aR) { aR.rotation.y = -(0.9 + Math.sin(t * spd) * amp); aR.rotation.x = 0.2; }
      if (fR) { fR.rotation.x = 0.6 + Math.sin(t * spd + 1) * 0.3; }
    } else {
      // Ease back
      if (sR) { sR.rotation.y *= 0.93; sR.rotation.x *= 0.93; }
      if (aR) { aR.rotation.y *= 0.93; aR.rotation.x *= 0.93; }
      if (fR) { fR.rotation.x *= 0.93; }
    }

    // Spine lean for writing/painting
    const sp = bones.current[B.spine02];
    if (sp) {
      const lean = (pose === 'writing' || pose === 'painting') ? 0.08 : 0;
      sp.rotation.x += (lean - sp.rotation.x) * 0.05;
    }
  }, 1); // <-- priority 1: runs AFTER mixer's priority-0 update

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
      position:'relative', background:'#FFFEF9', border:'2px solid #E8E0D0',
      borderRadius:'14px', padding:'10px 16px', maxWidth:'240px',
      fontSize:'0.875rem', fontFamily:'Georgia,serif', fontStyle:'italic',
      color:'#1C1614', lineHeight:1.55, textAlign:'center',
      boxShadow:'0 2px 16px rgba(0,0,0,0.07)',
      animation:'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {text}
      <div style={{ position:'absolute',bottom:-11,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'9px solid transparent',borderRight:'9px solid transparent',borderTop:'11px solid #E8E0D0' }} />
      <div style={{ position:'absolute',bottom:-8, left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderTop:'9px solid #FFFEF9' }} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Fable({ pose = 'welcome', dialogue, size = 180, darkBackground = false }: FableProps) {
  const [displayText, setDisplayText] = useState('');
  const [showBubble,  setShowBubble]  = useState(false);

  useEffect(() => {
    setShowBubble(false); setDisplayText('');
    if (!dialogue) return;
    const t = setTimeout(() => {
      setShowBubble(true);
      let i = 0;
      const iv = setInterval(() => {
        i++; setDisplayText(dialogue.slice(0, i));
        if (i >= dialogue.length) clearInterval(iv);
      }, 25);
      return () => clearInterval(iv);
    }, 250);
    return () => clearTimeout(t);
  }, [dialogue, pose]);

  // Wide enough to fit waving arm
  const h = size * 1.45;

  return (
    <>
      <style>{styles}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}
        <div style={{
          width: size, height: h, flexShrink: 0,
          background: darkBackground ? '#1C1614' : 'transparent',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: darkBackground ? '0 8px 32px rgba(116,21,21,0.15)' : 'none',
        }}>
          <Canvas
            camera={{ position:[0, 0.6, 4.2], fov:50 }}
            style={{ width:'100%', height:'100%' }}
            gl={{ antialias:true, alpha:true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.2;
            }}
          >
            <CameraRig />
            <ambientLight intensity={1.8} />
            <directionalLight position={[2, 5, 4]} intensity={2.5} color="#fff9f2" />
            <directionalLight position={[-3, 2, -1]} intensity={0.9} color="#c0d0ff" />
            <pointLight position={[0, 3, 3]} intensity={1.1} color="#ffd8b0" />
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
