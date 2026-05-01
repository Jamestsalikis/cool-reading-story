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

// ── Known character materials (whitelist) ─────────────────────────────────────
const CHARACTER_MATS = new Set([
  'HairBase_S1','HairDetail_S1','Skin_Body','Skin_Face_2',
  'SHIRTS','PANTS','Lips.003','Teeth.003','Tongue.003',
  'FABRIC 1_FRONT_3426.003','Material3413',
]);
const isCharMat = (name: string) =>
  CHARACTER_MATS.has(name) ||
  name.startsWith('Tiny Iris') ||
  name.startsWith('Tiny Sclera');

// Clothes get tinted orange — all fabric materials
const CLOTHING_MATS = new Set(['SHIRTS','PANTS','FABRIC 1_FRONT_3426.003','Material3413']);
const ORANGE = new THREE.Color('#D4500C'); // warm burnt orange

// ── Safe shape-key animations (zrig_*) ───────────────────────────────────────
const ANIM = {
  breathing:      'zrig_breathing',
  eyelidsUpper:   'zrig_eyelids_upper',
  eyelidsLower:   'zrig_eyelids_lower',
  cheeks:         'zrig_cheeks',
  cheeksFrown:    'zrig_cheeks_frown',
  eyebrow:        'Eyebrow',
  eyes:           'EYES',
  mouthCornerUp:  'zrig_mouth_corner_up',
  mouthFrown:     'zrig_mouth_frown',
  mouthNoseFrown: 'zrig_nose_frown',
};

// ── Camera aims at upper body ─────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(0, 0.5, 0); }, [camera]);
  return null;
}

