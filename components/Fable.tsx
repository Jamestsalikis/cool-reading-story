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
  @keyframes fableSpin {
    to { transform: rotate(360deg); }
  }
`;

// Only show known character meshes — everything else is a cage/handle
const CHAR_MATS = new Set([
  'HairBase_S1','HairDetail_S1','Skin_Body','Skin_Face_2',
  'SHIRTS','PANTS','Lips.003','Teeth.003','Tongue.003',
  'FABRIC 1_FRONT_3426.003','Material3413',
]);
const isCharMat = (n: string) =>
  CHAR_MATS.has(n) || n.startsWith('Tiny Iris') || n.startsWith('Tiny Sclera');

// Confirmed skin-joint deformation bones
const BONE = {
  armR:     'arm.r',
  forearmR: 'forearm.r',
  shoulderR:'shoulder.r',
  headX:    'head.x',
  spine02:  'spine_02.x',
};

// Camera looks at upper body
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(0, 0.2, 0); }, [camera]);
  return null;
}

// Loading dot shown while 33 MB GLB streams in
function LoadingDot() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshBasicMaterial color="#C8A882" />
    </mesh>
  );
}

function AuroraCharacter({ pose }: { pose: FablePose }) {
  const group = useRef<THREE.Group>(null);
  const bones = useRef<Record<string, THREE.Object3D>>({});

  const { scene, animations } = useGLTF('/fable/aurora.glb');
  const { actions }           = useAnimations(animations, group);

  // Scene setup — runs once when GLB loads
  useEffect(() => {
    const boneSet = new Set(Object.values(BONE));

    scene.traverse((child: THREE.Object3D) => {
      // Collect deformation bones
      if (boneSet.has(child.name)) {
        bones.current[child.name] = child;
      }

      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mats  = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const names = mats.map((m: THREE.Material) => m.name || '');

      // Hide anything not in the character whitelist
      if (!names.some(isCharMat)) { mesh.visible = false; return; }

      mats.forEach((mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;

        // Fix colour space
        if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.needsUpdate = true; }
        if (m.normalMap)    m.normalMap.colorSpace    = THREE.LinearSRGBColorSpace;
        if (m.roughnessMap) m.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;

        // White top
        if (m.name === 'SHIRTS' || m.name === 'FABRIC 1_FRONT_3426.003') {
          m.map = null; m.color.set('#EDE9E3'); m.roughness = 0.65; m.metalness = 0;
        }
        // Blue bottom
        if (m.name === 'PANTS' || m.name === 'Material3413') {
          m.map = null; m.color.set('#1B4FA6'); m.roughness = 0.7; m.metalness = 0;
        }
        // Iris — dark brown so pupils are visible
        if (m.name.startsWith('Tiny Iris')) {
          m.map = null; m.color.set('#1C0E06'); m.roughness = 0.1; m.metalness = 0;
        }

        m.needsUpdate = true;
      });
    });
  }, [scene]);

  // Animations
  const breathingStarted = useRef(false);
  const blinkTimer       = useRef<ReturnType<typeof setTimeout>>();
  const browTimer        = useRef<ReturnType<typeof setTimeout>>();

  const safePlay = useCallback((name: string, loop: boolean, weight = 1) => {
    const a = actions[name];
    if (!a) return;
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    a.clampWhenFinished = !loop;
    a.reset().setEffectiveWeight(weight).fadeIn(0.3).play();
  }, [actions]);

  const safeStop = useCallback((name: string) => {
    actions[name]?.fadeOut(0.3);
  }, [actions]);

  // Breathing — always on
  useEffect(() => {
    if (breathingStarted.current) return;
    if (!actions['zrig_breathing']) return; // wait until actions are ready
    breathingStarted.current = true;
    safePlay('zrig_breathing', true, 0.8);
    safePlay('zrig_eyelids_lower', true, 0.4);
  }, [actions, safePlay]);

  // Blink every 3–5 s
  useEffect(() => {
    const next = () => {
      blinkTimer.current = setTimeout(() => {
        safePlay('zrig_eyelids_upper', false, 1);
        next();
      }, 3000 + Math.random() * 2000);
    };
    next();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [safePlay]);

  // Eyebrow + arm wave + expressions — per pose
  useEffect(() => {
    if (browTimer.current) clearTimeout(browTimer.current);
    safeStop('Eyebrow');
    safeStop('ARM-TEST');
    safeStop('Facial_Expression');

    const energetic = pose === 'welcome' || pose === 'excited' || pose === 'finished';

    // Eyebrow raises
    const browPulse = () => {
      safePlay('Eyebrow', false, energetic ? 1 : 0.5);
      browTimer.current = setTimeout(browPulse, (energetic ? 1800 : 5000) + Math.random() * 1000);
    };
    browTimer.current = setTimeout(browPulse, 600);

    // Arm wave on welcome/excited — cage meshes are now hidden so it looks clean
    if (pose === 'welcome' || pose === 'excited') {
      const doWave = () => {
        const a = actions['ARM-TEST'];
        if (a) {
          a.setLoop(THREE.LoopOnce, 1);
          a.clampWhenFinished = true;
          a.reset().setEffectiveWeight(1).fadeIn(0.2).play();
          const dur = (a.getClip().duration * 1000) - 200;
          setTimeout(doWave, dur + 2000 + Math.random() * 2000);
        }
      };
      setTimeout(doWave, 800);
    }

    // Smile on energetic poses
    if (energetic) {
      safePlay('Facial_Expression', true, 0.7);
    }

    return () => { if (browTimer.current) clearTimeout(browTimer.current); };
  }, [pose, actions, safePlay, safeStop]);

  // Bone-driven motion — priority 1 runs AFTER the AnimationMixer (priority 0)
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    // Gentle body sway
    group.current.rotation.y = Math.sin(t * 0.3) * 0.04;
    group.current.position.y = Math.sin(t * (pose === 'excited' ? 2.0 : 1.1)) *
                               (pose === 'excited' ? 0.02 : 0.01);

    // Head nod + thinking tilt
    const head = bones.current[BONE.headX];
    if (head) {
      head.rotation.z = Math.sin(t * 0.4) * 0.022 + (pose === 'thinking' ? 0.13 : 0);
      head.rotation.x = Math.sin(t * 0.5) * 0.012;
    }

    // Arm wave on welcome / excited
    const sh = bones.current[BONE.shoulderR];
    const ar = bones.current[BONE.armR];
    const fr = bones.current[BONE.forearmR];

    if (pose === 'welcome' || pose === 'excited') {
      const spd = pose === 'excited' ? 3.5 : 2.5;
      const amp = pose === 'excited' ? 0.5  : 0.35;
      if (sh) { sh.rotation.y = 0.5 + Math.sin(t * spd * 0.5) * 0.12; sh.rotation.x = -0.25; }
      if (ar) { ar.rotation.y = -(0.8 + Math.sin(t * spd) * amp); ar.rotation.x = 0.15; }
      if (fr) { fr.rotation.x = 0.5 + Math.sin(t * spd + 1) * 0.25; }
    } else {
      if (sh) { sh.rotation.y *= 0.92; sh.rotation.x *= 0.92; }
      if (ar) { ar.rotation.y *= 0.92; ar.rotation.x *= 0.92; }
      if (fr) { fr.rotation.x *= 0.92; }
    }

    // Slight forward lean for writing/painting
    const sp = bones.current[BONE.spine02];
    if (sp) {
      const lean = (pose === 'writing' || pose === 'painting') ? 0.07 : 0;
      sp.rotation.x += (lean - sp.rotation.x) * 0.05;
    }
  }, 1); // priority 1 = after mixer

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.9} position={[0, -1.8, 0]} />
    </group>
  );
}

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
      <div style={{position:'absolute',bottom:-11,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'9px solid transparent',borderRight:'9px solid transparent',borderTop:'11px solid #E8E0D0'}} />
      <div style={{position:'absolute',bottom:-8, left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderTop:'9px solid #FFFEF9'}} />
    </div>
  );
}

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

  const h = size * 1.45;

  return (
    <>
      <style>{styles}</style>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
        {showBubble && displayText && <DialogueBubble text={displayText} />}
        <div style={{
          width:size, height:h, flexShrink:0,
          background: darkBackground ? '#1C1614' : 'transparent',
          borderRadius:16, overflow:'hidden',
          boxShadow: darkBackground ? '0 8px 32px rgba(116,21,21,0.15)' : 'none',
        }}>
          <Canvas
            camera={{ position:[0, 0.6, 4.2], fov:50 }}
            style={{width:'100%', height:'100%'}}
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
            <Suspense fallback={<LoadingDot />}>
              <AuroraCharacter pose={pose} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </>
  );
}

useGLTF.preload('/fable/aurora.glb');
