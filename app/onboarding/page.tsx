'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createChild } from '@/lib/supabase/child-actions';
import Fable, { type FablePose } from '@/components/Fable';

type Person = { name: string; nickname: string };

type OnboardingState = {
  step: number;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  customInterest: string;
  followUpAnswers: Record<string, string>; // key: "Interest::Question"
  hairColour: string;
  eyeColour: string;
  siblings: Person[];
  friends: Person[];
  petName: string;
  petType: string;
  city: string;
  country: string;
  readingLevel: string;
};

// Each interest has a gradient pair + shadow colour for the selected tile
const INTEREST_OPTIONS = [
  { emoji: '🦸', label: 'Superheroes',   g: ['#4F46E5','#7C3AED'], sh: 'rgba(79,70,229,0.40)' },
  { emoji: '🧙', label: 'Fantasy',       g: ['#6D28D9','#9333EA'], sh: 'rgba(109,40,217,0.40)' },
  { emoji: '🧚', label: 'Fairies',       g: ['#DB2777','#F472B6'], sh: 'rgba(219,39,119,0.40)' },
  { emoji: '🦄', label: 'Unicorns',      g: ['#9333EA','#EC4899'], sh: 'rgba(147,51,234,0.40)' },
  { emoji: '👑', label: 'Princesses',    g: ['#D97706','#F472B6'], sh: 'rgba(217,119,6,0.40)' },
  { emoji: '🏴‍☠️', label: 'Pirates',   g: ['#1E3A5F','#374151'], sh: 'rgba(30,58,95,0.40)' },
  { emoji: '🪄', label: 'Magic',         g: ['#7C3AED','#A855F7'], sh: 'rgba(124,58,237,0.40)' },
  { emoji: '👽', label: 'Aliens',        g: ['#059669','#10B981'], sh: 'rgba(5,150,105,0.40)' },
  { emoji: '🦕', label: 'Dinosaurs',     g: ['#15803D','#22C55E'], sh: 'rgba(21,128,61,0.40)' },
  { emoji: '🐾', label: 'Animals',       g: ['#D97706','#F59E0B'], sh: 'rgba(217,119,6,0.40)' },
  { emoji: '🌊', label: 'Ocean',         g: ['#0284C7','#38BDF8'], sh: 'rgba(2,132,199,0.40)' },
  { emoji: '🌿', label: 'Nature',        g: ['#16A34A','#4ADE80'], sh: 'rgba(22,163,74,0.40)' },
  { emoji: '🚀', label: 'Space',         g: ['#312E81','#4F46E5'], sh: 'rgba(49,46,129,0.40)' },
  { emoji: '🤖', label: 'Robots',        g: ['#334155','#3B82F6'], sh: 'rgba(51,65,85,0.40)' },
  { emoji: '🔬', label: 'Science',       g: ['#0891B2','#22D3EE'], sh: 'rgba(8,145,178,0.40)' },
  { emoji: '🎮', label: 'Gaming',        g: ['#4F46E5','#7C3AED'], sh: 'rgba(79,70,229,0.40)' },
  { emoji: '⚽', label: 'Soccer',        g: ['#15803D','#4ADE80'], sh: 'rgba(21,128,61,0.40)' },
  { emoji: '🏈', label: 'Football',      g: ['#92400E','#D97706'], sh: 'rgba(146,64,14,0.40)' },
  { emoji: '🤸', label: 'Gymnastics',    g: ['#BE185D','#F472B6'], sh: 'rgba(190,24,93,0.40)' },
  { emoji: '💃', label: 'Dancing',       g: ['#DC2626','#F87171'], sh: 'rgba(220,38,38,0.40)' },
  { emoji: '🥋', label: 'Karate',        g: ['#B45309','#EF4444'], sh: 'rgba(180,83,9,0.40)' },
  { emoji: '🏊', label: 'Swimming',      g: ['#0284C7','#7DD3FC'], sh: 'rgba(2,132,199,0.40)' },
  { emoji: '🎨', label: 'Art',           g: ['#EA580C','#FBBF24'], sh: 'rgba(234,88,12,0.40)' },
  { emoji: '🎵', label: 'Music',         g: ['#7C3AED','#C084FC'], sh: 'rgba(124,58,237,0.40)' },
  { emoji: '🍳', label: 'Cooking',       g: ['#D97706','#FB923C'], sh: 'rgba(217,119,6,0.40)' },
  { emoji: '🪆', label: 'Dolls',         g: ['#DB2777','#FB7185'], sh: 'rgba(219,39,119,0.40)' },
  { emoji: '🚗', label: 'Cars & Trucks', g: ['#DC2626','#F97316'], sh: 'rgba(220,38,38,0.40)' },
];

