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
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }
`;

// ── Whitelisted character materials only ──────────────────────────────────────
const CHAR_MATS = new Set([
  'HairBase_S1','HairDetail_S1','Skin_Body','Skin_Face_2',
  'SHIRTS','PANTS','Lips.003','Teeth.003','Tongue.003',
  'FABRIC 1_FRONT_3426.003','Material3413',
]);
const isCharMat = (n: string) =>
  CHAR_MATS.has(n) || n.startsWith('Tiny Iris') || n.startsWith('Tiny Sclera');

// ── Shape-key animations (the only safe ones) ─────────────────────────────────
const ANIM = {
  breathing:    'zrig_breathing',
  eyelidsUpper: 'zrig_eyelids_upper',
  eyelidsLower: 'zrig_eyelids_lower',
  cheeks:       'zrig_cheeks',
  eyebrow:      'Eyebrow',
  mouthUp:      'zrig_mouth_corner_up',
  mouthNose:    'zrig_nose_frown',
};

// ── Bone names that ACTUALLY deform the mesh (skin joints) ────────────────────
const BONES = {
  armR:      'arm.r',
  armL:      'arm.l',
  forearmR:  'forearm.r',
  shoulderR: 'shoulder.r',
  shoulderL: 'shoulder.l',
  headX:     'head.x',
  neckX:     'neck.x',
  spine02:   'spine_02.x',
  spine03:   'spine_03.x',
};

// ── Aim camera at face/chest ──────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(0, 0.3, 0); }, [camera]);
  return null;
}

// ── 3D Character ──────────────────────────────────────────────────────────────
function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group = useRef<THREE.Group>(null);
  const b     = useRef<Record<string, THREE.Object3D>>({});

  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions }           = useAnimations(animations, group);

  // ── Scene setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const boneTargets = new Set(Object.values(BONES));

    scene.traverse((child: THREE.Object3D) => {
      // Build bone map
      if (boneTargets.has(child.name)) b.current[child.name] = child;

      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats  = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      // Hide non-character meshes (cages, IK handles, etc.)
      if (!names.some(isCharMat)) { mesh.visible = false; return; }

      // Explicitly restore — previous broken renders may have hidden these in cache
      mesh.visible = true;

      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;
        m.needsUpdate = true;

        // Fix colour space
        if (m.map)          { m.map.colorSpace         = THREE.SRGBColorSpace;       m.map.needsUpdate = true; }
        if (m.normalMap)    { m.normalMap.colorSpace    = THREE.LinearSRGBColorSpace; }
        if (m.roughnessMap) { m.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace; }

        // ── Clothing colours ──────────────────────────────────────────────
        if (m.name === 'SHIRTS' || m.name === 'FABRIC 1_FRONT_3426.003') {
          m.color.set('#F4EFE8');   // crisp white/cream top
          m.map = null;
          m.roughness = 0.7; m.metalness = 0;
        }
        if (m.name === 'PANTS' || m.name === 'Material3413') {
          m.color.set('#1E4FA3');   // vibrant blue bottoms
          m.map = null;
          m.roughness = 0.75; m.metalness = 0;
        }

        // ── Eyes: force visible iris so it's not all-white ───────────────
        if (m.name.startsWith('Tiny Iris')) {
          m.map = null;
          m.color.set('#2C1810');   // dark brown iris
          m.roughness = 0.1; m.metalness = 0;
          m.emissive.set('#0A0602');
          m.emissiveIntensity = 0.2;
        }
        if (m.name.startsWith('Tiny Sclera')) {
          m.color.set('#FFFAFA');
          m.roughness = 0.25; m.metalness = 0;
        }

        mesh.castShadow = true;
      });
    });
  }, [scene]);

  // ── Animation helpers ─────────────────────────────────────────────────────
  const started = useRef(false);
  const blinkT  = useRef<ReturnType<typeof setTimeout>>();
  const smileT  = useRef<ReturnType<typeof setTimeout>>();
  const waveT   = useRef<ReturnType<typeof setTimeout>>();

  const loop = useCallback((name: string, w = 1) => {
    const a = actions[name]; if (!a) return;
    a.setLoop(THREE.LoopRepeat, Infinity).setEffectiveWeight(w).fadeIn(0.4).play();
  }, [actions]);

  const once = useCallback((name: string, w = 1) => {
    const a = actions[name]; if (!a) return;
    a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true;
    a.reset().setEffectiveWeight(w).fadeIn(0.25).play();
  }, [actions]);

  const stop = useCallback((name: string) => { actions[name]?.fadeOut(0.35); }, [actions]);

  // Breathing — always
  useEffect(() => {
    if (started.current) return; started.current = true;
    loop(ANIM.breathing, 0.8);
    loop(ANIM.eyelidsLower, 0.35);
    return () => stop(ANIM.breathing);
  }, [loop, stop]);

  // Blink every 3–5 s
  useEffect(() => {
    const next = () => {
      blinkT.current = setTimeout(() => { once(ANIM.eyelidsUpper, 1); next(); }, 3000 + Math.random() * 2000);
    };
    next();
    return () => { if (blinkT.current) clearTimeout(blinkT.current); };
  }, [once]);

  // ── Pose-driven expressions ───────────────────────────────────────────────
  useEffect(() => {
    if (smileT.current) clearTimeout(smileT.current);
    [ANIM.cheeks, ANIM.mouthUp, ANIM.mouthNose, ANIM.eyebrow].forEach(stop);

    // All poses get a baseline warmth
    loop(ANIM.cheeks,   pose === 'excited' || pose === 'finished' ? 1 : 0.5);
    loop(ANIM.mouthUp,  pose === 'thinking' ? 0.1 : 0.85);  // big smile unless thinking

    if (pose === 'welcome' || pose === 'excited' || pose === 'finished') {
      loop(ANIM.eyebrow, 0.6);   // raised brows = surprise/joy
    }
    if (pose === 'thinking') {
      loop(ANIM.mouthNose, 0.35); // slight furrow
    }

    // Periodic eyebrow raises
    const pulseEyebrow = () => {
      once(ANIM.eyebrow, 1);
      smileT.current = setTimeout(pulseEyebrow, 4000 + Math.random() * 3000);
    };
    smileT.current = setTimeout(pulseEyebrow, 1500);

    // ARM-TEST wave — we know this actually moves the arm in the GLB
    if (waveT.current) clearTimeout(waveT.current);
    const waveAnim = actions['ARM-TEST'];
    if ((pose === 'welcome' || pose === 'excited') && waveAnim) {
      const doWave = () => {
        waveAnim.setLoop(THREE.LoopOnce, 1);
        waveAnim.clampWhenFinished = true;
        waveAnim.reset().setEffectiveWeight(1).fadeIn(0.2).play();
        waveT.current = setTimeout(doWave, (waveAnim.getClip().duration * 1000) + 2000 + Math.random() * 1500);
      };
      doWave();
    }

    return () => {
      if (smileT.current) clearTimeout(smileT.current);
      if (waveT.current)  clearTimeout(waveT.current);
      actions['ARM-TEST']?.fadeOut(0.3);
    };
  }, [pose, actions, loop, once, stop]);

  // ── Bone-driven motion ────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    // Whole-body bob — energetic on welcome/excited
    const bobAmp = (pose === 'excited') ? 0.025 : 0.01;
    group.current.rotation.y = Math.sin(t * 0.3) * 0.04;
    group.current.position.y = Math.sin(t * (pose === 'excited' ? 1.8 : 1.1)) * bobAmp;

    // HEAD: slight nod + tilt
    if (b.current[BONES.headX]) {
      const tilt = pose === 'thinking' ? 0.12 : 0;
      b.current[BONES.headX].rotation.z = Math.sin(t * 0.38) * 0.02 + tilt;
      b.current[BONES.headX].rotation.x = Math.sin(t * 0.45) * 0.015;
    }
    if (b.current[BONES.neckX]) {
      b.current[BONES.neckX].rotation.z = Math.sin(t * 0.32) * 0.012;
    }

    // ── ARM WAVE (deformation bones) ─────────────────────────────────────
    const armR = b.current[BONES.armR];
    const faR  = b.current[BONES.forearmR];
    const shR  = b.current[BONES.shoulderR];

    if (pose === 'welcome' || pose === 'excited') {
      const speed = pose === 'excited' ? 3.5 : 2.6;
      const amp   = pose === 'excited' ? 0.5  : 0.38;
      // Shoulder lifts arm up
      if (shR) { shR.rotation.z = 0.4 + Math.sin(t * speed * 0.5) * 0.1; shR.rotation.x = -0.2; }
      // Upper arm waves
      if (armR) { armR.rotation.z = -(1.1 + Math.sin(t * speed) * amp); armR.rotation.x = -0.15; }
      // Forearm follows
      if (faR)  { faR.rotation.z  = -(0.5 + Math.sin(t * speed + 0.8) * 0.25); }
    } else {
      // Ease arm back to rest
      if (shR)  { shR.rotation.z  += (0 - shR.rotation.z)  * 0.06; shR.rotation.x  += (0 - shR.rotation.x)  * 0.06; }
      if (armR) { armR.rotation.z += (0 - armR.rotation.z) * 0.06; armR.rotation.x += (0 - armR.rotation.x) * 0.06; }
      if (faR)  { faR.rotation.z  += (0 - faR.rotation.z)  * 0.06; }
    }

    // SPINE: slight forward lean for focused poses
    if (b.current[BONES.spine02]) {
      const lean = (pose === 'writing' || pose === 'painting') ? 0.07 : 0;
      b.current[BONES.spine02].rotation.x += (lean - b.current[BONES.spine02].rotation.x) * 0.05;
    }
  }, 1); // priority 1 — runs after AnimationMixer so rotations aren't overwritten

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
  const [showBubble, setShowBubble]   = useState(false);

  useEffect(() => {
    setShowBubble(false); setDisplayText('');
    if (!dialogue) return;
    const t = setTimeout(() => {
      setShowBubble(true);
      let i = 0;
      const iv = setInterval(() => { i++; setDisplayText(dialogue.slice(0, i)); if (i >= dialogue.length) clearInterval(iv); }, 25);
      return () => clearInterval(iv);
    }, 250);
    return () => clearTimeout(t);
  }, [dialogue, pose]);

  // Slightly wider aspect to fit raised arm
  const h = size * 1.4;

  return (
    <>
      <style>{styles}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}
        <div style={{
          width:size, height:h, flexShrink:0,
          background: darkBackground ? '#1C1614' : 'transparent',
          borderRadius:16, overflow:'hidden',
          boxShadow: darkBackground ? '0 8px 32px rgba(116,21,21,0.15)' : 'none',
        }}>
          <Canvas
            camera={{ position:[0, 0.8, 4.5], fov:46 }}
            style={{ width:'100%', height:'100%' }}
            gl={{ antialias:true, alpha:true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.25;
            }}
          >
            <CameraRig />
            <ambientLight intensity={1.7} />
            <directionalLight position={[2, 5, 4]} intensity={2.4} color="#fff9f0" />
            <directionalLight position={[-3, 2, -1]} intensity={0.8} color="#c8d8ff" />
            <pointLight position={[0, 3, 3]} intensity={1.0} color="#ffe0c0" />

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