// ── 3D Character ──────────────────────────────────────────────────────────────
function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group = useRef<THREE.Group>(null);

  // Named bone refs — populated on scene load
  const boneRef = useRef<Record<string, THREE.Object3D>>({});

  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions }           = useAnimations(animations, group);

  // Scene setup: whitelist + orange clothes + bone map
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      // ── bone map ──────────────────────────────────────────────────────────
      const bonesToTrack = ['c_arm_fk.r','c_arm_fk.l','c_forearm_fk.r','c_head.x','c_neck.x','c_jawbone.x','c_eye.l','c_eye.r','c_spine_02.x'];
      if (bonesToTrack.includes(child.name)) {
        boneRef.current[child.name] = child;
      }

      // ── mesh visibility + materials ───────────────────────────────────────
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats  = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      if (!names.some(isCharMat)) { mesh.visible = false; return; }

      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;
        m.needsUpdate = true;
        // Fix colour space
        if (m.map)          { m.map.colorSpace         = THREE.SRGBColorSpace;       m.map.needsUpdate = true; }
        if (m.normalMap)    { m.normalMap.colorSpace    = THREE.LinearSRGBColorSpace; }
        if (m.roughnessMap) { m.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace; }
        // Tint clothing orange
        if (CLOTHING_MATS.has(m.name)) {
          m.color.copy(ORANGE);
        }
      });
      mesh.castShadow = true;
    });
  }, [scene]);

  // ── Animation helpers ─────────────────────────────────────────────────────
  const breathStarted = useRef(false);
  const blinkTimer    = useRef<ReturnType<typeof setTimeout>>();
  const exprTimer     = useRef<ReturnType<typeof setTimeout>>();

  const playOnce = useCallback((name: string, weight = 1) => {
    const a = actions[name];
    if (!a) return;
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.reset().setEffectiveWeight(weight).fadeIn(0.3).play();
  }, [actions]);

  const playLoop = useCallback((name: string, weight = 1) => {
    const a = actions[name];
    if (!a) return;
    a.setLoop(THREE.LoopRepeat, Infinity);
    a.setEffectiveWeight(weight);
    a.fadeIn(0.4).play();
  }, [actions]);

  const stopAnim = useCallback((name: string) => {
    actions[name]?.fadeOut(0.4);
  }, [actions]);

  // Breathing — always on
  useEffect(() => {
    if (breathStarted.current) return;
    breathStarted.current = true;
    playLoop(ANIM.breathing, 0.7);
    playLoop(ANIM.eyelidsLower, 0.3);
    return () => { stopAnim(ANIM.breathing); };
  }, [playLoop, stopAnim]);

  // Random blink every 3–6 s
  useEffect(() => {
    const next = () => {
      blinkTimer.current = setTimeout(() => { playOnce(ANIM.eyelidsUpper, 1); next(); }, 3000 + Math.random() * 3000);
    };
    next();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [playOnce]);

  // ── Pose-driven shape-key expressions ─────────────────────────────────────
  useEffect(() => {
    if (exprTimer.current) clearTimeout(exprTimer.current);

    // Stop all expression anims before switching
    [ANIM.mouthCornerUp, ANIM.mouthFrown, ANIM.mouthNoseFrown, ANIM.cheeks, ANIM.cheeksFrown, ANIM.eyebrow, ANIM.eyes].forEach(stopAnim);

    if (pose === 'welcome') {
      // Warm smile + subtle eyebrow raise, repeat every ~7s
      const doSmile = () => {
        playOnce(ANIM.mouthCornerUp, 0.7);
        playOnce(ANIM.eyebrow, 0.4);
        exprTimer.current = setTimeout(doSmile, 7000 + Math.random() * 3000);
      };
      setTimeout(doSmile, 1000);
    }

    if (pose === 'excited') {
      playLoop(ANIM.cheeks, 0.6);
      playOnce(ANIM.mouthCornerUp, 1);
      playOnce(ANIM.eyebrow, 0.8);
      // Big smile pulses every 5s
      const doExcite = () => {
        playOnce(ANIM.mouthCornerUp, 1);
        exprTimer.current = setTimeout(doExcite, 5000 + Math.random() * 2000);
      };
      setTimeout(doExcite, 2000);
    }

    if (pose === 'thinking') {
      playLoop(ANIM.mouthNoseFrown, 0.3);
      playOnce(ANIM.cheeksFrown, 0.2);
    }

    if (pose === 'writing' || pose === 'painting') {
      // Focused — slight brow furrow
      playOnce(ANIM.mouthNoseFrown, 0.15);
    }

    if (pose === 'finished') {
      playOnce(ANIM.mouthCornerUp, 1);
      playOnce(ANIM.cheeks, 0.5);
      playOnce(ANIM.eyebrow, 0.8);
    }

    return () => { if (exprTimer.current) clearTimeout(exprTimer.current); };
  }, [pose, playOnce, playLoop, stopAnim]);

  // ── Bone-driven motion (wave, head tilt, eye wander) ─────────────────────
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const b = boneRef.current;

    // Whole-body gentle sway
    group.current.rotation.y = Math.sin(t * 0.28) * 0.04;
    group.current.position.y = Math.sin(t * 0.55) * 0.012;

    // HEAD: subtle nod always + pose-based tilt
    if (b['c_head.x']) {
      const thinkTilt = pose === 'thinking' ? Math.PI * 0.06 : 0;
      b['c_head.x'].rotation.z = Math.sin(t * 0.35) * 0.018 + thinkTilt;
      b['c_head.x'].rotation.x = Math.sin(t * 0.4) * 0.012;
    }
    if (b['c_neck.x']) {
      b['c_neck.x'].rotation.z = Math.sin(t * 0.3) * 0.01;
    }

    // EYES: slow wander
    if (b['c_eye.l'] && b['c_eye.r']) {
      const eyeX = Math.sin(t * 0.19) * 0.08;
      const eyeZ = Math.sin(t * 0.23) * 0.05;
      b['c_eye.l'].rotation.x = eyeX;
      b['c_eye.l'].rotation.z = eyeZ;
      b['c_eye.r'].rotation.x = eyeX;
      b['c_eye.r'].rotation.z = eyeZ;
    }

    // RIGHT ARM: wave on welcome/excited
    if (b['c_arm_fk.r']) {
      if (pose === 'welcome' || pose === 'excited') {
        const speed = pose === 'excited' ? 3.2 : 2.4;
        const amp   = pose === 'excited' ? 0.45 : 0.32;
        b['c_arm_fk.r'].rotation.z = Math.sin(t * speed) * amp + 0.9; // raised + wave
        b['c_arm_fk.r'].rotation.x = 0.2;
      } else {
        // Relax arm back to rest gradually
        b['c_arm_fk.r'].rotation.z += (0 - b['c_arm_fk.r'].rotation.z) * 0.05;
        b['c_arm_fk.r'].rotation.x += (0 - b['c_arm_fk.r'].rotation.x) * 0.05;
      }
    }
    if (b['c_forearm_fk.r']) {
      if (pose === 'welcome' || pose === 'excited') {
        b['c_forearm_fk.r'].rotation.x = Math.sin(t * 2.8) * 0.2 + 0.4; // slight forearm flick
      } else {
        b['c_forearm_fk.r'].rotation.x += (0 - b['c_forearm_fk.r'].rotation.x) * 0.05;
      }
    }

    // SPINE: slight forward lean for writing/painting
    if (b['c_spine_02.x']) {
      const lean = (pose === 'writing' || pose === 'painting') ? 0.06 : 0;
      b['c_spine_02.x'].rotation.x += (lean - b['c_spine_02.x'].rotation.x) * 0.04;
    }

    // JAW: subtle life-breathing micro-movement
    if (b['c_jawbone.x']) {
      b['c_jawbone.x'].rotation.x = Math.sin(t * 0.9) * 0.003;
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
      position:'relative', background:'#FFFEF9', border:'2px solid #E8E0D0',
      borderRadius:'14px', padding:'10px 16px', maxWidth:'240px',
      fontSize:'0.875rem', fontFamily:'Georgia,serif', fontStyle:'italic',
      color:'#1C1614', lineHeight:1.55, textAlign:'center',
      boxShadow:'0 2px 16px rgba(0,0,0,0.07)',
      animation:'bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {text}
      <div style={{ position:'absolute', bottom:-11, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'9px solid transparent', borderRight:'9px solid transparent', borderTop:'11px solid #E8E0D0' }} />
      <div style={{ position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'9px solid #FFFEF9' }} />
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
          width:size, height:h, flexShrink:0,
          background: darkBackground ? '#1C1614' : 'transparent',
          borderRadius:16, overflow:'hidden',
          boxShadow: darkBackground ? '0 8px 32px rgba(116,21,21,0.15)' : 'none',
        }}>
          <Canvas
            camera={{ position:[0, 1.0, 3.5], fov:32 }}
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