// 2 questions per interest — specific enough to give Claude vivid details
const FOLLOW_UP_QUESTIONS: Record<string, { q: string; placeholder: string }[]> = {
  'Superheroes':  [
    { q: 'If you could have one superpower, what would it be?',   placeholder: 'e.g. Flying, invisibility, super speed' },
    { q: 'What would your superhero name be?',                    placeholder: 'e.g. Captain Blaze, Shadow Girl' },
  ],
  'Fantasy': [
    { q: 'Would you rather be a wizard, a knight, or a dragon?',  placeholder: 'e.g. A wizard with a talking staff' },
    { q: 'What magical creature would be your companion?',        placeholder: 'e.g. A tiny phoenix named Ember' },
  ],
  'Fairies': [
    { q: 'What would your fairy name be?',                        placeholder: 'e.g. Dewdrop, Moonshine' },
    { q: 'Where would your secret fairy hideout be?',             placeholder: 'e.g. Inside a giant mushroom' },
  ],
  'Unicorns': [
    { q: 'What would you name your unicorn?',                     placeholder: 'e.g. Stardust, Rainbow' },
    { q: 'What colour would your unicorn be?',                    placeholder: 'e.g. Lavender with a silver mane' },
  ],
  'Princesses': [
    { q: 'What would your kingdom be called?',                    placeholder: 'e.g. The Crystal Kingdom' },
    { q: 'What would your royal pet be?',                         placeholder: 'e.g. A tiny dragon, a white horse' },
  ],
  'Pirates': [
    { q: 'What would you name your pirate ship?',                 placeholder: 'e.g. The Golden Wave' },
    { q: 'What treasure are you searching for?',                  placeholder: 'e.g. A map that grants wishes' },
  ],
  'Magic': [
    { q: 'If you had a magic wand, what would you use it for?',   placeholder: 'e.g. Turn vegetables into cake' },
    { q: 'What would your most powerful spell do?',               placeholder: 'e.g. Make everyone giggle forever' },
  ],
  'Aliens': [
    { q: 'If you discovered a new planet, what would you name it?', placeholder: 'e.g. Planet Zibblox' },
    { q: 'Would your aliens be friendly, mischievous, or mysterious?', placeholder: 'e.g. Friendly but very confused by Earth' },
  ],
  'Dinosaurs': [
    { q: "What's your favourite dinosaur?",                       placeholder: 'e.g. T-Rex, Brachiosaurus' },
    { q: 'If you had a pet dinosaur, what would you name it?',    placeholder: 'e.g. Stompy, Tiny' },
  ],
  'Animals': [
    { q: "What's your favourite animal?",                         placeholder: 'e.g. Red pandas, elephants' },
    { q: 'If you could talk to any animal, which would you choose?', placeholder: 'e.g. A dolphin, my dog' },
  ],
  'Ocean': [
    { q: "What's your favourite sea creature?",                   placeholder: 'e.g. Octopus, clownfish' },
    { q: 'Would you rather be a mermaid, a sailor, or a deep-sea explorer?', placeholder: 'e.g. A mermaid with glittery fins' },
  ],
  'Nature': [
    { q: 'Do you prefer forests, mountains, or meadows?',         placeholder: 'e.g. An enchanted forest' },
    { q: "What's your favourite outdoor adventure?",              placeholder: 'e.g. Looking for bugs, climbing trees' },
  ],
  'Space': [
    { q: 'What would you name your spaceship?',                   placeholder: 'e.g. The Starblazer 3000' },
    { q: 'Which planet would you visit first?',                   placeholder: 'e.g. Saturn, a made-up one with candy rings' },
  ],
  'Robots': [
    { q: "What's your robot's name and what can it do?",          placeholder: 'e.g. RoboMax — makes pancakes and tells jokes' },
    { q: 'Would your robot be big or small, silly or serious?',   placeholder: 'e.g. Tiny and very sarcastic' },
  ],
  'Science': [
    { q: 'If you could invent anything, what would it be?',       placeholder: 'e.g. A machine that turns homework into pizza' },
    { q: 'What scientific mystery would you love to solve?',      placeholder: 'e.g. Why cats purr, how black holes work' },
  ],
  'Gaming': [
    { q: "What's your favourite video game?",                     placeholder: 'e.g. Minecraft, Mario Kart' },
    { q: 'If you could jump inside any game, which one would you choose?', placeholder: 'e.g. Minecraft so I can build anything' },
  ],
  'Soccer': [
    { q: 'What position do you play?',                            placeholder: 'e.g. Striker, goalkeeper' },
    { q: "What's your team's name?",                              placeholder: 'e.g. The Blue Tigers' },
  ],
  'Football': [
    { q: 'What position do you play?',                            placeholder: 'e.g. Quarterback, wide receiver' },
    { q: 'What number would be on your jersey?',                  placeholder: 'e.g. 7, 23' },
  ],
  'Gymnastics': [
    { q: "What's your best move?",                                placeholder: 'e.g. Cartwheel, backbend, round-off' },
    { q: "What's your dream competition?",                        placeholder: 'e.g. The Olympics, a world championship' },
  ],
  'Dancing': [
    { q: 'What style of dance do you love?',                      placeholder: 'e.g. Ballet, hip hop, jazz' },
    { q: "What's your favourite song to dance to?",               placeholder: 'e.g. Any Taylor Swift song' },
  ],
  'Karate': [
    { q: 'What belt are you?',                                    placeholder: 'e.g. Yellow belt, no belt yet' },
    { q: 'What would your warrior name be?',                      placeholder: 'e.g. Shadow Fist, Lightning Kick' },
  ],
  'Swimming': [
    { q: "What's your favourite stroke?",                         placeholder: 'e.g. Freestyle, butterfly' },
    { q: 'Do you prefer the pool or the ocean?',                  placeholder: 'e.g. The ocean — it feels like an adventure' },
  ],
  'Art': [
    { q: "What's your favourite thing to draw or paint?",         placeholder: 'e.g. Dragons, rainbows, portraits of my dog' },
    { q: "What's the best thing you've ever made?",               placeholder: 'e.g. A clay sculpture of a turtle' },
  ],
  'Music': [
    { q: 'Do you play an instrument? Which one?',                 placeholder: 'e.g. Piano, guitar, or I sing' },
    { q: "What's your favourite song right now?",                 placeholder: 'e.g. Anything from Frozen' },
  ],
  'Cooking': [
    { q: "What's your favourite thing to cook or bake?",          placeholder: 'e.g. Chocolate chip cookies, pancakes' },
    { q: 'If you had your own restaurant, what would it be called and serve?', placeholder: 'e.g. "Princess Kitchen" — only desserts' },
  ],
  'Dolls': [
    { q: "What are your favourite dolls' names?",                 placeholder: 'e.g. Bella, Princess Rose, Captain Tiny' },
    { q: 'What adventures do your dolls go on?',                  placeholder: 'e.g. They explore a magical toy kingdom' },
  ],
  'Cars & Trucks': [
    { q: "What's your dream car or truck?",                       placeholder: 'e.g. A red race car, a giant monster truck' },
    { q: 'Would you rather drive a race car, a monster truck, or a fire engine?', placeholder: 'e.g. Monster truck — so I can crush everything' },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    step: 2,
    name: '',
    age: 6,
    gender: '',
    interests: [],
    customInterest: '',
    followUpAnswers: {},
    hairColour: '',
    eyeColour: '',
    siblings: [],
    friends: [],
    petName: '',
    petType: '',
    city: '',
    country: '',
    readingLevel: '',
  });

  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [nameError, setNameError] = useState('');

  // Build the list of follow-up questions from selected interests
  const followUpSections = state.interests
    .filter((i) => FOLLOW_UP_QUESTIONS[i])
    .map((interest) => ({
      interest,
      emoji: INTEREST_OPTIONS.find((o) => o.label === interest)?.emoji ?? '⭐',
      questions: FOLLOW_UP_QUESTIONS[interest],
    }));

  const handleNext = async () => {
    if (state.step === 2) {
      if (!state.name.trim()) { setNameError("Please enter your child's name"); return; }
      setNameError('');
      setState({ ...state, step: 3 });
    } else if (state.step === 3) {
      setState({ ...state, step: 4 });
    } else if (state.step === 4) {
      setState({ ...state, step: 5 });
    } else {
      setSubmitting(true);
      setSubmitError('');
      try {
        // Format follow-up answers for the story prompt
        const followUpList = Object.entries(state.followUpAnswers)
          .filter(([, v]) => v.trim())
          .map(([key, answer]) => {
            const [, question] = key.split('::');
            return { question, answer };
          });

        const result = await createChild({
          name: state.name,
          age: state.age,
          gender: state.gender,
          interests: state.interests,
          followUpAnswers: followUpList,
          hairColour: state.hairColour,
          eyeColour: state.eyeColour,
          siblings: state.siblings,
          friends: state.friends,
          petName: state.petName,
          petType: state.petType,
          city: state.city,
          country: state.country,
          readingLevel: state.readingLevel || 'medium',
        });

        if (result.error || !result.child) {
          setSubmitError(result.error || 'Failed to save profile');
          setSubmitting(false);
          return;
        }

        fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ child_id: result.child.id }),
        });

        router.push('/dashboard');
      } catch {
        setSubmitError('Something went wrong. Please try again.');
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (state.step > 2) setState({ ...state, step: state.step - 1 });
  };

  const handleInterestToggle = (label: string) => {
    setState((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  };

  const handleAddCustomInterest = () => {
    if (state.customInterest.trim()) {
      setState((prev) => ({
        ...prev,
        interests: [...prev.interests, state.customInterest.trim()],
        customInterest: '',
      }));
      setShowCustomInterest(false);
    }
  };

  const setAnswer = (interest: string, question: string, value: string) => {
    setState((prev) => ({
      ...prev,
      followUpAnswers: { ...prev.followUpAnswers, [`${interest}::${question}`]: value },
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.875rem',
    border: '1.5px solid #E8E0D0', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none',
    backgroundColor: '#fff', color: '#1A1209',
  };

  const chipBase: React.CSSProperties = {
    cursor: 'pointer', borderRadius: '8px',
    fontWeight: '500', fontSize: '0.85rem', padding: '0.5rem 1rem', transition: 'all 0.15s',
    border: 'none',
  };

  const chip = (active: boolean): React.CSSProperties => ({
    ...chipBase,
    border: `1.5px solid ${active ? '#741515' : '#E8E0D0'}`,
    backgroundColor: active ? '#741515' : '#fff',
    color: active ? '#fff' : '#1A1209',
  });

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1A1209', fontSize: '0.9rem' };
  const optionalLabel: React.CSSProperties = { ...labelStyle, color: '#6B5E4E' };

  const TOTAL_STEPS = 4; // steps 2–5 = 4 visible dots
  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
      {[2, 3, 4, 5].map((s) => (
        <div key={s} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: state.step >= s ? '#741515' : '#E8E0D0', transition: 'background-color 0.3s' }} />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', padding: '32px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Fable intro */}
        {(() => {
          const fableConfig: Record<number, { pose: FablePose; dialogue: string }> = {
            2: { pose: 'welcome',  dialogue: "Hi, I'm Fable! I write personalised stories. Tell me about your child." },
            3: { pose: 'writing',  dialogue: "Ooh, what do they love? The more I know, the better the story!" },
            4: { pose: 'thinking', dialogue: "Perfect. I'm already getting ideas..." },
            5: { pose: 'thinking', dialogue: "Almost ready. Just a few final details..." },
          };
          const cfg = fableConfig[state.step];
          return cfg ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <Fable pose={cfg.pose} dialogue={cfg.dialogue} size={120} />
            </div>
          ) : null;
        })()}

        {/* ── Step 2: Name / Age / Gender ── */}
        {state.step === 2 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>Tell us about your child</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>This is how they'll appear as the hero of every story</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Child's name <span style={{ color: '#741515' }}>*</span></label>
              <input type="text" style={{ ...inputStyle, borderColor: nameError ? '#991B1B' : '#E8E0D0' }} placeholder="e.g. Leo" value={state.name}
                onChange={(e) => { setState({ ...state, name: e.target.value }); setNameError(''); }} />
              {nameError && <p style={{ color: '#991B1B', fontSize: '0.8rem', marginTop: '6px' }}>{nameError}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Age <span style={{ color: '#741515' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setState({ ...state, age: Math.max(3, state.age - 1) })} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1.5px solid #E8E0D0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}>−</button>
                <span style={{ fontSize: '1.5rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{state.age}</span>
                <button onClick={() => setState({ ...state, age: Math.min(12, state.age + 1) })} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1.5px solid #E8E0D0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}>+</button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Gender</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Boy', 'Girl', 'Skip'].map((option) => (
                  <button key={option} onClick={() => setState({ ...state, gender: option })} style={chip(state.gender === option)}>{option}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={handleNext} className="btn-brand" style={{ flex: 1, padding: '0.75rem 1.75rem' }}>Next step</button>
              <Link href="/signup" style={{ color: '#741515', textDecoration: 'none', fontWeight: '500' }}>Back</Link>
            </div>
          </div>
        )}

        {/* ── Step 3: Interests ── */}
        {state.step === 3 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>What does {state.name || 'your child'} love?</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>Select at least 2 — these shape every story</p>

            <style>{`
              .int-tile { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; cursor: pointer; }
              .int-tile:hover { transform: translateY(-4px) scale(1.06); }
              .int-tile:active { transform: scale(0.95); }

              @keyframes it-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.15;transform:scale(0.5)} }
              @keyframes it-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
              @keyframes it-spin    { to{transform:rotate(360deg)} }
              @keyframes it-bob     { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-6px) rotate(3deg)} }
              @keyframes it-wave-y  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
              @keyframes it-pulse   { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }

              @keyframes it-zoom    { 0%{transform:translate(-25px,18px) rotate(-35deg);opacity:0} 25%,75%{opacity:1} 100%{transform:translate(50px,-30px) rotate(-35deg);opacity:0} }
              @keyframes it-swim    { 0%{transform:translateX(-20px);opacity:0} 20%,80%{opacity:1} 100%{transform:translateX(55px);opacity:0} }
              @keyframes it-car-go  { 0%{transform:translateX(-28px);opacity:0} 20%,80%{opacity:1} 100%{transform:translateX(55px);opacity:0} }
              @keyframes it-up      { 0%{transform:translateY(0);opacity:0} 20%{opacity:0.9} 100%{transform:translateY(-22px);opacity:0} }
              @keyframes it-draw    { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
              @keyframes it-bloom   { 0%{transform:scale(0);opacity:0} 100%{transform:scale(1);opacity:1} }
              @keyframes it-flash   { 0%,100%{opacity:0} 15%,45%{opacity:1} 50%,60%{opacity:0.5} 65%{opacity:0} }
              @keyframes it-bounce  { 0%,100%{transform:translateY(0) scaleY(1)} 45%{transform:translateY(-12px) scaleY(1)} 55%{transform:translateY(0) scaleY(0.75)} 65%{transform:translateY(-5px) scaleY(1)} }
              @keyframes it-orbit   { 0%{transform:rotate(0deg) translateX(14px)} 100%{transform:rotate(360deg) translateX(14px)} }
              @keyframes it-walk    { 0%{transform:translateX(-20px);opacity:0} 20%,75%{opacity:1} 100%{transform:translateX(50px);opacity:0} }
              @keyframes it-appear  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
              @keyframes it-run     { 0%{transform:translateX(0)} 100%{transform:translateX(28px)} }
              @keyframes it-beam    { 0%,100%{transform:scaleY(0.3);opacity:0} 50%{transform:scaleY(1);opacity:0.7} }
              @keyframes it-stir    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
              @keyframes it-leaf    { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 20%{opacity:1} 100%{transform:translate(20px,-20px) rotate(120deg);opacity:0} }
              @keyframes it-ribbon  { 0%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} 100%{transform:rotate(-10deg)} }

              .it-twinkle  { animation: it-twinkle 2s ease-in-out infinite; }
              .it-float    { animation: it-float 3s ease-in-out infinite; }
              .it-spin-s   { animation: it-spin 5s linear infinite; }
              .it-bob      { animation: it-bob 2.5s ease-in-out infinite; }
              .it-wave-y   { animation: it-wave-y 2s ease-in-out infinite; }
              .it-pulse    { animation: it-pulse 1.8s ease-in-out infinite; }
              .it-ribbon   { animation: it-ribbon 2s ease-in-out infinite; }

              .int-tile:hover .it-zoom   { animation: it-zoom 1.8s ease-in-out infinite; }
              .int-tile:hover .it-swim   { animation: it-swim 2s ease-in-out infinite; }
              .int-tile:hover .it-car    { animation: it-car-go 1.3s ease-in-out infinite; }
              .int-tile:hover .it-up     { animation: it-up 1.5s ease-out infinite; }
              .int-tile:hover .it-draw   { animation: it-draw 0.8s ease forwards; }
              .int-tile:hover .it-bloom  { animation: it-bloom 0.4s ease forwards; }
              .int-tile:hover .it-flash  { animation: it-flash 1s ease infinite; }
              .int-tile:hover .it-bounce { animation: it-bounce 0.7s ease-in-out infinite; }
              .int-tile:hover .it-orbit  { animation: it-orbit 1.2s linear infinite; }
              .int-tile:hover .it-walk   { animation: it-walk 2s ease-in-out infinite; }
              .int-tile:hover .it-appear { animation: it-appear 0.4s ease forwards; }
              .int-tile:hover .it-spin-f { animation: it-spin 0.5s linear infinite; }
              .int-tile:hover .it-beam   { animation: it-beam 1.2s ease-in-out infinite; }
              .int-tile:hover .it-stir   { animation: it-stir 1s linear infinite; }
              .int-tile:hover .it-leaf   { animation: it-leaf 2s ease-out infinite; }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {INTEREST_OPTIONS.map((option) => {
                const active = state.interests.includes(option.label);
                const a = (o: number) => `rgba(255,255,255,${o})`;
                const p = (o: number) => `rgba(0,0,0,${o})`;
                const c  = (o: number) => active ? a(o) : p(o * 0.6);
                const scene: Record<string, React.ReactNode> = {
                  'Space': (<>
                    {[[8,8],[22,5],[45,10],[62,6],[72,30],[15,40],[55,45],[38,50]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?2:1.2} fill={c(0.7)} className="it-twinkle" style={{animationDelay:`${i*0.28}s`}}/>)}
                    <circle cx="68" cy="13" r="10" fill={c(0.2)}/>
                    <circle cx="72" cy="11" r="9"  fill={active?'rgba(49,46,129,0.7)':'white'}/>
                    <g className="it-zoom" style={{transformOrigin:'20px 38px'}}>
                      <ellipse cx="20" cy="38" rx="4" ry="9" fill={c(0.9)} transform="rotate(-35,20,38)"/>
                      <polygon points="20,27 16,37 24,37" fill={c(0.6)} transform="rotate(-35,20,27)"/>
                      <line x1="14" y1="44" x2="11" y2="50" stroke="#F97316" strokeWidth="2.5" className="it-flash"/>
                      <line x1="26" y1="44" x2="29" y2="50" stroke="#F97316" strokeWidth="2.5" className="it-flash" style={{animationDelay:'0.1s'}}/>
                    </g>
                  </>),
                  'Art': (<>
                    <rect x="12" y="8" width="56" height="42" rx="3" fill="none" stroke={c(0.3)} strokeWidth="1.5"/>
                    <rect x="15" y="11" width="50" height="36" rx="2" fill={c(0.06)}/>
                    <circle cx="30" cy="28" r="8"  fill={active?'rgba(255,200,0,0.35)':p(0.07)}/>
                    <circle cx="46" cy="22" r="6"  fill={active?'rgba(255,80,80,0.35)':p(0.07)}/>
                    <circle cx="42" cy="36" r="7"  fill={active?'rgba(60,180,60,0.35)':p(0.07)}/>
                    <circle cx="58" cy="32" r="5"  fill={active?'rgba(80,120,255,0.35)':p(0.07)}/>
                    <g className="it-float" style={{transformOrigin:'65px 12px'}}>
                      <rect x="63" y="6" width="4" height="20" rx="2" fill={c(0.7)}/>
                      <ellipse cx="65" cy="27" rx="3.5" ry="4" fill={active?'rgba(255,200,0,0.9)':p(0.25)}/>
                    </g>
                    <path className="it-draw" d="M18,42 Q30,34 45,39 Q56,43 63,37" fill="none" stroke={active?'rgba(255,200,50,0.9)':p(0.2)} strokeWidth="2.5" strokeDasharray="60" strokeLinecap="round"/>
                  </>),
                  'Ocean': (<>
                    {[20,30,40].map((y,i)=><line key={i} x1="5" y1={y} x2="75" y2={y} stroke={c(0.08)} strokeWidth="1"/>)}
                    <path d="M0,42 Q10,36 20,42 Q30,48 40,42 Q50,36 60,42 Q70,48 80,42" fill={c(0.2)} className="it-wave-y"/>
                    <path d="M0,50 Q10,44 20,50 Q30,56 40,50 Q50,44 60,50 Q70,56 80,50" fill={c(0.3)} className="it-wave-y" style={{animationDelay:'0.5s'}}/>
                    {[12,28,44,60].map((cx,i)=><circle key={i} cx={cx} cy={20+i*4} r={2.5} fill={c(0.2)} className="it-up" style={{animationDelay:`${i*0.4}s`}}/>)}
                    <g className="it-swim" style={{transformOrigin:'15px 30px'}}>
                      <ellipse cx="15" cy="30" rx="10" ry="5" fill={c(0.8)}/>
                      <polygon points="25,30 32,25 32,35" fill={c(0.6)}/>
                      <circle cx="12" cy="29" r="1.5" fill={active?'rgba(49,46,129,0.9)':'rgba(0,0,0,0.5)'}/>
                    </g>
                  </>),
                  'Nature': (<>
                    {[[10,50],[25,45],[55,48],[70,42]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={8+i*2} ry={6} fill={c(0.15)} className="it-wave-y" style={{animationDelay:`${i*0.3}s`}}/>)}
                    <circle cx="40" cy="15" r="12" fill={c(0.15)} className="it-pulse"/>
                    <circle cx="40" cy="15" r="7"  fill={c(0.25)}/>
                    {[[-12,-8],[8,-14],[15,2],[-5,12]].map(([dx,dy],i)=>(
                      <g key={i} className="it-leaf" style={{transformOrigin:`${40+dx}px ${15+dy}px`,animationDelay:`${i*0.5}s`}}>
                        <ellipse cx={40+dx} cy={15+dy} rx="6" ry="3" fill={c(0.7)} transform={`rotate(${i*40},${40+dx},${15+dy})`}/>
                      </g>
                    ))}
                    <line x1="40" y1="55" x2="40" y2="25" stroke={c(0.4)} strokeWidth="2"/>
                  </>),
                  'Music': (<>
                    {[10,25,40,55,70].map((x,i)=><line key={i} x1={x} y1="15" x2={x} y2="48" stroke={c(0.07)} strokeWidth="1"/>)}
                    {[15,25,35].map((y,i)=><line key={i} x1="5" y1={y} x2="75" y2={y} stroke={c(0.12)} strokeWidth="0.8"/>)}
                    <text x="18" y="36" fontSize="20" fill={c(0.6)} className="it-bob">♩</text>
                    <g className="it-float" style={{transformOrigin:'48px 25px'}}>
                      <text x="45" y="30" fontSize="16" fill={c(0.7)}>♫</text>
                    </g>
                    {[0,1,2].map(i=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.5}s`,transformOrigin:`${25+i*18}px 45px`}}>
                        <text x={20+i*18} y="48" fontSize="14" fill={c(0.8)}>♪</text>
                      </g>
                    ))}
                  </>),
                  'Superheroes': (<>
                    {[8,18,28,42,55,65,75].map((x,i)=><rect key={i} x={x} y={38+Math.abs(i-3)*2} width={8+Math.abs(i-3)} height={22-Math.abs(i-3)*2} fill={c(0.15)} rx="1"/>)}
                    <g className="it-flash" style={{transformOrigin:'40px 20px'}}>
                      <polygon points="40,8 36,22 41,22 37,36 46,18 41,18 45,8" fill={active?'rgba(255,200,0,0.9)':p(0.3)}/>
                    </g>
                    <g className="it-zoom" style={{transformOrigin:'10px 35px'}}>
                      <circle cx="10" cy="35" r="6" fill={c(0.8)}/>
                      <path d="M10,29 Q18,25 16,35" fill={c(0.5)}/>
                      <path d="M10,41 Q16,44 14,35" fill={c(0.5)}/>
                    </g>
                  </>),
                  'Fantasy': (<>
                    {[[40,55],[28,52],[52,52],[20,48],[60,48]].map(([x,y],i)=><rect key={i} x={x-3} y={y-12} width={6} height={12+i} fill={c(0.2)} rx="1"/>)}
                    <polygon points="40,35 34,43 46,43" fill={c(0.3)}/>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} r="2" fill={c(0.8)} className="it-orbit" style={{transformOrigin:'40px 25px',animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <polygon points="40,8 43,17 52,17 45,22 47,31 40,26 33,31 35,22 28,17 37,17" fill={c(0.5)} className="it-pulse"/>
                  </>),
                  'Fairies': (<>
                    {[[15,52],[30,55],[50,53],[65,51]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={6+i} ry={4} fill={c(0.15)}/>)}
                    <ellipse cx="40" cy="30" rx="3" ry="5" fill={c(0.7)} className="it-bob"/>
                    <ellipse cx="33" cy="28" rx="9" ry="5" fill={c(0.25)} transform="rotate(-30,33,28)" className="it-bob"/>
                    <ellipse cx="47" cy="28" rx="9" ry="5" fill={c(0.25)} transform="rotate(30,47,28)" className="it-bob"/>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={20+i*14} cy={i%2===0?18:38} r="1.5" fill={c(0.8)} className="it-up" style={{animationDelay:`${i*0.4}s`}}/>
                    ))}
                  </>),
                  'Unicorns': (<>
                    <path d="M5,55 Q20,35 40,40 Q60,45 75,30" fill="none" stroke={active?'rgba(255,100,180,0.5)':'rgba(200,100,200,0.2)'} strokeWidth="3" className="it-draw"/>
                    <path d="M5,52 Q20,32 40,37 Q60,42 75,27" fill="none" stroke={active?'rgba(100,150,255,0.4)':p(0.08)} strokeWidth="2"/>
                    <polygon points="40,5 38,20 42,20" fill={c(0.8)} className="it-float"/>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={15+i*17} cy={20+i%2*10} r="2" fill={c(0.8)} className="it-twinkle" style={{animationDelay:`${i*0.25}s`}}/>
                    ))}
                  </>),
                  'Princesses': (<>
                    {[30,40,50].map((x,i)=><rect key={i} x={x-2} y={48-i*3} width={4} height={12+i*3} fill={c(0.2)} rx="1"/>)}
                    <polygon points="40,8 35,22 30,18 34,28 28,26 35,34 45,34 52,26 46,28 46,18 45,22" fill={c(0.6)} className="it-bob"/>
                    {[[32,16],[40,12],[48,16],[36,20],[44,20]].map(([x,y],i)=>(
                      <circle key={i} cx={x} cy={y} r="2.5" fill={i===1?'rgba(255,200,0,0.9)':'rgba(255,100,100,0.7)'} className="it-twinkle" style={{animationDelay:`${i*0.2}s`}}/>
                    ))}
                  </>),
                  'Pirates': (<>
                    <path d="M0,48 Q10,40 20,48 Q30,56 40,48 Q50,40 60,48 Q70,56 80,48" fill={c(0.2)} className="it-wave-y"/>
                    <path d="M0,55 Q10,47 20,55 Q30,63 40,55 Q50,47 60,55 Q70,63 80,55" fill={c(0.3)} className="it-wave-y" style={{animationDelay:'0.4s'}}/>
                    <g className="it-bob" style={{transformOrigin:'40px 38px'}}>
                      <rect x="32" y="38" width="16" height="10" rx="2" fill={c(0.4)}/>
                      <rect x="38" y="22" width="2" height="16" fill={c(0.6)}/>
                      <polygon points="38,22 38,34 52,28" fill={c(0.5)}/>
                    </g>
                    <circle cx="40" cy="16" r="9" fill={c(0.25)}/>
                    <line x1="34" y1="10" x2="46" y2="22" stroke={c(0.7)} strokeWidth="2"/>
                    <line x1="46" y1="10" x2="34" y2="22" stroke={c(0.7)} strokeWidth="2"/>
                    <circle cx="40" cy="16" r="3" fill={c(0.6)}/>
                  </>),
                  'Magic': (<>
                    <line x1="40" y1="12" x2="60" y2="48" stroke={c(0.6)} strokeWidth="2" strokeLinecap="round" className="it-float"/>
                    <circle cx="38" cy="11" r="5" fill={c(0.7)} className="it-pulse"/>
                    {[0,1,2,3,4,5].map(i=>(
                      <circle key={i} r="2.5" fill={c(0.8)} className="it-orbit" style={{transformOrigin:'40px 30px',animationDelay:`${i*0.2}s`}}/>
                    ))}
                    {[0,1,2].map(i=>(
                      <polygon key={i} points={`${25+i*18},${15+i*12} ${22+i*18},${22+i*12} ${28+i*18},${22+i*12}`} fill={c(0.5)} className="it-twinkle" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                  </>),
                  'Aliens': (<>
                    {[[12,8],[35,5],[58,12],[72,28],[15,40]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={1.5} fill={c(0.6)} className="it-twinkle" style={{animationDelay:`${i*0.25}s`}}/>)}
                    <ellipse cx="40" cy="18" rx="16" ry="8" fill={c(0.25)} className="it-float"/>
                    <ellipse cx="40" cy="20" rx="10" ry="5" fill={c(0.35)} className="it-float"/>
                    <g className="it-beam" style={{transformOrigin:'40px 25px'}}>
                      <polygon points="32,25 48,25 52,55 28,55" fill={active?'rgba(100,255,100,0.2)':p(0.06)}/>
                      <line x1="40" y1="25" x2="40" y2="55" stroke={c(0.3)} strokeWidth="1" strokeDasharray="3,3"/>
                    </g>
                  </>),
                  'Dinosaurs': (<>
                    {[[5,50],[12,45],[22,48],[35,44],[55,47],[68,43],[78,50]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={5+i%3} ry={8+i%2*3} fill={c(0.15)} rx={2}/>)}
                    <g className="it-walk" style={{transformOrigin:'15px 38px'}}>
                      <ellipse cx="15" cy="38" rx="8" ry="6" fill={c(0.7)}/>
                      <ellipse cx="22" cy="35" rx="5" ry="4" fill={c(0.6)}/>
                      <polygon points="27,33 33,28 29,35" fill={c(0.5)}/>
                      <circle cx="24" cy="34" r="1.5" fill={active?'rgba(49,46,129,0.9)':'rgba(0,0,0,0.5)'}/>
                      <line x1="10" y1="43" x2="8"  y2="50" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="18" y1="43" x2="16" y2="50" stroke={c(0.6)} strokeWidth="2"/>
                    </g>
                  </>),
                  'Animals': (<>
                    {[[15,52],[35,55],[55,52],[70,48]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={7+i} ry={5} fill={c(0.12)}/>)}
                    {[0,1,2,3].map(i=>(
                      <g key={i} className="it-appear" style={{animationDelay:`${i*0.15}s`,transformOrigin:`${15+i*18}px 40px`}}>
                        <circle cx={15+i*18} cy={40} r="4" fill={c(0.6)}/>
                        <circle cx={12+i*18} cy={36} r="2.5" fill={c(0.5)}/>
                        <circle cx={18+i*18} cy={36} r="2.5" fill={c(0.5)}/>
                      </g>
                    ))}
                    <circle cx="40" cy="25" r="14" fill={c(0.2)} className="it-bob"/>
                    <circle cx="34" cy="23" r="4"  fill={c(0.5)} className="it-bob"/>
                    <circle cx="46" cy="23" r="4"  fill={c(0.5)} className="it-bob"/>
                    <circle cx="40" cy="25" r="6"  fill={c(0.4)} className="it-bob"/>
                  </>),
                  'Robots': (<>
                    {[[8,30],[72,30]].map(([x,y],i)=>(
                      <g key={i}><rect x={x-3} y={y-4} width={6} height={8} rx="1" fill={c(0.3)}/></g>
                    ))}
                    <rect x="25" y="20" width="30" height="28" rx="4" fill={c(0.25)}/>
                    <rect x="30" y="10" width="20" height="12" rx="2" fill={c(0.3)}/>
                    <circle cx="35" cy="28" r="4" fill={c(0.7)} className="it-pulse"/>
                    <circle cx="45" cy="28" r="4" fill={c(0.7)} className="it-pulse" style={{animationDelay:'0.5s'}}/>
                    <rect x="32" y="36" width="16" height="4" rx="2" fill={c(0.4)}/>
                    <g className="it-spin-f" style={{transformOrigin:'65px 20px'}}>
                      <circle cx="65" cy="20" r="8" fill="none" stroke={c(0.4)} strokeWidth="1.5"/>
                      {[0,1,2,3,4,5].map(i=><line key={i} x1="65" y1="20" x2={65+8*Math.cos(i*Math.PI/3)} y2={20+8*Math.sin(i*Math.PI/3)} stroke={c(0.4)} strokeWidth="1"/>)}
                    </g>
                  </>),
                  'Science': (<>
                    <g className="it-float" style={{transformOrigin:'40px 30px'}}>
                      <path d="M32,15 L28,45 Q28,52 40,52 Q52,52 52,45 L48,15 Z" fill={c(0.15)} stroke={c(0.4)} strokeWidth="1.5"/>
                      <rect x="30" y="13" width="20" height="4" rx="2" fill={c(0.3)}/>
                      <ellipse cx="40" cy="45" rx="9" ry="5" fill={active?'rgba(100,220,255,0.3)':p(0.08)}/>
                    </g>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={33+i*5} cy={38-i*4} r="2.5" fill={c(0.6)} className="it-up" style={{animationDelay:`${i*0.4}s`}}/>
                    ))}
                    <g className="it-flash" style={{transformOrigin:'65px 25px'}}>
                      <polygon points="65,10 61,22 66,22 62,38 70,20 65,20 68,10" fill={active?'rgba(255,220,0,0.9)':p(0.3)}/>
                    </g>
                  </>),
                  'Gaming': (<>
                    {[[5,5],[5,55],[75,5],[75,55]].map(([x,y],i)=><rect key={i} x={x} y={y} width={10} height={10} fill={c(0.15)} rx="1"/>)}
                    <rect x="15" y="8" width="50" height="44" rx="2" fill={c(0.08)} stroke={c(0.2)} strokeWidth="1"/>
                    <g className="it-walk it-run" style={{transformOrigin:'25px 32px'}}>
                      <rect x="22" y="26" width="6" height="8" rx="1" fill={c(0.7)}/>
                      <rect x="23" y="22" width="4" height="5" rx="1" fill={c(0.6)}/>
                      <rect x="21" y="34" width="3" height="4" rx="1" fill={c(0.5)}/>
                      <rect x="25" y="34" width="3" height="4" rx="1" fill={c(0.5)}/>
                    </g>
                    {[0,1,2].map(i=>(
                      <circle key={i} cx={50+i*8} cy={20} r="3" fill={c(0.5)} className="it-appear" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <rect x="45" y="30" width="20" height="14" rx="3" fill={c(0.2)}/>
                    <line x1="55" y1="30" x2="55" y2="44" stroke={c(0.4)} strokeWidth="1"/>
                    <line x1="45" y1="37" x2="65" y2="37" stroke={c(0.4)} strokeWidth="1"/>
                  </>),
                  'Soccer': (<>
                    <line x1="40" y1="5" x2="40" y2="55" stroke={c(0.15)} strokeWidth="1"/>
                    <circle cx="40" cy="30" r="25" fill="none" stroke={c(0.12)} strokeWidth="1"/>
                    <circle cx="40" cy="30" r="8"  fill="none" stroke={c(0.2)} strokeWidth="1"/>
                    {[[5,5],[5,55],[75,5],[75,55]].map(([x,y],i)=><line key={i} x1={i<2?5:75} y1={5} x2={i<2?5:75} y2={55} stroke={c(0.3)} strokeWidth="1.5"/>)}
                    <g className="it-bounce" style={{transformOrigin:'40px 30px'}}>
                      <circle cx="40" cy="30" r="9" fill={c(0.7)}/>
                      {[0,1,2,3,4].map(i=><line key={i} x1="40" y1="30" x2={40+9*Math.cos(i*Math.PI*2/5)} y2={30+9*Math.sin(i*Math.PI*2/5)} stroke={active?'rgba(49,46,129,0.5)':'rgba(0,0,0,0.2)'} strokeWidth="1"/>)}
                    </g>
                  </>),
                  'Football': (<>
                    <line x1="5"  y1="30" x2="75" y2="30" stroke={c(0.15)} strokeWidth="1"/>
                    {[15,30,45,60].map((x,i)=><line key={i} x1={x} y1="5" x2={x} y2="55" stroke={c(0.08)} strokeWidth="1"/>)}
                    <line x1="5" y1="10" x2="5" y2="50" stroke={c(0.4)} strokeWidth="2"/>
                    <line x1="5" y1="10" x2="20" y2="10" stroke={c(0.4)} strokeWidth="2"/>
                    <line x1="5" y1="50" x2="20" y2="50" stroke={c(0.4)} strokeWidth="2"/>
                    <g className="it-bounce" style={{transformOrigin:'50px 30px'}}>
                      <ellipse cx="50" cy="30" rx="10" ry="7" fill={c(0.7)} transform="rotate(-20,50,30)"/>
                      <line x1="43" y1="27" x2="57" y2="33" stroke={active?'rgba(146,64,14,0.6)':p(0.2)} strokeWidth="2"/>
                      {[0,1].map(i=><line key={i} x1={46+i*8} y1="24" x2={44+i*8} y2="36" stroke={active?'rgba(255,255,255,0.5)':p(0.15)} strokeWidth="1"/>)}
                    </g>
                  </>),
                  'Gymnastics': (<>
                    {[10,20,30,40,50,60,70].map((x,i)=><line key={i} x1={x} y1="52" x2={x+8} y2="52" stroke={c(0.2)} strokeWidth="2"/>)}
                    <g className="it-spin-f" style={{transformOrigin:'40px 28px'}}>
                      <circle cx="40" cy="15" r="5" fill={c(0.7)}/>
                      <line x1="40" y1="20" x2="40" y2="35" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="30" y1="26" x2="50" y2="26" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="40" y1="35" x2="34" y2="46" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="40" y1="35" x2="46" y2="46" stroke={c(0.6)} strokeWidth="2"/>
                    </g>
                    <path d="M15,30 Q25,10 40,28 Q55,46 65,25" fill="none" stroke={c(0.25)} strokeWidth="1.5" strokeDasharray="4,3" className="it-ribbon"/>
                  </>),
                  'Dancing': (<>
                    {[18,32,46,60].map((x,i)=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.38}s`,transformOrigin:`${x}px 42px`}}>
                        <text x={x-5} y="44" fontSize="13" fill={c(0.7)}>♪</text>
                      </g>
                    ))}
                    <g className="it-spin-f" style={{transformOrigin:'40px 30px'}}>
                      <circle cx="40" cy="16" r="5" fill={c(0.7)}/>
                      <line x1="40" y1="21" x2="40" y2="36" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="30" y1="26" x2="50" y2="26" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="40" y1="36" x2="32" y2="48" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="40" y1="36" x2="48" y2="44" stroke={c(0.6)} strokeWidth="2"/>
                    </g>
                    <circle cx="40" cy="30" r="22" fill="none" stroke={c(0.1)} strokeWidth="1" strokeDasharray="3,4"/>
                  </>),
                  'Karate': (<>
                    {[5,20,35,50,65].map((x,i)=><rect key={i} x={x} y={48} width={10} height={6} fill={c(0.12+(i*0.04))} rx="1"/>)}
                    <g className="it-bob" style={{transformOrigin:'35px 30px'}}>
                      <circle cx="35" cy="14" r="5" fill={c(0.7)}/>
                      <line x1="35" y1="19" x2="35" y2="34" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="25" y1="26" x2="45" y2="24" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="35" y1="34" x2="28" y2="46" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="35" y1="34" x2="42" y2="42" stroke={c(0.6)} strokeWidth="2"/>
                    </g>
                    <g className="it-flash">
                      {[0,1,2,3].map(i=><line key={i} x1="55" y1="28" x2={62+i*3} y2={22+i*5} stroke={c(0.8)} strokeWidth="1.5"/>)}
                    </g>
                  </>),
                  'Swimming': (<>
                    {[0,1,2,3,4].map(i=>(
                      <ellipse key={i} cx="40" cy="30" rx={8+i*8} ry={4+i*4} fill="none" stroke={c(0.15-(i*0.02))} strokeWidth="1" className="it-pulse" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <path d="M0,50 Q10,44 20,50 Q30,56 40,50 Q50,44 60,50 Q70,56 80,50" fill={c(0.2)} className="it-wave-y"/>
                    <g className="it-swim" style={{transformOrigin:'15px 25px'}}>
                      <circle cx="15" cy="20" r="5" fill={c(0.7)}/>
                      <line x1="15" y1="25" x2="15" y2="38" stroke={c(0.6)} strokeWidth="2"/>
                      <line x1="5"  y1="28" x2="25" y2="26" stroke={c(0.6)} strokeWidth="2"/>
                    </g>
                  </>),
                  'Cooking': (<>
                    <g className="it-float" style={{transformOrigin:'40px 35px'}}>
                      <ellipse cx="40" cy="40" rx="20" ry="12" fill={c(0.25)}/>
                      <rect x="20" y="28" width="40" height="14" rx="3" fill={c(0.3)}/>
                      <rect x="58" y="30" width="14" height="4" rx="2" fill={c(0.3)} transform="rotate(10,58,30)"/>
                    </g>
                    <g className="it-stir" style={{transformOrigin:'40px 28px'}}>
                      <line x1="40" y1="10" x2="40" y2="30" stroke={c(0.6)} strokeWidth="2" strokeLinecap="round"/>
                      <ellipse cx="40" cy="28" rx="6" ry="3" fill="none" stroke={c(0.5)} strokeWidth="1.5"/>
                    </g>
                    {[0,1,2].map(i=>(
                      <path key={i} className="it-up" d={`M${32+i*8},22 Q${30+i*8},16 ${34+i*8},12`} fill="none" stroke={c(0.4)} strokeWidth="1.5" strokeLinecap="round" style={{animationDelay:`${i*0.35}s`}}/>
                    ))}
                  </>),
                  'Dolls': (<>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={15+i*18} cy={i%2===0?20:38} r="2.5" fill={c(0.7)} className="it-twinkle" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <g className="it-bob" style={{transformOrigin:'40px 28px'}}>
                      <circle cx="40" cy="14" r="7" fill={c(0.5)}/>
                      <ellipse cx="40" cy="30" rx="8" ry="10" fill={c(0.4)}/>
                      <ellipse cx="40" cy="38" rx="12" ry="6" fill={c(0.3)}/>
                    </g>
                    <g className="it-bloom" style={{transformOrigin:'25px 38px'}}>
                      {[0,1,2,3,4].map(i=><ellipse key={i} cx="25" cy="38" rx="4" ry="2" fill={c(0.6)} transform={`rotate(${i*36},25,38)`}/>)}
                      <circle cx="25" cy="38" r="2.5" fill={c(0.8)}/>
                    </g>
                    <g className="it-bloom" style={{transformOrigin:'55px 22px',animationDelay:'0.2s'}}>
                      {[0,1,2,3,4].map(i=><ellipse key={i} cx="55" cy="22" rx="3.5" ry="1.5" fill={c(0.6)} transform={`rotate(${i*36},55,22)`}/>)}
                      <circle cx="55" cy="22" r="2" fill={c(0.8)}/>
                    </g>
                  </>),
                  'Cars & Trucks': (<>
                    <rect x="0"  y="44" width="80" height="2" fill={c(0.2)}/>
                    <rect x="0"  y="52" width="80" height="2" fill={c(0.12)}/>
                    {[0,1,2,3].map(i=><line key={i} x1={5+i*22} y1="44" x2={12+i*22} y2="52" stroke={c(0.08)} strokeWidth="1"/>)}
                    <g className="it-car" style={{transformOrigin:'20px 36px'}}>
                      <rect x="5"  y="36" width="30" height="10" rx="3" fill={c(0.8)}/>
                      <rect x="10" y="29" width="20" height="9"  rx="2" fill={c(0.6)}/>
                      <circle cx="12" cy="47" r="4" fill={c(0.5)}/>
                      <circle cx="28" cy="47" r="4" fill={c(0.5)}/>
                      <rect x="30" y="38" width="5" height="3" rx="1" fill={active?'rgba(255,200,0,0.9)':p(0.3)}/>
                    </g>
                    {[0,1,2,3].map(i=><line key={i} x1={65-i*6} y1={36+i*2} x2={80} y2={36+i*2} stroke={c(0.15)} strokeWidth="1" className="it-flash" style={{animationDelay:`${i*0.1}s`}}/>)}
                  </>),
                };
                return (
                  <button
                    key={option.label}
                    className="int-tile"
                    onClick={() => handleInterestToggle(option.label)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                      padding: '0 8px 12px',
                      borderRadius: '18px',
                      minHeight: '100px',
                      cursor: 'pointer',
                      border: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      background: active
                        ? `linear-gradient(145deg, ${option.g[0]}, ${option.g[1]})`
                        : 'white',
                      boxShadow: active
                        ? `0 8px 24px ${option.sh}, 0 2px 4px rgba(0,0,0,0.08)`
                        : '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1.5px #E8E0D0',
                    }}
                  >
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 80 60" preserveAspectRatio="xMidYMid slice">
                      {scene[option.label]}
                    </svg>
                    {active && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '9px', zIndex: 2,
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.28)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: 'white', fontWeight: '800', lineHeight: 1,
                      }}>✓</span>
                    )}
                    <span style={{ position: 'relative', zIndex: 1, fontSize: '0.72rem', fontWeight: '700', lineHeight: 1.25, textAlign: 'center', color: active ? 'rgba(255,255,255,0.95)' : '#1A1209', letterSpacing: '0.01em' }}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom interests added — shown above the input with X to remove */}
            {(() => {
              const builtInLabels = INTEREST_OPTIONS.map(o => o.label);
              const customAdded = state.interests.filter(i => !builtInLabels.includes(i));
              return customAdded.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {customAdded.map(interest => (
                    <span key={interest} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FBF0F0', border: '1.5px solid #741515', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#741515', fontWeight: '600' }}>
                      {interest}
                      <button onClick={() => handleInterestToggle(interest)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#741515', padding: 0, fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>×</button>
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Add custom interest input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="+ Add your own interest (e.g. Ballet)" value={state.customInterest}
                onChange={(e) => setState({ ...state, customInterest: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()} />
              {state.customInterest.trim() && (
                <button onClick={handleAddCustomInterest} className="btn-brand" style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}>Add</button>
              )}
            </div>

            {state.interests.length > 0 && state.interests.length < 2 && (
              <p style={{ color: '#741515', marginBottom: '12px', fontSize: '0.875rem', fontWeight: '500' }}>Select at least 2 interests</p>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={handleNext} disabled={state.interests.length < 2} className="btn-brand"
                style={{ flex: 1, padding: '0.75rem 1.75rem', opacity: state.interests.length < 2 ? 0.5 : 1, cursor: state.interests.length < 2 ? 'not-allowed' : 'pointer' }}>
                Next step
              </button>
              <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#741515', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Follow-up questions based on interests ── */}
        {state.step === 4 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>Let's get specific!</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>
              These details make {state.name || 'your child'}'s story feel like it was written just for them. Skip any you don't know.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {followUpSections.map(({ interest, emoji, questions }) => (
                <div key={interest} style={{ borderLeft: '3px solid #E8E0D0', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: '#F5F0E8', fontSize: '1.15rem', flexShrink: 0,
                    }}>{emoji}</span>
                    <p style={{ fontWeight: '600', color: '#1A1209', margin: 0, fontSize: '0.95rem' }}>{interest}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {questions.map(({ q, placeholder }) => (
                      <div key={q}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#4A3728' }}>{q}</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder={placeholder}
                          value={state.followUpAnswers[`${interest}::${q}`] ?? ''}
                          onChange={(e) => setAnswer(interest, q, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom interests (no questions defined) */}
              {state.interests.filter(i => !FOLLOW_UP_QUESTIONS[i]).length > 0 && (
                <div style={{ borderLeft: '3px solid #E8E0D0', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#F5F0E8', fontSize: '1.15rem', flexShrink: 0 }}>⭐</span>
                    <p style={{ fontWeight: '600', color: '#1A1209', margin: 0, fontSize: '0.95rem' }}>Other interests</p>
                  </div>
                  {state.interests.filter(i => !FOLLOW_UP_QUESTIONS[i]).map((interest) => (
                    <div key={interest} style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#4A3728' }}>
                        Tell us more about their love of {interest}
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder={`What do they love most about ${interest}?`}
                        value={state.followUpAnswers[`${interest}::more`] ?? ''}
                        onChange={(e) => setAnswer(interest, 'more', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '32px' }}>
              <button onClick={handleNext} className="btn-brand" style={{ flex: 1, padding: '0.75rem 1.75rem' }}>Next step</button>
              <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#741515', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Appearance & Details ── */}
        {state.step === 5 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>Almost there!</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '28px', fontSize: '0.95rem' }}>
              A few more details to make {state.name || 'their'} stories feel truly personal
            </p>

            {/* Appearance */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Appearance <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>Hair colour</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Brown" value={state.hairColour} onChange={(e) => setState({ ...state, hairColour: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Eye colour</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Blue" value={state.eyeColour} onChange={(e) => setState({ ...state, eyeColour: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Where do they live? <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>City</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Sydney" value={state.city} onChange={(e) => setState({ ...state, city: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Country</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Australia" value={state.country} onChange={(e) => setState({ ...state, country: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Siblings */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Siblings <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              {state.siblings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {state.siblings.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input type="text" style={inputStyle} placeholder="Name" value={s.name}
                        onChange={(e) => { const u = [...state.siblings]; u[i] = { ...u[i], name: e.target.value }; setState({ ...state, siblings: u }); }} />
                      <input type="text" style={inputStyle} placeholder="Nickname (optional)" value={s.nickname}
                        onChange={(e) => { const u = [...state.siblings]; u[i] = { ...u[i], nickname: e.target.value }; setState({ ...state, siblings: u }); }} />
                      <button onClick={() => setState({ ...state, siblings: state.siblings.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: '1.5px solid #E8E0D0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#9B8B7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setState({ ...state, siblings: [...state.siblings, { name: '', nickname: '' }] })}
                style={{ ...chipBase, border: '1.5px dashed #C8BEAA', backgroundColor: 'transparent', color: '#6B5E4E', width: '100%' }}>
                + Add sibling
              </button>
            </div>

            {/* Best friends */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Best friends <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              {state.friends.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {state.friends.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input type="text" style={inputStyle} placeholder="Name" value={f.name}
                        onChange={(e) => { const u = [...state.friends]; u[i] = { ...u[i], name: e.target.value }; setState({ ...state, friends: u }); }} />
                      <input type="text" style={inputStyle} placeholder="Nickname (optional)" value={f.nickname}
                        onChange={(e) => { const u = [...state.friends]; u[i] = { ...u[i], nickname: e.target.value }; setState({ ...state, friends: u }); }} />
                      <button onClick={() => setState({ ...state, friends: state.friends.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: '1.5px solid #E8E0D0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#9B8B7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setState({ ...state, friends: [...state.friends, { name: '', nickname: '' }] })}
                style={{ ...chipBase, border: '1.5px dashed #C8BEAA', backgroundColor: 'transparent', color: '#6B5E4E', width: '100%' }}>
                + Add friend
              </button>
            </div>

            {/* Pet */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Pet <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>Pet name</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Biscuit" value={state.petName} onChange={(e) => setState({ ...state, petName: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Type of pet</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Dog" value={state.petType} onChange={(e) => setState({ ...state, petType: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Reading level */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Reading level</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'simple', label: 'Simple', sub: 'Ages 3–5' },
                  { id: 'medium', label: 'Medium', sub: 'Ages 6–8' },
                  { id: 'imaginative', label: 'Imaginative', sub: 'Ages 9–12' },
                ].map((option) => {
                  const active = state.readingLevel === option.id;
                  return (
                    <button key={option.id} onClick={() => setState({ ...state, readingLevel: option.id })}
                      style={{ ...chip(active), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 20px' }}>
                      <span>{option.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{option.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {submitError && (
              <div style={{ color: '#991B1B', fontSize: '0.875rem', marginBottom: '16px', padding: '12px', background: '#FEE2E2', borderRadius: '8px' }}>{submitError}</div>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={handleNext} disabled={submitting} className="btn-brand"
                style={{ flex: 1, padding: '0.75rem 1.75rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Creating profile...' : `Create ${state.name || 'profile'}`}
              </button>
              <button onClick={handleBack} disabled={submitting}
                style={{ background: 'none', border: 'none', color: '#741515', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
