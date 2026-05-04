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

              @keyframes it-rocket-fly { 0%{transform:translateX(-40px);opacity:0} 12%,88%{opacity:1} 100%{transform:translateX(125px);opacity:0} }
              .int-tile:hover .it-rocket-h { animation: it-rocket-fly 2.6s ease-in-out infinite; }
              @keyframes it-hero { 0%{transform:translate(-100px,0);opacity:0} 18%{transform:translate(0,0);opacity:1} 28%{transform:translate(0,-5px);opacity:1} 38%{transform:translate(0,0);opacity:1} 48%{transform:translate(0,-4px);opacity:1} 58%{transform:translate(0,0);opacity:1} 68%{transform:translate(0,-3px);opacity:1} 78%{transform:translate(100px,-10px);opacity:1} 90%{transform:translate(100px,-10px);opacity:0} 100%{transform:translate(-100px,0);opacity:0} }
              .int-tile:hover .it-hero { animation: it-hero 2.4s ease-in-out infinite; }
              @keyframes it-pirate-appear { 0%{transform:translateY(8px) scale(0.7);opacity:0} 50%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
              @keyframes it-pirate-wave   { 0%{transform:rotate(-45deg)} 35%{transform:rotate(60deg)} 70%{transform:rotate(-40deg)} 100%{transform:rotate(-45deg)} }
              .int-tile:hover .it-pirate-appear { animation: it-pirate-appear 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
              .int-tile:hover .it-pirate-wave   { animation: it-pirate-wave 1.4s ease-in-out infinite 0.5s; }
              @keyframes it-wand-swing { 0%{transform:rotate(-16deg)} 25%{transform:rotate(13deg)} 50%{transform:rotate(-12deg)} 75%{transform:rotate(15deg)} 100%{transform:rotate(-16deg)} }
              .it-wand-swing { animation: it-wand-swing 2.4s ease-in-out infinite; }
              @keyframes it-fairy-flutter { 0%{transform:translate(-30px,5px);opacity:0} 15%,85%{opacity:1} 100%{transform:translate(35px,-8px);opacity:0} }
              .int-tile:hover .it-fairy-flutter { animation: it-fairy-flutter 3.2s ease-in-out infinite; }
              @keyframes it-wing-flap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.3)} }
              .it-wing { animation: it-wing-flap 0.25s ease-in-out infinite; }
              @keyframes it-star-blink { 0%,100%{opacity:0.9} 50%{opacity:0.08} }
              .it-star { animation: it-star-blink 2s ease-in-out infinite; }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {INTEREST_OPTIONS.map((option) => {
                const active = state.interests.includes(option.label);
                // Parse primary gradient colour so inactive tiles show their theme colour (not grey)
                const [r1,g1,b1] = [parseInt(option.g[0].slice(1,3),16), parseInt(option.g[0].slice(3,5),16), parseInt(option.g[0].slice(5,7),16)];
                const [r2,g2,b2] = [parseInt(option.g[1].slice(1,3),16), parseInt(option.g[1].slice(3,5),16), parseInt(option.g[1].slice(5,7),16)];
                const a = (o: number) => `rgba(255,255,255,${o})`;
                const c = (o: number) => active ? a(o) : `rgba(${r1},${g1},${b1},${o * 0.8})`;
                const c2= (o: number) => active ? a(o * 0.7) : `rgba(${r2},${g2},${b2},${o * 0.65})`;
                const p = c;
                // Tiles with dark atmospheric backgrounds (like Space)
                const DARK_BG: Record<string,string> = {
                  'Space':'#0C0A2E', 'Superheroes':'#0B1120', 'Pirates':'#071422',
                  'Fantasy':'#1A0A3E', 'Aliens':'#030A0F', 'Gaming':'#0D0A1E',
                  'Fairies':'#2A0A3A', 'Dinosaurs':'#0A1A08',
                  'Soccer':'#0A3A14', 'Cars & Trucks':'#1A1A1A',
                  'Unicorns':'#1A0A2E', 'Princesses':'#1A1008',
                  'Animals':'#0A1E06', 'Swimming':'#041428', 'Football':'#0A2006',
                  'Robots':'#0A0E1A', 'Science':'#030E18', 'Music':'#0E0418',
                  'Ocean':'#030C1E', 'Nature':'#040E04', 'Cooking':'#1A0A02', 'Dolls':'#1A0418',
                };
                const darkBg = DARK_BG[option.label];
                const S = (props:{cx:number;cy:number;r:number;d:string}) => <circle cx={props.cx} cy={props.cy} r={props.r} fill="rgba(255,248,200,0.92)" className="it-star" style={{animationDelay:props.d}}/>;
                const scene: Record<string, React.ReactNode> = {
                  'Space': (<>
                    {/* Stars — opacity only (no scale/transform so they don't appear to move) */}
                    {[{x:6,y:5,r:1.8},{x:19,y:3,r:1.1},{x:33,y:8,r:2.3},{x:50,y:4,r:1.4},{x:63,y:7,r:1.9},{x:75,y:5,r:1.1},
                      {x:10,y:22,r:1.3},{x:72,y:20,r:1.7},{x:4,y:40,r:1.5},{x:66,y:42,r:1.2},{x:40,y:52,r:1.7},{x:14,y:53,r:1.1},{x:78,y:48,r:1.4},{x:55,y:30,r:1.0},{x:27,y:32,r:0.9}
                    ].map(({x,y,r},i)=>(
                      <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,250,220,0.95)" className="it-star" style={{animationDelay:`${i*0.19}s`}}/>
                    ))}
                    {/* Hero star — same pure opacity blink */}
                    <circle cx="34" cy="8" r="2.8" fill="rgba(255,255,200,1)" className="it-star" style={{animationDelay:'0.7s'}}/>
                    {/* Crescent moon — fixed position, no movement */}
                    <circle cx="62" cy="16" r="13" fill="rgba(255,235,140,0.97)"/>
                    <circle cx="68" cy="13" r="10.5" fill={active ? `rgba(${r1},${g1},${b1},1)` : '#0C0A2E'}/>
                    {/* Rocket — flies straight left-to-right on hover */}
                    <g className="it-rocket-h">
                      {/* Body - horizontal ellipse */}
                      <ellipse cx="0" cy="32" rx="14" ry="6" fill="#EF4444"/>
                      {/* Nose cone — points right */}
                      <polygon points="14,32 8,26 8,38" fill="#F97316"/>
                      {/* Porthole */}
                      <circle cx="-3" cy="32" r="4.5" fill="#BFDBFE"/>
                      <circle cx="-3" cy="32" r="3"   fill="#60A5FA"/>
                      <circle cx="-4.5" cy="30.5" r="1" fill="rgba(255,255,255,0.7)"/>
                      {/* Top fin */}
                      <polygon points="-10,26 -16,18 -8,26" fill="#B91C1C"/>
                      {/* Bottom fin */}
                      <polygon points="-10,38 -16,46 -8,38" fill="#B91C1C"/>
                      {/* Flame — at the back (left) */}
                      <ellipse cx="-16" cy="32" rx="8"   ry="4.5" fill="rgba(251,146,60,0.95)"/>
                      <ellipse cx="-18" cy="32" rx="5.5" ry="3"   fill="rgba(253,224,71,0.95)"/>
                    </g>
                  </>),
                  // ── SUPERHEROES — dark city, hero flies in & hovers ───────────
                  'Superheroes': (<>
                    {/* Subtle stars in sky */}
                    <S cx={20} cy={6} r={1.2} d="0.1s"/><S cx={42} cy={4} r={1.5} d="0.5s"/><S cx={62} cy={7} r={1.0} d="0.9s"/>
                    {/* City buildings */}
                    <rect x="0"  y="44" width="11" height="16" fill="rgba(200,215,255,0.14)"/>
                    <rect x="9"  y="32" width="11" height="28" fill="rgba(200,215,255,0.18)"/>
                    <rect x="18" y="38" width="8"  height="22" fill="rgba(200,215,255,0.13)"/>
                    <rect x="24" y="33" width="13" height="27" fill="rgba(200,215,255,0.17)"/>
                    <rect x="35" y="40" width="7"  height="20" fill="rgba(200,215,255,0.13)"/>
                    <rect x="48" y="35" width="10" height="25" fill="rgba(200,215,255,0.15)"/>
                    <rect x="56" y="26" width="14" height="34" fill="rgba(200,215,255,0.18)"/>
                    <rect x="68" y="34" width="9"  height="26" fill="rgba(200,215,255,0.13)"/>
                    {/* Window lights — bright and visible */}
                    {[[10,34],[10,40],[19,40],[25,35],[25,41],[49,37],[49,43],[57,28],[57,34],[57,40],[69,36],[69,42]].map(([x,y],i)=>(
                      <rect key={i} x={x} y={y} width="2.5" height="2" fill="rgba(255,230,100,0.95)" className="it-star" style={{animationDelay:`${i*0.18}s`}}/>
                    ))}
                    {/* HERO — bigger, bolder, 2.4s cycle */}
                    <g className="it-hero" style={{transformOrigin:'40px 27px'}}>
                      {/* Cape — large, dramatic */}
                      <path d="M35,22 Q16,27 14,40 Q24,33 33,37 Q30,28 35,22" fill="#DC2626"/>
                      {/* Body */}
                      <ellipse cx="41" cy="29" rx="7.5" ry="9.5" fill="#1D4ED8"/>
                      {/* Belt */}
                      <rect x="33.5" y="33" width="15" height="3" rx="1.5" fill="#FBBF24"/>
                      {/* S shield — larger */}
                      <circle cx="41" cy="27" r="4.5" fill="rgba(255,200,40,0.95)"/>
                      <text x="38.8" y="29.8" fontSize="6.5" fill="#1D4ED8" fontWeight="900">S</text>
                      {/* Head */}
                      <circle cx="41" cy="17" r="6.5" fill="rgba(230,185,140,0.97)"/>
                      {/* Mask */}
                      <path d="M34.5,16.5 Q37.5,13.5 41,15.5 Q44.5,13.5 47.5,16.5 L46,18.5 Q44,16.5 41,17.5 Q38,16.5 36,18.5 Z" fill="#1D4ED8"/>
                      {/* Hair */}
                      <path d="M35,13.5 Q38.5,10 41,11.5 Q43.5,10 47,13.5 Q44,11.5 41,12.5 Q38,11.5 35,13.5" fill="rgba(70,35,5,0.95)"/>
                      {/* Lead arm outstretched forward */}
                      <line x1="41" y1="25" x2="57" y2="18" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round"/>
                      <circle cx="57" cy="18" r="3.5" fill="rgba(230,185,140,0.97)"/>
                      {/* Trailing arm */}
                      <line x1="41" y1="25" x2="30" y2="32" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round"/>
                      {/* Legs trailing */}
                      <line x1="41" y1="38" x2="48" y2="48" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round"/>
                      <line x1="41" y1="38" x2="36" y2="48" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
                    </g>
                  </>),
                  // ── FANTASY — Disney-style castle with spires ────────────────
                  'Fantasy': (<>
                    <S cx={6} cy={3} r={1.1} d="0s"/><S cx={18} cy={2} r={0.8} d="0.35s"/>
                    <S cx={55} cy={4} r={1.3} d="0.7s"/><S cx={76} cy={6} r={1.0} d="0.5s"/>
                    {/* Crescent moon */}
                    <circle cx="70" cy="12" r="8" fill="rgba(220,200,255,0.5)"/>
                    <circle cx="74" cy="10" r="6.5" fill="#1A0A3E"/>
                    {/* Far-left small tower */}
                    <rect x="4"  y="40" width="8"  height="20" fill="rgba(145,112,205,0.65)" rx="1"/>
                    <polygon points="8,26  4,40  12,40" fill="rgba(175,145,235,0.88)"/>
                    {/* Left tower */}
                    <rect x="15" y="33" width="13" height="27" fill="rgba(155,120,218,0.72)" rx="1"/>
                    <polygon points="21.5,16 15,33 28,33" fill="rgba(188,158,242,0.92)"/>
                    {/* Main center tower — tallest & grandest */}
                    <rect x="31" y="23" width="18" height="37" fill="rgba(168,132,228,0.82)" rx="1"/>
                    <polygon points="40,1 33,23 47,23" fill="rgba(198,168,250,0.97)"/>
                    {/* Right tower */}
                    <rect x="52" y="33" width="13" height="27" fill="rgba(155,120,218,0.72)" rx="1"/>
                    <polygon points="58.5,16 52,33 65,33" fill="rgba(188,158,242,0.92)"/>
                    {/* Far-right small tower */}
                    <rect x="68" y="40" width="8"  height="20" fill="rgba(145,112,205,0.65)" rx="1"/>
                    <polygon points="72,26 68,40 76,40" fill="rgba(175,145,235,0.88)"/>
                    {/* Connecting wall */}
                    <rect x="4" y="46" width="72" height="14" fill="rgba(128,98,185,0.55)"/>
                    {/* Battlements on wall */}
                    {[5,8,11,16,19,22,33,36,39,42,45,53,56,59,69,72,75].map((x,i)=>(
                      <rect key={i} x={x} y={42} width="2.5" height="5" fill="rgba(168,138,228,0.72)" rx="0.5"/>
                    ))}
                    {/* Grand arched gateway */}
                    <rect x="35" y="49" width="10" height="11" rx="5 5 0 0" fill="rgba(0,0,0,0.45)"/>
                    {/* Glowing windows — warm amber glow */}
                    {[[8,36],[21.5,22],[40,10],[58.5,22],[72,36],[33,32],[40,32],[47,32],[21.5,40],[58.5,40]].map(([x,y],i)=>(
                      <rect key={i} x={(x as number)-1.5} y={(y as number)} width="3" height="4.5" rx="1.5" fill="rgba(255,215,90,0.92)" className="it-star" style={{animationDelay:`${i*0.14}s`}}/>
                    ))}
                    {/* Star on tallest spire */}
                    <circle cx="40" cy="1" r="3.5" fill="rgba(255,215,60,0.97)" className="it-pulse"/>
                    {[0,1,2,3,4,5,6,7].map(i=>(
                      <line key={i} x1="40" y1="1" x2={40+6*Math.cos(i*45*Math.PI/180)} y2={1+6*Math.sin(i*45*Math.PI/180)} stroke="rgba(255,215,60,0.55)" strokeWidth="1.1"/>
                    ))}
                  </>),
                  // ── FAIRIES — fairy garden, flutters on hover ────────────────
                  'Fairies': (<>
                    <S cx={6} cy={4} r={1.1} d="0s"/><S cx={20} cy={2} r={0.8} d="0.4s"/>
                    <S cx={58} cy={5} r={1.3} d="0.8s"/><S cx={72} cy={3} r={0.9} d="0.3s"/>
                    {/* Moon */}
                    <circle cx="14" cy="12" r="9" fill="rgba(255,220,255,0.85)"/>
                    <circle cx="18" cy="10" r="7.5" fill="#2A0A3A"/>
                    {/* Enchanted flowers */}
                    {[[8,54],[22,50],[40,55],[58,50],[72,54]].map(([x,y],i)=>(
                      <g key={i}>
                        <line x1={x} y1={y} x2={x} y2={60} stroke="rgba(80,220,120,0.55)" strokeWidth="1.5"/>
                        {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*3.5} cy={y+Math.sin(j*72*Math.PI/180)*3.5} rx="2.5" ry="1.5" fill={['rgba(255,120,200,0.75)','rgba(255,200,80,0.75)','rgba(180,80,255,0.75)','rgba(80,200,255,0.75)','rgba(255,150,80,0.75)'][j]} transform={`rotate(${j*72},${x},${y})`}/>)}
                        <circle cx={x} cy={y} r="1.8" fill="rgba(255,240,100,0.95)" className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                      </g>
                    ))}
                    {/* Resting fairy — gently bobs in idle */}
                    <g className="it-bob" style={{transformOrigin:'40px 26px'}}>
                      {/* Upper wings — large teardrop shape */}
                      <path d="M40,20 Q28,10 24,20 Q28,28 40,24 Z" fill="rgba(200,160,255,0.38)" stroke="rgba(200,160,255,0.6)" strokeWidth="0.8"/>
                      <path d="M40,20 Q52,10 56,20 Q52,28 40,24 Z" fill="rgba(200,160,255,0.38)" stroke="rgba(200,160,255,0.6)" strokeWidth="0.8"/>
                      {/* Lower wings — smaller */}
                      <path d="M40,26 Q30,22 27,30 Q32,34 40,30 Z" fill="rgba(220,180,255,0.28)" stroke="rgba(220,180,255,0.5)" strokeWidth="0.7"/>
                      <path d="M40,26 Q50,22 53,30 Q48,34 40,30 Z" fill="rgba(220,180,255,0.28)" stroke="rgba(220,180,255,0.5)" strokeWidth="0.7"/>
                      {/* Wing shimmer lines */}
                      <path d="M40,22 Q32,15 26,21" fill="none" stroke="rgba(230,200,255,0.5)" strokeWidth="0.8"/>
                      <path d="M40,22 Q48,15 54,21" fill="none" stroke="rgba(230,200,255,0.5)" strokeWidth="0.8"/>
                      {/* Glow aura */}
                      <circle cx="40" cy="26" r="10" fill="rgba(220,150,255,0.1)"/>
                      {/* Dress/body */}
                      <ellipse cx="40" cy="30" rx="4" ry="7" fill="rgba(255,130,220,0.92)"/>
                      {/* Skirt flare */}
                      <polygon points="36,36 44,36 47,43 33,43" fill="rgba(255,100,200,0.8)"/>
                      {/* Head */}
                      <circle cx="40" cy="19" r="5.5" fill="rgba(255,210,185,0.97)"/>
                      {/* Hair — flowing */}
                      <path d="M34.5,17 Q37,11 40,13.5 Q43,11 45.5,17" fill="rgba(180,100,255,0.92)"/>
                      <path d="M35,20 Q30,26 32,32" fill="none" stroke="rgba(180,100,255,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
                      {/* Face */}
                      <circle cx="38" cy="20" r="1.2" fill="rgba(100,60,120,0.9)"/>
                      <circle cx="42" cy="20" r="1.2" fill="rgba(100,60,120,0.9)"/>
                      <path d="M38,23 Q40,25 42,23" fill="none" stroke="rgba(200,100,140,0.7)" strokeWidth="1" strokeLinecap="round"/>
                      {/* Wand in hand */}
                      <line x1="44" y1="28" x2="56" y2="18" stroke="rgba(200,175,80,0.9)" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="56" cy="18" r="3" fill="rgba(255,220,50,0.95)" className="it-pulse"/>
                    </g>
                    {/* Fairy flutters across on hover — trailing sparkle dust */}
                    <g className="it-fairy-flutter" style={{transformOrigin:'20px 28px'}}>
                      {/* Flying fairy — smaller, mid-flight pose */}
                      <path d="M20,22 Q11,14 8,22 Q11,28 20,26 Z" fill="rgba(200,160,255,0.5)" stroke="rgba(200,160,255,0.7)" strokeWidth="0.7"/>
                      <path d="M20,22 Q29,14 32,22 Q29,28 20,26 Z" fill="rgba(200,160,255,0.5)" stroke="rgba(200,160,255,0.7)" strokeWidth="0.7"/>
                      <ellipse cx="20" cy="28" rx="3" ry="5" fill="rgba(255,130,220,0.9)"/>
                      <circle cx="20" cy="21" r="4" fill="rgba(255,210,185,0.97)"/>
                      <path d="M17,19 Q19,15 20,17 Q21,15 23,19" fill="rgba(180,100,255,0.9)"/>
                      {/* Dust trail */}
                      {[0,1,2,3,4].map(i=>(
                        <circle key={i} cx={8+i*3} cy={30+i} r={2-i*0.3} fill="rgba(255,230,100,0.85)" className="it-star" style={{animationDelay:`${i*0.15}s`}}/>
                      ))}
                    </g>
                  </>),
                  // ── UNICORNS — full body prancing unicorn ────────────────────
                  'Unicorns': (<>
                    <S cx={6} cy={4} r={1.2} d="0s"/><S cx={18} cy={2} r={0.8} d="0.35s"/>
                    <S cx={62} cy={5} r={1.4} d="0.7s"/><S cx={76} cy={3} r={1.0} d="0.4s"/>
                    {/* Rainbow arcs */}
                    {[['#F87171',55],['#FB923C',50],['#FCD34D',45],['#86EFAC',40],['#67E8F9',35],['#A78BFA',30]].map(([col,y],i)=>(
                      <path key={i} d={`M4,${y} Q20,${(y as number)-8} 40,${y} Q60,${(y as number)+8} 76,${y}`} fill="none" stroke={col as string} strokeWidth="3" opacity="0.7"/>
                    ))}
                    {/* Full body unicorn — side view, facing right, bobbing idle */}
                    <g className="it-bob" style={{transformOrigin:'38px 30px'}}>
                      {/* Tail — flowing left */}
                      <path d="M22,32 Q12,28 8,22 Q10,32 14,36 Q10,38 12,44" fill="none" stroke="rgba(230,120,210,0.85)" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M22,32 Q10,36 8,44" fill="none" stroke="rgba(255,160,220,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
                      {/* Body */}
                      <ellipse cx="38" cy="34" rx="18" ry="12" fill="rgba(240,225,255,0.97)"/>
                      {/* Neck */}
                      <ellipse cx="52" cy="26" rx="7" ry="11" fill="rgba(240,225,255,0.97)" transform="rotate(-15,52,26)"/>
                      {/* Mane */}
                      <path d="M48,17 Q52,10 56,14 Q54,20 58,22 Q55,27 56,30" fill="none" stroke="rgba(220,100,200,0.9)" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M48,17 Q53,8 58,12 Q55,20 60,24" fill="none" stroke="rgba(255,150,220,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
                      {/* Head */}
                      <ellipse cx="60" cy="20" rx="10" ry="8" fill="rgba(240,225,255,0.97)"/>
                      {/* Snout */}
                      <ellipse cx="68" cy="22" rx="5" ry="3.5" fill="rgba(235,215,255,0.97)"/>
                      <circle cx="72" cy="23" r="1" fill="rgba(200,150,220,0.6)"/>
                      {/* Eye */}
                      <circle cx="62" cy="18" r="2.8" fill="rgba(80,40,120,0.95)"/>
                      <circle cx="62.7" cy="17.3" r="1.1" fill="rgba(255,255,255,0.95)"/>
                      {/* Eyelashes */}
                      {[-20,0,20].map((deg,i)=><line key={i} x1="62" y1="15.5" x2={62+3*Math.sin(deg*Math.PI/180)} y2={15.5-3*Math.cos(deg*Math.PI/180)} stroke="rgba(80,40,120,0.7)" strokeWidth="0.9"/>)}
                      {/* Horn */}
                      <polygon points="59,14 56,2 62,14" fill="rgba(255,205,50,0.97)"/>
                      {[59,58.5,58,57.5].map((x,i)=><line key={i} x1={x} y1={14-i*3} x2={x+1.5} y2={14-i*3} stroke="rgba(220,160,30,0.5)" strokeWidth="0.7"/>)}
                      {/* Legs — 4 legs in graceful prancing pose */}
                      <line x1="30" y1="45" x2="28" y2="58" stroke="rgba(230,215,255,0.97)" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="36" y1="46" x2="34" y2="58" stroke="rgba(230,215,255,0.97)" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="46" y1="45" x2="48" y2="57" stroke="rgba(230,215,255,0.97)" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="52" y1="44" x2="55" y2="55" stroke="rgba(230,215,255,0.97)" strokeWidth="4" strokeLinecap="round"/>
                      {/* Hooves */}
                      {[[28,58],[34,58],[48,57],[55,55]].map(([x,y],i)=>(
                        <ellipse key={i} cx={x} cy={y} rx="3" ry="2" fill="rgba(180,140,200,0.8)"/>
                      ))}
                    </g>
                    {/* Sparkles */}
                    {[{x:12,y:20},{x:6,y:32},{x:72,y:18},{x:78,y:30}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,220,255,0.9)" className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                  </>),
                  // ── PRINCESSES — Disney princess in ballgown ─────────────────
                  'Princesses': (<>
                    <S cx={6}  cy={3}  r={1.0} d="0s"/><S cx={68} cy={4}  r={1.2} d="0.5s"/>
                    <S cx={76} cy={14} r={0.9} d="0.8s"/><S cx={14} cy={18} r={0.8} d="0.3s"/>
                    {/* Palace ballroom arch background */}
                    <rect x="0" y="42" width="80" height="18" fill="rgba(180,130,40,0.3)"/>
                    <path d="M20,42 Q40,30 60,42" fill="rgba(180,130,40,0.2)"/>
                    {/* Chandelier */}
                    <line x1="40" y1="0" x2="40" y2="8" stroke="rgba(220,190,80,0.6)" strokeWidth="1"/>
                    <ellipse cx="40" cy="10" rx="8" ry="4" fill="rgba(200,170,60,0.4)"/>
                    {[0,1,2,3,4,5].map(i=><circle key={i} cx={33+i*3} cy={12} r="1.5" fill="rgba(255,230,100,0.9)" className="it-star" style={{animationDelay:`${i*0.2}s`}}/>)}
                    {/* Princess figure — center stage */}
                    <g className="it-bob" style={{transformOrigin:'40px 30px'}}>
                      {/* Ballgown — layered skirt, Disney style */}
                      <polygon points="40,32 20,60 60,60" fill="rgba(180,80,200,0.7)"/>
                      <ellipse cx="40" cy="52" rx="22" ry="8" fill="rgba(200,100,220,0.6)"/>
                      {/* Skirt sparkle decoration */}
                      {[[28,44],[35,50],[45,50],[52,44],[32,56],[48,56]].map(([x,y],i)=>(
                        <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,220,255,0.8)" className="it-star" style={{animationDelay:`${i*0.2}s`}}/>
                      ))}
                      {/* Bodice */}
                      <ellipse cx="40" cy="30" rx="6" ry="8" fill="rgba(200,100,220,0.85)"/>
                      {/* Gloved arms */}
                      <path d="M34,28 Q24,22 20,26" fill="none" stroke="rgba(255,200,210,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      <circle cx="20" cy="26" r="2.5" fill="rgba(255,200,210,0.95)"/>
                      <path d="M46,28 Q56,22 60,26" fill="none" stroke="rgba(255,200,210,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      <circle cx="60" cy="26" r="2.5" fill="rgba(255,200,210,0.95)"/>
                      {/* Neck & head */}
                      <ellipse cx="40" cy="19" rx="1.8" ry="3" fill="rgba(255,210,185,0.97)"/>
                      <circle cx="40" cy="13" r="7" fill="rgba(255,210,185,0.97)"/>
                      {/* Hair — long and elegant */}
                      <path d="M33,10 Q36,3 40,5 Q44,3 47,10" fill="rgba(200,140,50,0.95)"/>
                      <path d="M33,14 Q26,20 28,30" fill="none" stroke="rgba(200,140,50,0.8)" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M47,14 Q54,20 52,30" fill="none" stroke="rgba(200,140,50,0.8)" strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Face details */}
                      <circle cx="37.5" cy="13.5" r="1.3" fill="rgba(100,60,120,0.9)"/>
                      <circle cx="42.5" cy="13.5" r="1.3" fill="rgba(100,60,120,0.9)"/>
                      <path d="M37.5,16.5 Q40,19 42.5,16.5" fill="none" stroke="rgba(200,80,120,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Tiara / Crown */}
                      <path d="M34,8 L36,3 L38,6 L40,1 L42,6 L44,3 L46,8" fill="none" stroke="rgba(255,220,40,0.95)" strokeWidth="2" strokeLinejoin="round"/>
                      {/* Crown gems */}
                      {[[36,3,'rgba(255,80,80,0.95)'],[40,1,'rgba(255,220,40,1)'],[44,3,'rgba(200,80,255,0.95)']].map(([x,y,col],i)=>(
                        <circle key={i} cx={x as number} cy={y as number} r="2" fill={col as string} className="it-star" style={{animationDelay:`${i*0.25}s`}}/>
                      ))}
                    </g>
                  </>),
                  // ── PIRATES — tall ship on the dark sea ─────────────────────
                  'Pirates': (<>
                    {/* Stars — fixed, opacity only */}
                    <S cx={62} cy={4} r={1.3} d="0s"/><S cx={72} cy={10} r={1.0} d="0.4s"/><S cx={55} cy={2} r={1.5} d="0.8s"/><S cx={76} cy={18} r={0.9} d="0.6s"/>
                    {/* Crescent moon */}
                    <circle cx="10" cy="11" r="9" fill="rgba(255,235,145,0.92)"/>
                    <circle cx="14" cy="9"  r="7.5" fill="#071422"/>
                    {/* Waves — dark ocean */}
                    <path d="M0,50 Q10,44 20,50 Q30,56 40,50 Q50,44 60,50 Q70,56 80,50" fill="rgba(20,50,130,0.45)" className="it-wave-y"/>
                    <path d="M0,56 Q10,50 20,56 Q30,62 40,56 Q50,50 60,56 Q70,62 80,56" fill="rgba(20,50,130,0.55)" className="it-wave-y" style={{animationDelay:'0.5s'}}/>
                    {/* Ship — gently bobs on the water */}
                    <g className="it-bob" style={{transformOrigin:'40px 40px'}}>
                      {/* Hull */}
                      <polygon points="20,38 60,38 56,50 24,50" fill="rgba(90,48,12,0.97)"/>
                      {/* Deck railing */}
                      <rect x="20" y="36" width="40" height="3" rx="1" fill="rgba(120,65,18,0.95)"/>
                      {/* Portholes */}
                      <circle cx="30" cy="44" r="2.2" fill="rgba(0,0,0,0.5)"/><circle cx="30" cy="44" r="1.2" fill="rgba(255,200,80,0.3)"/>
                      <circle cx="40" cy="44" r="2.2" fill="rgba(0,0,0,0.5)"/><circle cx="40" cy="44" r="1.2" fill="rgba(255,200,80,0.3)"/>
                      <circle cx="50" cy="44" r="2.2" fill="rgba(0,0,0,0.5)"/><circle cx="50" cy="44" r="1.2" fill="rgba(255,200,80,0.3)"/>
                      {/* Main mast */}
                      <rect x="38.5" y="6" width="3" height="30" fill="rgba(140,80,18,0.97)"/>
                      {/* Yard arm (horizontal cross) */}
                      <rect x="27" y="14" width="26" height="2" rx="1" fill="rgba(140,80,18,0.95)"/>
                      {/* Main square sail */}
                      <polygon points="28,14 52,14 50,34 30,34" fill="rgba(215,195,148,0.92)"/>
                      <line x1="40" y1="14" x2="40" y2="34" stroke="rgba(170,140,90,0.35)" strokeWidth="1"/>
                      <line x1="28" y1="22" x2="52" y2="22" stroke="rgba(170,140,90,0.25)" strokeWidth="0.8"/>
                      {/* Foresail (triangle from bow to mast) */}
                      <polygon points="20,36 40,6 40,36" fill="rgba(195,175,125,0.65)"/>
                      {/* Rigging lines */}
                      <line x1="40" y1="6" x2="20" y2="36" stroke="rgba(160,110,40,0.45)" strokeWidth="1"/>
                      <line x1="40" y1="6" x2="60" y2="36" stroke="rgba(160,110,40,0.45)" strokeWidth="1"/>
                      {/* Crow's nest platform */}
                      <rect x="35" y="4" width="10" height="5" rx="1" fill="rgba(90,48,12,0.97)" stroke="rgba(140,80,18,0.7)" strokeWidth="0.8"/>
                      {/* Skull flag at very top */}
                      <rect x="38.5" y="2" width="12" height="3" fill="#071422"/>
                      <rect x="38.5" y="1" width="11" height="5" rx="0.5" fill="rgba(25,25,25,0.97)"/>
                      <circle cx="43" cy="3.5" r="1.6" fill="rgba(240,240,240,0.9)"/>
                      <line x1="41.4" y1="4.8" x2="43" y2="5.8" stroke="rgba(240,240,240,0.8)" strokeWidth="0.7"/>
                      <line x1="44.6" y1="4.8" x2="43" y2="5.8" stroke="rgba(240,240,240,0.8)" strokeWidth="0.7"/>
                      {/* Pirate idle — always faintly visible so hover "reveal" is satisfying */}
                      <g opacity="0.25">
                        <circle cx="40" cy="2.5" r="2.8" fill="rgba(215,168,112,1)"/>
                        <rect x="37" y="0.2" width="6" height="2" rx="0.5" fill="rgba(18,18,18,1)"/>
                        <rect x="37.5" y="4" width="5" height="5.5" rx="0.5" fill="rgba(25,25,80,1)"/>
                      </g>
                      {/* Pirate on hover — bounces in then waves dramatically */}
                      <g className="it-pirate-appear" style={{transformOrigin:'40px 4px'}}>
                        {/* Body */}
                        <rect x="37.5" y="4" width="5" height="5.5" rx="0.5" fill="rgba(25,25,80,0.97)"/>
                        {/* Head */}
                        <circle cx="40" cy="2.5" r="2.8" fill="rgba(215,168,112,0.97)"/>
                        {/* Pirate hat */}
                        <rect x="37" y="0.2" width="6" height="2" rx="0.5" fill="rgba(18,18,18,0.97)"/>
                        {/* Waving arm — wide rotation */}
                        <g className="it-pirate-wave" style={{transformOrigin:'42.5px 5.5px'}}>
                          <line x1="42.5" y1="5.5" x2="49" y2="1.5" stroke="rgba(25,25,80,0.97)" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="49" cy="1.5" r="2" fill="rgba(215,168,112,0.97)"/>
                        </g>
                        {/* Resting arm */}
                        <line x1="37.5" y1="5.5" x2="33" y2="7.5" stroke="rgba(25,25,80,0.97)" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </g>
                  </>),
                  // ── MAGIC — elegant wand with swirling energy ────────────────
                  'Magic': (<>
                    {/* Background sparkles */}
                    {[{x:6,y:5},{x:15,y:30},{x:70,y:8},{x:74,y:32},{x:8,y:50},{x:75,y:52}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r={1.4+i%2*0.5} fill={c(0.8)} className="it-star" style={{animationDelay:`${i*0.38}s`}}/>
                    ))}
                    {/* Wand pivots from handle base */}
                    <g className="it-wand-swing" style={{transformOrigin:'35px 56px'}}>
                      {/* Handle — carved wood with bands */}
                      <rect x="29" y="48" width="12" height="16" rx="4" fill="rgba(75,38,8,0.97)"/>
                      <rect x="29" y="51" width="12" height="2"  rx="1" fill="rgba(175,135,45,0.75)"/>
                      <rect x="29" y="55" width="12" height="2"  rx="1" fill="rgba(175,135,45,0.75)"/>
                      <rect x="29" y="59" width="12" height="2"  rx="1" fill="rgba(175,135,45,0.75)"/>
                      {/* Guard / crosspiece */}
                      <rect x="25" y="46" width="20" height="4" rx="2" fill="rgba(155,115,40,0.9)"/>
                      {/* Shaft — tapered golden */}
                      <path d="M35,46 L54,10" stroke="rgba(215,180,75,0.97)" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M35,46 L54,10" stroke="rgba(255,230,130,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
                      {/* Crystal orb at tip — glowing */}
                      <circle cx="54" cy="9"  r="7"  fill={c(0.15)}/>
                      <circle cx="54" cy="9"  r="4.5" fill={c(0.45)}/>
                      <circle cx="54" cy="9"  r="3"   fill={c(0.92)} className="it-pulse"/>
                      {/* 8-pointed star burst */}
                      {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((deg,i)=>(
                        <line key={i} x1="54" y1="9" x2={54+(i%2===0?11:7)*Math.cos(deg*Math.PI/180)} y2={9+(i%2===0?11:7)*Math.sin(deg*Math.PI/180)} stroke={c(i%2===0?0.75:0.45)} strokeWidth={i%2===0?1.4:0.9} strokeLinecap="round"/>
                      ))}
                      {/* Swirling energy arcs — S-curves emanating from tip */}
                      <path d="M54,9 Q48,2 40,10 Q32,18 36,28 Q40,36 34,42" fill="none" stroke={c(0.5)} strokeWidth="1.6" strokeLinecap="round" className="it-pulse"/>
                      <path d="M54,9 Q62,3 68,12 Q74,22 68,30 Q62,36 66,44" fill="none" stroke={c(0.4)} strokeWidth="1.3" strokeLinecap="round" className="it-pulse" style={{animationDelay:'0.6s'}}/>
                      {/* Orbiting energy beads */}
                      {[0,1,2,3,4].map(i=>(
                        <circle key={i} r="2.5" fill={c(0.92)} className="it-orbit" style={{transformOrigin:'54px 9px',animationDelay:`${i*0.22}s`}}/>
                      ))}
                      {/* Trail down shaft */}
                      {[{x:51,y:16},{x:47,y:23},{x:43,y:31},{x:39,y:39}].map(({x,y},i)=>(
                        <circle key={i} cx={x} cy={y} r={2.8-i*0.45} fill={c(0.62-i*0.1)} className="it-star" style={{animationDelay:`${i*0.22}s`}}/>
                      ))}
                    </g>
                  </>),
                  // ── ALIENS — dark space encounter ───────────────────────────
                  'Aliens': (<>
                    {/* Stars */}
                    {[{x:6,y:4,r:1.3},{x:18,y:2,r:0.9},{x:38,y:5,r:1.6},{x:54,y:3,r:1.1},{x:66,y:6,r:1.4},{x:74,y:14,r:1.0},{x:4,y:18,r:1.2},{x:76,y:28,r:0.8}].map(({x,y,r},i)=>(
                      <circle key={i} cx={x} cy={y} r={r} fill="rgba(200,255,200,0.85)" className="it-star" style={{animationDelay:`${i*0.22}s`}}/>
                    ))}
                    {/* Planet in corner */}
                    <circle cx="68" cy="10" r="9"  fill="rgba(0,180,80,0.25)"/>
                    <circle cx="68" cy="10" r="7"  fill="rgba(0,200,100,0.35)"/>
                    <ellipse cx="68" cy="10" rx="9" ry="3" fill="none" stroke="rgba(0,220,120,0.4)" strokeWidth="1.5" transform="rotate(-20,68,10)"/>
                    {/* UFO — hovering */}
                    <ellipse cx="40" cy="20" rx="20" ry="9"  fill="rgba(0,180,80,0.35)"/>
                    <ellipse cx="40" cy="21" rx="14" ry="6"  fill="rgba(0,220,120,0.5)"/>
                    <ellipse cx="40" cy="19" rx="7"  ry="6"  fill="rgba(0,240,140,0.4)"/>
                    <circle  cx="40" cy="18" r="4"   fill="rgba(100,255,180,0.8)" className="it-pulse"/>
                    {/* UFO lights */}
                    {[28,34,40,46,52].map((x,i)=>(
                      <circle key={i} cx={x} cy={24} r="1.8" fill="rgba(100,255,180,0.9)" className="it-star" style={{animationDelay:`${i*0.18}s`}}/>
                    ))}
                    {/* Abduction beam */}
                    <g className="it-beam" style={{transformOrigin:'40px 27px'}}>
                      <polygon points="30,27 50,27 55,58 25,58" fill="rgba(0,255,120,0.1)"/>
                      <line x1="40" y1="27" x2="40" y2="58" stroke="rgba(0,255,120,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
                      <ellipse cx="40" cy="52" rx="10" ry="3.5" fill="rgba(0,255,120,0.15)"/>
                    </g>
                    {/* Small alien figure in beam */}
                    <g className="it-float" style={{transformOrigin:'40px 46px'}}>
                      <ellipse cx="40" cy="46" rx="4"  ry="5" fill="rgba(0,200,80,0.7)"/>
                      <circle  cx="40" cy="40" r="4.5" fill="rgba(0,220,100,0.8)"/>
                      <circle  cx="38" cy="39" r="1.5" fill="rgba(0,0,0,0.9)"/>
                      <circle  cx="42" cy="39" r="1.5" fill="rgba(0,0,0,0.9)"/>
                    </g>
                  </>),
                  // ── DINOSAURS — prehistoric jungle night ────────────────────
                  'Dinosaurs': (<>
                    {/* Stars in the dark sky */}
                    <S cx={10} cy={4}  r={1.2} d="0s"/><S cx={28} cy={2}  r={0.9} d="0.4s"/>
                    <S cx={55} cy={5}  r={1.4} d="0.7s"/><S cx={72} cy={3}  r={1.0} d="0.2s"/>
                    {/* Jungle ferns — left side */}
                    {[0,1,2].map(i=>(
                      <g key={i}><line x1={6+i*3} y1={60} x2={6+i*3} y2={35-i*4} stroke="rgba(20,120,40,0.8)" strokeWidth="2"/>
                      {[-1,0,1].map(j=><ellipse key={j} cx={(6+i*3)+j*8} cy={35-i*4+j*4} rx="8" ry="4" fill="rgba(20,140,50,0.45)" transform={`rotate(${j*20},${(6+i*3)+j*8},${35-i*4+j*4})`}/>)}</g>
                    ))}
                    {/* Jungle ferns — right side */}
                    {[0,1,2].map(i=>(
                      <g key={i}><line x1={72-i*3} y1={60} x2={72-i*3} y2={32-i*4} stroke="rgba(20,120,40,0.8)" strokeWidth="2"/>
                      {[-1,0,1].map(j=><ellipse key={j} cx={(72-i*3)+j*8} cy={32-i*4+j*4} rx="8" ry="4" fill="rgba(20,140,50,0.45)" transform={`rotate(${j*20},${(72-i*3)+j*8},${32-i*4+j*4})`}/>)}</g>
                    ))}
                    {/* Ground */}
                    <rect x="0" y="50" width="80" height="10" fill="rgba(20,80,20,0.4)"/>
                    {/* Footprints */}
                    {[16,30,46,60].map((x,i)=>(
                      <ellipse key={i} cx={x} cy={54} rx="4" ry="2.5" fill="rgba(10,60,10,0.5)" transform={`rotate(${i%2===0?-15:15},${x},54)`}/>
                    ))}
                    {/* T-Rex walking across */}
                    <g className="it-walk" style={{transformOrigin:'16px 34px'}}>
                      {/* Body */}
                      <ellipse cx="16" cy="34" rx="11" ry="8" fill="rgba(80,160,60,0.9)"/>
                      {/* Head + neck */}
                      <ellipse cx="25" cy="27" rx="8" ry="6" fill="rgba(90,170,65,0.9)"/>
                      {/* Snout */}
                      <polygon points="33,25 40,22 38,30" fill="rgba(80,155,55,0.9)"/>
                      {/* Eye */}
                      <circle cx="29" cy="25" r="2.5" fill="rgba(0,0,0,0.8)"/>
                      <circle cx="29.5" cy="24.5" r="1" fill="rgba(255,255,100,0.9)"/>
                      {/* Tiny arms */}
                      <line x1="20" y1="30" x2="25" y2="36" stroke="rgba(80,160,60,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
                      {/* Legs */}
                      <line x1="12" y1="41" x2="8"  y2="52" stroke="rgba(70,140,50,0.9)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="20" y1="41" x2="18" y2="52" stroke="rgba(70,140,50,0.9)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Tail */}
                      <path d="M5,36 Q-4,38 -8,34" fill="none" stroke="rgba(80,160,60,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                    </g>
                  </>),
                  // ── ANIMALS — safari at dusk ─────────────────────────────────
                  'Animals': (<>
                    {/* Stars */}
                    <S cx={6}  cy={4}  r={1.0} d="0s"/><S cx={20} cy={2}  r={0.8} d="0.4s"/>
                    <S cx={70} cy={5}  r={1.2} d="0.7s"/>
                    {/* Setting sun */}
                    <circle cx="68" cy="14" r="10" fill="rgba(255,160,50,0.5)"/>
                    <circle cx="68" cy="14" r="7"  fill="rgba(255,180,60,0.7)"/>
                    {/* Grass */}
                    <rect x="0" y="46" width="80" height="14" fill="rgba(30,100,20,0.5)"/>
                    {[5,15,26,38,50,62,72].map((x,i)=>(
                      <g key={i}><line x1={x} y1={46} x2={x-2} y2={38+i%3*2} stroke="rgba(40,130,30,0.7)" strokeWidth="1.5"/>
                      <line x1={x+3} y1={46} x2={x+5} y2={39+i%2*3} stroke="rgba(40,130,30,0.7)" strokeWidth="1.5"/></g>
                    ))}
                    {/* Lion face — king of the animals */}
                    <g className="it-bob" style={{transformOrigin:'40px 22px'}}>
                      {/* Mane */}
                      <circle cx="40" cy="22" r="16" fill="rgba(180,100,20,0.5)"/>
                      <circle cx="40" cy="22" r="13" fill="rgba(200,120,30,0.4)"/>
                      {/* Head */}
                      <circle cx="40" cy="22" r="10" fill="rgba(230,170,70,0.97)"/>
                      {/* Ears */}
                      <circle cx="30" cy="13" r="5" fill="rgba(200,140,50,0.9)"/>
                      <circle cx="50" cy="13" r="5" fill="rgba(200,140,50,0.9)"/>
                      <circle cx="30" cy="13" r="2.5" fill="rgba(180,100,30,0.7)"/>
                      <circle cx="50" cy="13" r="2.5" fill="rgba(180,100,30,0.7)"/>
                      {/* Eyes */}
                      <circle cx="36" cy="20" r="3.5" fill="rgba(255,200,50,0.9)"/>
                      <circle cx="44" cy="20" r="3.5" fill="rgba(255,200,50,0.9)"/>
                      <circle cx="36.5" cy="20" r="1.8" fill="rgba(0,0,0,0.95)"/>
                      <circle cx="44.5" cy="20" r="1.8" fill="rgba(0,0,0,0.95)"/>
                      {/* Nose/muzzle */}
                      <ellipse cx="40" cy="26" rx="5" ry="3.5" fill="rgba(240,190,90,0.9)"/>
                      <ellipse cx="40" cy="26" rx="2.5" ry="1.8" fill="rgba(200,120,50,0.8)"/>
                      {/* Smile */}
                      <path d="M36,29 Q40,33 44,29" fill="none" stroke="rgba(180,100,40,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                  </>),
                  // ── OCEAN — deep sea world ───────────────────────────────────
                  'Ocean': (<>
                    {/* Coral reef */}
                    {[[5,58],[14,54],[60,56],[72,52]].map(([x,y],i)=>(
                      <g key={i}>
                        <line x1={x+3} y1={60} x2={x+3} y2={y} stroke={`rgba(${[255,80,100,200][i]},${[80,180,80,60][i]},${[80,100,200,200][i]},0.7)`} strokeWidth="2.5"/>
                        <path d={`M${x},${y} Q${x+3},${y-8} ${x+6},${y} Q${x+3},${y-4} ${x},${y}`} fill={`rgba(${[255,80,100,200][i]},${[80,180,80,60][i]},${[80,100,200,200][i]},0.45)`}/>
                      </g>
                    ))}
                    {/* Water surface shimmer */}
                    <path d="M0,30 Q10,25 20,30 Q30,35 40,30 Q50,25 60,30 Q70,35 80,30" fill="rgba(50,150,255,0.15)" className="it-wave-y"/>
                    <path d="M0,38 Q10,33 20,38 Q30,43 40,38 Q50,33 60,38 Q70,43 80,38" fill="rgba(30,120,220,0.2)" className="it-wave-y" style={{animationDelay:'0.5s'}}/>
                    {/* Bubbles */}
                    {[12,28,50,66].map((cx,i)=>(
                      <circle key={i} cx={cx} cy={18+i*5} r={2.2+i%2*0.8} fill="rgba(150,220,255,0.4)" className="it-up" style={{animationDelay:`${i*0.5}s`}}/>
                    ))}
                    {/* Tropical fish — eye on right = swims forward left-to-right */}
                    <g className="it-swim">
                      {/* Body */}
                      <ellipse cx="0" cy="26" rx="12" ry="7" fill="rgba(255,120,0,0.95)"/>
                      {/* Tail fin on the LEFT (trailing behind as it moves right) */}
                      <polygon points="-12,26 -22,20 -22,32" fill="rgba(255,80,0,0.9)"/>
                      {/* Yellow stripe */}
                      <ellipse cx="0" cy="26" rx="5.5" ry="4" fill="rgba(255,200,0,0.55)"/>
                      {/* Eye on the RIGHT (leading as it moves right) */}
                      <circle cx="7" cy="24" r="2.4" fill="rgba(0,0,0,0.85)"/>
                      <circle cx="7.6" cy="23.4" r="0.9" fill="rgba(255,255,255,0.95)"/>
                      {/* Dorsal fin on top */}
                      <polygon points="-3,19 3,19 1,26" fill="rgba(255,90,0,0.7)"/>
                      {/* Vertical stripe details */}
                      <line x1="-4" y1="19" x2="-4" y2="33" stroke="rgba(200,60,0,0.35)" strokeWidth="1.5"/>
                      <line x1="2"  y1="19" x2="2"  y2="33" stroke="rgba(200,60,0,0.35)" strokeWidth="1.5"/>
                    </g>
                    {/* Small starfish */}
                    <g style={{opacity:0.7}}>
                      {[0,1,2,3,4].map(i=><line key={i} x1="66" y1="55" x2={66+8*Math.cos(i*72*Math.PI/180)} y2={55+8*Math.sin(i*72*Math.PI/180)} stroke="rgba(255,150,50,0.8)" strokeWidth="2.5" strokeLinecap="round"/>)}
                    </g>
                  </>),
                  // ── NATURE — sunrise forest ──────────────────────────────────
                  'Nature': (<>
                    {/* Sunrise sky gradient effect */}
                    <ellipse cx="40" cy="0" rx="35" ry="22" fill="rgba(255,160,50,0.15)"/>
                    <circle cx="40" cy="2" r="10" fill="rgba(255,180,50,0.35)"/>
                    <circle cx="40" cy="2" r="7"  fill="rgba(255,200,60,0.5)"/>
                    {/* Sun rays */}
                    {[0,1,2,3,4,5,6,7].map(i=>(
                      <line key={i} x1="40" y1="2" x2={40+16*Math.cos(i*45*Math.PI/180)} y2={2+16*Math.sin(i*45*Math.PI/180)} stroke="rgba(255,200,60,0.25)" strokeWidth="1.5"/>
                    ))}
                    {/* Ground */}
                    <rect x="0" y="46" width="80" height="14" fill="rgba(30,120,30,0.4)"/>
                    {/* Flowers */}
                    {[[8,47],[20,44],[42,47],[60,44],[72,47]].map(([x,y],i)=>(
                      <g key={i}><line x1={x} y1={y} x2={x} y2={55} stroke="rgba(30,150,40,0.6)" strokeWidth="1.5"/>
                      {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*3} cy={y+Math.sin(j*72*Math.PI/180)*3} rx="2.2" ry="1.4" fill={['rgba(255,100,100,0.7)','rgba(255,200,50,0.7)','rgba(200,100,255,0.7)','rgba(100,200,255,0.7)','rgba(255,150,50,0.7)'][j]} transform={`rotate(${j*72},${x},${y})`}/>)}
                      <circle cx={x} cy={y} r="2" fill="rgba(255,220,50,0.9)"/></g>
                    ))}
                    {/* Large oak tree */}
                    <rect x="37" y="24" width="6" height="22" fill="rgba(100,60,20,0.8)" rx="2"/>
                    <circle cx="40" cy="18" r="16" fill="rgba(30,160,50,0.6)"/>
                    <circle cx="40" cy="14" r="12" fill="rgba(40,180,60,0.7)"/>
                    {/* Drifting leaves */}
                    {[[-14,10],[12,-12],[18,6],[-6,16]].map(([dx,dy],i)=>(
                      <g key={i} className="it-leaf" style={{transformOrigin:`${40+dx}px ${14+dy}px`,animationDelay:`${i*0.55}s`}}>
                        <ellipse cx={40+dx} cy={14+dy} rx="6" ry="3" fill="rgba(50,200,70,0.8)" transform={`rotate(${i*45},${40+dx},${14+dy})`}/>
                      </g>
                    ))}
                    {/* Birds */}
                    {[[62,14],[70,10]].map(([x,y],i)=>(
                      <path key={i} d={`M${x},${y} Q${x+4},${y-3} ${x+8},${y}`} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                    ))}
                  </>),
                  // ── ROBOTS — dark robot workshop ─────────────────────────────
                  'Robots': (<>
                    {/* Circuit board traces */}
                    {[[5,20],[5,35],[75,22],[75,38]].map(([x,y],i)=>(
                      <line key={i} x1={x} y1={y} x2={i<2?24:56} y2={y} stroke="rgba(0,200,120,0.3)" strokeWidth="1" strokeDasharray="3,2"/>
                    ))}
                    {[0,1,2,3].map(i=><circle key={i} cx={i<2?5:75} cy={i%2===0?20:35} r="2" fill="rgba(0,200,120,0.5)" className="it-star" style={{animationDelay:`${i*0.3}s`}}/>)}
                    {/* Robot body */}
                    <rect x="26" y="20" width="28" height="26" rx="4" fill="rgba(60,80,120,0.7)" stroke="rgba(100,150,220,0.5)" strokeWidth="1"/>
                    {/* Head */}
                    <rect x="30" y="9" width="20" height="13" rx="3" fill="rgba(50,70,110,0.8)" stroke="rgba(100,150,220,0.4)" strokeWidth="1"/>
                    {/* Antenna */}
                    <line x1="40" y1="7" x2="40" y2="9" stroke="rgba(100,200,255,0.8)" strokeWidth="2"/>
                    <circle cx="40" cy="5.5" r="2.5" fill="rgba(100,200,255,0.9)" className="it-star" style={{animationDelay:'0s'}}/>
                    {/* Eyes — glowing */}
                    <circle cx="35" cy="14" r="4" fill="rgba(0,0,0,0.5)"/>
                    <circle cx="35" cy="14" r="2.8" fill="rgba(0,220,180,0.9)" className="it-star" style={{animationDelay:'0s'}}/>
                    <circle cx="45" cy="14" r="4" fill="rgba(0,0,0,0.5)"/>
                    <circle cx="45" cy="14" r="2.8" fill="rgba(0,220,180,0.9)" className="it-star" style={{animationDelay:'0.5s'}}/>
                    {/* Mouth display */}
                    <rect x="33" y="19" width="14" height="4" rx="2" fill="rgba(0,0,0,0.4)"/>
                    <rect x="34" y="20" width="3" height="2" rx="0.5" fill="rgba(0,220,100,0.8)"/>
                    <rect x="38" y="20" width="5" height="2" rx="0.5" fill="rgba(0,220,100,0.8)"/>
                    <rect x="44" y="20" width="2" height="2" rx="0.5" fill="rgba(0,220,100,0.8)"/>
                    {/* Chest panel */}
                    <rect x="30" y="26" width="20" height="12" rx="2" fill="rgba(30,50,90,0.6)"/>
                    <rect x="33" y="29" width="6" height="3" rx="1" fill="rgba(0,180,255,0.7)"/>
                    <circle cx="44" cy="30.5" r="2.5" fill="rgba(255,100,50,0.8)" className="it-star" style={{animationDelay:'0.3s'}}/>
                    {/* Arms */}
                    <rect x="17" y="22" width="10" height="5" rx="2" fill="rgba(50,70,110,0.7)"/>
                    <rect x="53" y="22" width="10" height="5" rx="2" fill="rgba(50,70,110,0.7)"/>
                    {/* Legs */}
                    <rect x="28" y="46" width="8" height="14" rx="2" fill="rgba(50,70,110,0.7)"/>
                    <rect x="44" y="46" width="8" height="14" rx="2" fill="rgba(50,70,110,0.7)"/>
                    {/* Spinning gear */}
                    <g className="it-spin-f" style={{transformOrigin:'68px 42px'}}>
                      <circle cx="68" cy="42" r="9"  fill="none" stroke="rgba(100,150,220,0.45)" strokeWidth="1.5"/>
                      <circle cx="68" cy="42" r="3.5" fill="rgba(100,150,220,0.5)"/>
                      {[0,1,2,3,4,5].map(i=><line key={i} x1="68" y1="42" x2={68+9*Math.cos(i*60*Math.PI/180)} y2={42+9*Math.sin(i*60*Math.PI/180)} stroke="rgba(100,150,220,0.4)" strokeWidth="1.5"/>)}
                    </g>
                  </>),
                  // ── SCIENCE — glowing dark lab ───────────────────────────────
                  'Science': (<>
                    {/* Lab shelf */}
                    <line x1="0" y1="18" x2="80" y2="18" stroke="rgba(60,120,160,0.4)" strokeWidth="1.5"/>
                    {/* Small test tubes on shelf */}
                    {[8,18].map((x,i)=>(
                      <g key={i}><rect x={x} y={8} width={5} height={10} rx="1" fill={`rgba(${i===0?'0,200,255':'200,100,255'},0.5)`}/><ellipse cx={x+2.5} cy={8} rx="2.5" ry="1" fill={`rgba(${i===0?'0,200,255':'200,100,255'},0.7)`}/></g>
                    ))}
                    {/* Main flask */}
                    <path d="M32,18 L27,46 Q27,55 40,55 Q53,55 53,46 L48,18 Z" fill="rgba(0,180,255,0.12)" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5"/>
                    <rect x="30" y="16" width="20" height="4" rx="2" fill="rgba(60,120,160,0.6)"/>
                    {/* Glowing liquid */}
                    <ellipse cx="40" cy="48" rx="11" ry="5.5" fill="rgba(0,220,180,0.35)"/>
                    <rect x="27" y="34" width="26" height="14" rx="0" fill="rgba(0,180,255,0.15)"/>
                    {/* Bubbles rising */}
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={32+i*5} cy={38-i*3} r="2.5" fill="rgba(0,220,200,0.75)" className="it-up" style={{animationDelay:`${i*0.38}s`}}/>
                    ))}
                    {/* Lightning bolt */}
                    <g className="it-flash" style={{transformOrigin:'68px 28px'}}>
                      <polygon points="68,8 63,24 69,24 63,44 75,20 69,20 74,8" fill="rgba(255,220,50,0.97)"/>
                    </g>
                    {/* Glow effect on flask */}
                    <ellipse cx="40" cy="46" rx="14" ry="8" fill="rgba(0,220,180,0.08)" className="it-pulse"/>
                  </>),
                  // ── GAMING — dark arcade ─────────────────────────────────────
                  'Gaming': (<>
                    {/* Screen glow */}
                    <rect x="10" y="4"  width="60" height="48" rx="5" fill="rgba(80,40,180,0.25)" stroke="rgba(120,80,220,0.6)" strokeWidth="1.5"/>
                    <rect x="13" y="7"  width="54" height="38" rx="3" fill="rgba(40,20,100,0.8)"/>
                    {/* Score display */}
                    <text x="16" y="15" fontSize="5" fill="rgba(255,200,0,0.9)" fontFamily="monospace">SCORE: 9400</text>
                    <text x="42" y="15" fontSize="5" fill="rgba(255,60,60,0.9)"  fontFamily="monospace">3 ♥</text>
                    {/* Platform blocks */}
                    {[[16,32,18,4],[38,28,14,4],[54,36,16,4]].map(([x,y,w,h],i)=>(
                      <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(100,200,100,0.7)" rx="1"/>
                    ))}
                    {/* Coins on platforms */}
                    {[[22,26],[45,22]].map(([x,y],i)=>(
                      <circle key={i} cx={x} cy={y} r="3" fill="rgba(255,200,0,0.9)" className="it-star" style={{animationDelay:`${i*0.4}s`}}/>
                    ))}
                    {/* Pixel character */}
                    <g className="it-walk" style={{transformOrigin:'24px 28px'}}>
                      <rect x="21" y="20" width="6" height="6" rx="1" fill="rgba(255,160,80,0.95)"/>
                      <rect x="22" y="16" width="5" height="5" rx="1" fill="rgba(255,100,50,0.95)"/>
                      <rect x="20" y="26" width="3" height="5" rx="1" fill="rgba(60,120,255,0.9)"/>
                      <rect x="24" y="26" width="3" height="5" rx="1" fill="rgba(60,120,255,0.9)"/>
                      <rect x="20" y="31" width="2.5" height="3" rx="0.5" fill="rgba(200,160,100,0.9)"/>
                      <rect x="24" y="31" width="2.5" height="3" rx="0.5" fill="rgba(200,160,100,0.9)"/>
                    </g>
                    {/* Enemy */}
                    <g className="it-bob" style={{transformOrigin:'56px 24px'}}>
                      <rect x="52" y="20" width="8" height="7" rx="1" fill="rgba(255,60,60,0.9)"/>
                      <rect x="50" y="18" width="4" height="3" rx="0.5" fill="rgba(255,60,60,0.9)"/>
                      <rect x="58" y="18" width="4" height="3" rx="0.5" fill="rgba(255,60,60,0.9)"/>
                      <circle cx="54.5" cy="23" r="1.2" fill="rgba(0,0,0,0.9)"/>
                      <circle cx="57.5" cy="23" r="1.2" fill="rgba(0,0,0,0.9)"/>
                    </g>
                    {/* Controller at bottom */}
                    <rect x="13" y="48" width="54" height="8" rx="3" fill="rgba(60,40,120,0.7)"/>
                    {[22,28,34,42,48].map((x,i)=><circle key={i} cx={x} cy={52} r="2.5" fill={['rgba(255,100,100,0.8)','rgba(100,100,255,0.8)','rgba(100,255,100,0.8)','rgba(0,0,0,0.5)','rgba(0,0,0,0.5)'][i]}/>)}
                    <line x1="50" y1="50" x2="50" y2="54" stroke="rgba(150,120,200,0.6)" strokeWidth="1.2"/>
                    <line x1="48" y1="52" x2="52" y2="52" stroke="rgba(150,120,200,0.6)" strokeWidth="1.2"/>
                  </>),
                  // ── SOCCER — sunny pitch ─────────────────────────────────────
                  'Soccer': (<>
                    {/* Sky */}
                    <rect x="0" y="0" width="80" height="28" fill="rgba(100,180,255,0.4)"/>
                    {/* Clouds */}
                    <ellipse cx="18" cy="10" rx="12" ry="5" fill="rgba(255,255,255,0.7)"/>
                    <ellipse cx="12" cy="12" rx="8"  ry="4" fill="rgba(255,255,255,0.65)"/>
                    <ellipse cx="62" cy="8"  rx="10" ry="4" fill="rgba(255,255,255,0.65)"/>
                    <ellipse cx="70" cy="10" rx="7"  ry="3.5" fill="rgba(255,255,255,0.6)"/>
                    {/* Grass stripe pattern */}
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={28} width={8} height={32} fill={i%2===0?'rgba(30,160,60,0.8)':'rgba(25,145,55,0.8)'}/>)}
                    <line x1="0"  y1="28" x2="80" y2="28" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    {/* Pitch markings */}
                    <line x1="40" y1="28" x2="40" y2="60" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
                    <circle cx="40" cy="44" r="12" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2"/>
                    {/* Goal posts */}
                    <line x1="0" y1="32" x2="0" y2="48" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"/>
                    <line x1="0" y1="32" x2="10" y2="32" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"/>
                    <line x1="0" y1="48" x2="10" y2="48" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"/>
                    {/* Ball bouncing */}
                    <g className="it-bounce" style={{transformOrigin:'50px 42px'}}>
                      <circle cx="50" cy="42" r="9" fill="rgba(255,255,255,0.95)"/>
                      {/* Ball panels */}
                      {[0,1,2,3,4].map(i=><line key={i} x1="50" y1="42" x2={50+9*Math.cos(i*72*Math.PI/180)} y2={42+9*Math.sin(i*72*Math.PI/180)} stroke="rgba(0,0,0,0.3)" strokeWidth="1.2"/>)}
                      <circle cx="50" cy="42" r="3.5" fill="rgba(0,0,0,0.15)"/>
                    </g>
                  </>),
                  // ── FOOTBALL — night game under lights ──────────────────────
                  'Football': (<>
                    {/* Field stripes */}
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={0} width={8} height={60} fill={i%2===0?'rgba(20,100,30,0.8)':'rgba(18,90,26,0.8)'}/>)}
                    {/* Yard lines */}
                    {[10,20,30,40,50,60,70].map((x,i)=><line key={i} x1={x} y1={5} x2={x} y2={55} stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>)}
                    <line x1="5" y1="30" x2="75" y2="30" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                    {/* Goal posts */}
                    <line x1="5" y1="8"  x2="5"  y2="52" stroke="rgba(255,220,0,0.9)" strokeWidth="2.5"/>
                    <line x1="5" y1="8"  x2="18" y2="8"  stroke="rgba(255,220,0,0.9)" strokeWidth="2.5"/>
                    <line x1="5" y1="52" x2="18" y2="52" stroke="rgba(255,220,0,0.9)" strokeWidth="2.5"/>
                    {/* Stadium lights */}
                    <circle cx="70" cy="5" r="4" fill="rgba(255,240,150,0.9)" className="it-pulse"/>
                    <polygon points="62,5 78,5 75,20 65,20" fill="rgba(255,240,150,0.06)"/>
                    {/* Football spiraling */}
                    <g className="it-bounce" style={{transformOrigin:'48px 30px'}}>
                      <ellipse cx="48" cy="30" rx="12" ry="8" fill="rgba(160,90,20,0.95)" transform="rotate(-20,48,30)"/>
                      <line x1="39" y1="26" x2="57" y2="34" stroke="rgba(255,255,255,0.6)" strokeWidth="2" transform="rotate(-20,48,30)"/>
                      {[0,1,2].map(i=><line key={i} x1={42+i*5} y1="21" x2={40+i*5} y2="39" stroke="rgba(255,255,255,0.35)" strokeWidth="1" transform="rotate(-20,48,30)"/>)}
                    </g>
                  </>),
                  // ── GYMNASTICS — proper gymnast on beam ──────────────────────
                  'Gymnastics': (<>
                    {/* Gym floor */}
                    <rect x="0" y="50" width="80" height="10" fill="rgba(255,225,160,0.5)"/>
                    {[0,1,2,3,4].map(i=><line key={i} x1={i*20} y1="50" x2={i*20} y2="60" stroke="rgba(200,160,80,0.25)" strokeWidth="1"/>)}
                    <line x1="0" y1="50" x2="80" y2="50" stroke="rgba(200,160,80,0.5)" strokeWidth="1.5"/>
                    {/* Balance beam + supports */}
                    <rect x="12" y="37" width="56" height="3.5" rx="1.5" fill={c(0.75)}/>
                    <rect x="19" y="40" width="5" height="10" rx="1" fill={c(0.55)}/>
                    <rect x="56" y="40" width="5" height="10" rx="1" fill={c(0.55)}/>
                    {/* Gymnast in arabesque pose on beam */}
                    <g className="it-bob" style={{transformOrigin:'40px 25px'}}>
                      {/* Standing leg */}
                      <line x1="40" y1="37" x2="40" y2="26" stroke={c(0.8)} strokeWidth="4" strokeLinecap="round"/>
                      {/* Body */}
                      <rect x="36.5" y="20" width="7" height="10" rx="3" fill={c(0.85)}/>
                      {/* Head */}
                      <circle cx="40" cy="15" r="6" fill={c(0.9)}/>
                      {/* Hair bun */}
                      <circle cx="40" cy="9.5" r="3.5" fill={c(0.7)}/>
                      {/* Arms up in a V */}
                      <line x1="40" y1="22" x2="28" y2="14" stroke={c(0.85)} strokeWidth="3.5" strokeLinecap="round"/>
                      <line x1="40" y1="22" x2="52" y2="14" stroke={c(0.85)} strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Raised leg behind (arabesque) */}
                      <path d="M40,30 Q46,34 56,28" fill="none" stroke={c(0.8)} strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Leotard detail */}
                      <ellipse cx="40" cy="26" rx="4" ry="3" fill={c(0.6)}/>
                    </g>
                    {/* Score/stars */}
                    {[{x:8,y:18},{x:72,y:18},{x:8,y:38},{x:72,y:38}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="2" fill={c(0.7)} className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    {/* Ribbon arc */}
                    <path d="M8,28 Q20,10 35,22 Q50,34 62,18" fill="none" stroke={c(0.45)} strokeWidth="2" strokeLinecap="round" className="it-ribbon"/>
                  </>),
                  // ── DANCING — ballet dancer in spotlight ──────────────────────
                  'Dancing': (<>
                    {/* Stage floor */}
                    <rect x="0" y="50" width="80" height="10" fill="rgba(60,20,90,0.55)"/>
                    <line x1="0" y1="50" x2="80" y2="50" stroke="rgba(160,100,220,0.5)" strokeWidth="1.5"/>
                    {/* Spotlight */}
                    <circle cx="40" cy="3" r="7" fill="rgba(255,220,100,0.65)" className="it-pulse"/>
                    <polygon points="35,3 45,3 52,50 28,50" fill="rgba(255,220,100,0.07)"/>
                    {/* Stage glow circles */}
                    <ellipse cx="40" cy="50" rx="25" ry="5" fill="rgba(255,200,100,0.08)"/>
                    {/* Ballet dancer — elegant arabesque */}
                    <g className="it-spin-f" style={{transformOrigin:'40px 28px'}}>
                      {/* Standing leg — en pointe */}
                      <line x1="40" y1="42" x2="40" y2="50" stroke={c(0.85)} strokeWidth="4" strokeLinecap="round"/>
                      <ellipse cx="40" cy="50" rx="3" ry="1.5" fill={c(0.7)}/>{/* Pointe shoe */}
                      {/* Body in tutu */}
                      <rect x="36" y="30" width="8" height="14" rx="3.5" fill={c(0.88)}/>
                      {/* Tutu skirt */}
                      <ellipse cx="40" cy="42" rx="14" ry="5" fill={c(0.5)}/>
                      <ellipse cx="40" cy="44" rx="12" ry="4" fill={c(0.4)}/>
                      {/* Head */}
                      <circle cx="40" cy="21" r="7" fill={c(0.9)}/>
                      {/* Hair bun */}
                      <circle cx="40" cy="14.5" r="4.5" fill={c(0.7)}/>
                      {/* Tiara */}
                      <path d="M36,13 L37.5,10 L40,12 L42.5,10 L44,13" fill="none" stroke="rgba(255,215,40,0.9)" strokeWidth="1.8" strokeLinejoin="round"/>
                      {/* Raised arm — curved up */}
                      <path d="M40,32 Q28,26 24,18" fill="none" stroke={c(0.88)} strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="24" cy="18" r="3" fill={c(0.85)"/>
                      {/* Lower arm — out to side */}
                      <path d="M40,32 Q54,28 58,32" fill="none" stroke={c(0.88)} strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="58" cy="32" r="3" fill={c(0.85)}/>
                      {/* Raised leg — arabesque behind */}
                      <path d="M40,44 Q48,38 58,30" fill="none" stroke={c(0.85)} strokeWidth="4" strokeLinecap="round"/>
                    </g>
                    {/* Floating music notes */}
                    {[10,24,56,70].map((x,i)=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.38}s`,transformOrigin:`${x}px 44px`}}>
                        <text x={x-5} y="44" fontSize="14" fill={c(0.85)}>♪</text>
                      </g>
                    ))}
                  </>),
                  // ── KARATE — martial artist in proper gi ─────────────────────
                  'Karate': (<>
                    {/* Tatami mats */}
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={50} width={14} height={10} fill={c(0.1+i*0.025)} rx="1"/>)}
                    <line x1="0" y1="50" x2="80" y2="50" stroke={c(0.5)} strokeWidth="2"/>
                    {/* Belt rank board */}
                    <rect x="58" y="3" width="18" height="10" rx="2" fill={c(0.35)}/>
                    <rect x="60" y="5" width="14" height="6"  rx="1" fill="rgba(220,30,30,0.9)"/>
                    {/* Karateka — full figure in gi, kick pose */}
                    <g className="it-bob" style={{transformOrigin:'32px 28px'}}>
                      {/* Head */}
                      <circle cx="32" cy="10" r="7" fill={c(0.88)}/>
                      {/* Headband */}
                      <rect x="25" y="8.5" width="14" height="3.5" rx="1.5" fill="rgba(220,30,30,0.85)"/>
                      {/* White gi top */}
                      <polygon points="24,17 40,17 40,34 24,34" fill="rgba(240,235,225,0.9)"/>
                      {/* Gi lapels */}
                      <line x1="32" y1="17" x2="28" y2="34" stroke="rgba(200,190,175,0.6)" strokeWidth="1.5"/>
                      <line x1="32" y1="17" x2="36" y2="34" stroke="rgba(200,190,175,0.6)" strokeWidth="1.5"/>
                      {/* Black belt */}
                      <rect x="24" y="28" width="16" height="3" rx="1" fill="rgba(20,20,20,0.9)"/>
                      {/* Gi trousers */}
                      <rect x="25" y="34" width="13" height="16" rx="2" fill="rgba(235,230,220,0.9)"/>
                      {/* Standing leg */}
                      <line x1="30" y1="50" x2="30" y2="58" stroke={c(0.8)} strokeWidth="4.5" strokeLinecap="round"/>
                      <ellipse cx="30" cy="59" rx="4" ry="2" fill={c(0.65)}/>
                      {/* Kicking leg raised high */}
                      <path d="M36,38 Q44,32 52,24" fill="none" stroke="rgba(235,230,220,0.9)" strokeWidth="4.5" strokeLinecap="round"/>
                      <ellipse cx="53" cy="23" rx="4" ry="2.5" fill={c(0.7)} transform="rotate(-40,53,23)"/>
                      {/* Striking arm forward */}
                      <line x1="32" y1="24" x2="52" y2="20" stroke="rgba(240,235,225,0.95)" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="53" cy="19.5" r="4" fill={c(0.8)}/>
                      {/* Guard arm back */}
                      <line x1="32" y1="24" x2="16" y2="28" stroke="rgba(240,235,225,0.9)" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="15" cy="28.5" r="3.5" fill={c(0.75)}/>
                    </g>
                    {/* Board breaking — energy flash */}
                    <g className="it-flash" style={{transformOrigin:'60px 30px'}}>
                      <rect x="56" y="18" width="9" height="24" rx="1" fill="rgba(175,115,55,0.85)"/>
                      <line x1="56" y1="29" x2="65" y2="30" stroke="rgba(115,70,25,0.55)" strokeWidth="1"/>
                      {/* Crack lines */}
                      {[0,1,2,3].map(i=><line key={i} x1="60.5" y1={18+i*7} x2={57+i*2} y2={23+i*6} stroke="rgba(255,180,0,0.92)" strokeWidth="1.8"/>)}
                      {/* Impact sparks */}
                      {[0,1,2].map(i=><line key={i} x1="56" y1="28" x2={48-i*4} y2={22+i*6} stroke="rgba(255,200,50,0.85)" strokeWidth="1.5"/>)}
                    </g>
                  </>),
                  // ── SWIMMING — olympic pool ──────────────────────────────────
                  'Swimming': (<>
                    {/* Pool water — deep blue */}
                    <rect x="0" y="20" width="80" height="40" fill="rgba(0,80,180,0.6)"/>
                    {/* Lane dividers */}
                    {[13,26,39,52,65].map((x,i)=>(
                      <line key={i} x1={x} y1={20} x2={x} y2={60} stroke={i%2===0?'rgba(255,80,0,0.6)':'rgba(255,200,0,0.5)'} strokeWidth="2" strokeDasharray="4,4"/>
                    ))}
                    {/* Pool edge */}
                    <rect x="0" y="18" width="80" height="4" fill="rgba(200,200,200,0.8)"/>
                    <line x1="0" y1="20" x2="80" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                    {/* Water ripples */}
                    {[0,1,2,3].map(i=>(
                      <ellipse key={i} cx="40" cy={35+i*5} rx={8+i*6} ry={3+i*2} fill="none" stroke="rgba(150,220,255,0.3)" strokeWidth="1" className="it-pulse" style={{animationDelay:`${i*0.35}s`}}/>
                    ))}
                    {/* Wave surface */}
                    <path d="M0,26 Q10,22 20,26 Q30,30 40,26 Q50,22 60,26 Q70,30 80,26" fill="rgba(150,200,255,0.3)" className="it-wave-y"/>
                    {/* Swimmer stroking across */}
                    <g className="it-swim">
                      {/* Head */}
                      <circle cx="0" cy="22" r="5" fill="rgba(230,185,140,0.97)"/>
                      {/* Cap */}
                      <ellipse cx="0" cy="19" rx="5" ry="3" fill="rgba(255,50,50,0.9)"/>
                      {/* Goggles */}
                      <ellipse cx="-2" cy="22" rx="2" ry="1.5" fill="rgba(50,150,255,0.8)"/>
                      <ellipse cx="2" cy="22" rx="2" ry="1.5" fill="rgba(50,150,255,0.8)"/>
                      <line x1="-1" y1="22" x2="1" y2="22" stroke="rgba(50,150,255,0.6)" strokeWidth="0.8"/>
                      {/* Body */}
                      <rect x="-6" y="26" width="14" height="6" rx="3" fill="rgba(255,100,50,0.85)"/>
                      {/* Lead arm forward */}
                      <line x1="8"  y1="28" x2="18" y2="22" stroke="rgba(230,185,140,0.9)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Trailing arm in water */}
                      <line x1="-6" y1="28" x2="-16" y2="24" stroke="rgba(230,185,140,0.8)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Splash */}
                      <ellipse cx="16" cy="22" rx="5" ry="2.5" fill="rgba(200,230,255,0.4)"/>
                    </g>
                    {/* Scoreboard at top */}
                    <rect x="20" y="2" width="40" height="14" rx="2" fill="rgba(20,20,40,0.8)"/>
                    <text x="40" y="12" fontSize="7" fill="rgba(255,220,0,0.9)" textAnchor="middle" fontFamily="monospace">01:24.5</text>
                  </>),
                  // ── ART — studio canvas ─────────────────────────────────────
                  'Art': (<>
                    <rect x="10" y="5"  width="52" height="41" rx="3" fill="rgba(255,255,255,0.92)" stroke={c(0.5)} strokeWidth="2"/>
                    <rect x="13" y="8"  width="46" height="35" rx="1" fill="rgba(255,255,255,0.98)"/>
                    <circle cx="27" cy="22" r="7.5" fill="rgba(255,200,0,0.65)"/>
                    <circle cx="40" cy="16" r="5.5" fill="rgba(255,80,80,0.65)"/>
                    <circle cx="36" cy="30" r="7"   fill="rgba(60,200,60,0.6)"/>
                    <circle cx="50" cy="24" r="5"   fill="rgba(80,120,255,0.6)"/>
                    <circle cx="48" cy="35" r="4.5" fill="rgba(180,60,200,0.6)"/>
                    <rect x="64" y="4"  width="3.5" height="22" rx="1.5" fill={c(0.8)}/>
                    <ellipse cx="65.5" cy="27" rx="3.5" ry="4.5" fill="rgba(255,160,0,0.95)"/>
                    <ellipse cx="24" cy="52" rx="12" ry="7" fill={c(0.2)}/>
                    {['rgba(255,80,80,1)','rgba(255,200,0,1)','rgba(60,200,60,1)','rgba(80,120,255,1)','rgba(200,80,200,1)'].map((col,i)=>(
                      <circle key={i} cx={16+i*6} cy={52} r="2.5" fill={col} opacity="0.9"/>
                    ))}
                    <path className="it-draw" d="M15,39 Q28,30 44,35 Q56,40 58,32" fill="none" stroke="rgba(234,88,12,0.9)" strokeWidth="3" strokeDasharray="62" strokeLinecap="round"/>
                  </>),
                  // ── MUSIC — dark concert hall ────────────────────────────────
                  'Music': (<>
                    {/* Spotlight */}
                    <circle cx="40" cy="3" r="6" fill="rgba(255,200,100,0.6)" className="it-pulse"/>
                    <polygon points="34,3 46,3 52,40 28,40" fill="rgba(255,200,100,0.06)"/>
                    {/* Music staff lines */}
                    {[20,26,32,38,44].map((y,i)=><line key={i} x1="8" y1={y} x2="72" y2={y} stroke="rgba(150,100,200,0.5)" strokeWidth="0.9"/>)}
                    {/* Treble clef */}
                    <text x="8" y="45" fontSize="30" fill="rgba(180,120,255,0.7)" fontFamily="serif">𝄞</text>
                    {/* Notes on staff */}
                    <ellipse cx="46" cy="38" rx="5.5" ry="3.5" fill="rgba(200,150,255,0.85)"/>
                    <line x1="51.5" y1="38" x2="51.5" y2="16" stroke="rgba(200,150,255,0.85)" strokeWidth="1.5"/>
                    <line x1="51.5" y1="16" x2="63"   y2="20" stroke="rgba(200,150,255,0.7)" strokeWidth="1.5"/>
                    <ellipse cx="56" cy="26" rx="5.5" ry="3.5" fill="rgba(180,130,255,0.8)"/>
                    <line x1="61.5" y1="26" x2="61.5" y2="5" stroke="rgba(180,130,255,0.8)" strokeWidth="1.5"/>
                    {/* Floating notes */}
                    {[0,1,2,3].map(i=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.45}s`,transformOrigin:`${16+i*14}px 52px`}}>
                        <text x={10+i*14} y="54" fontSize="15" fill="rgba(200,160,255,0.9)">♪</text>
                      </g>
                    ))}
                  </>),
                  // ── COOKING — warm kitchen night ─────────────────────────────
                  'Cooking': (<>
                    {/* Stove top */}
                    <rect x="8" y="42" width="64" height="5" rx="2" fill="rgba(60,40,20,0.7)"/>
                    {/* Burner rings */}
                    {[24,56].map((x,i)=>(
                      <g key={i}>
                        <circle cx={x} cy={44} r="7" fill="none" stroke="rgba(200,100,30,0.5)" strokeWidth="1.5"/>
                        <circle cx={x} cy={44} r="4" fill="rgba(255,100,20,0.3)" className="it-star" style={{animationDelay:`${i*0.4}s`}}/>
                      </g>
                    ))}
                    {/* Large pot bubbling */}
                    <ellipse cx="40" cy="41" rx="20" ry="9" fill="rgba(80,50,20,0.8)"/>
                    <rect x="20" y="28" width="40" height="15" rx="4" fill="rgba(90,55,20,0.85)"/>
                    <rect x="56" y="30" width="16" height="4" rx="2" fill="rgba(80,50,20,0.7)" transform="rotate(10,56,30)"/>
                    {/* Bubbling soup */}
                    <ellipse cx="40" cy="28" rx="17" ry="6" fill="rgba(200,120,40,0.5)"/>
                    {[28,36,44,52].map((x,i)=>(
                      <circle key={i} cx={x} cy={26-i%2*3} r="2.5" fill="rgba(220,140,50,0.6)" className="it-up" style={{animationDelay:`${i*0.25}s`}}/>
                    ))}
                    {/* Ladle */}
                    <line x1="40" y1="8" x2="40" y2="26" stroke="rgba(180,120,60,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="40" cy="26" r="4.5" fill="none" stroke="rgba(180,120,60,0.8)" strokeWidth="2"/>
                    {/* Steam */}
                    {[0,1,2].map(i=>(
                      <path key={i} className="it-up" d={`M${28+i*10},20 Q${26+i*10},12 ${30+i*10},6`} fill="none" stroke="rgba(255,220,180,0.4)" strokeWidth="2" strokeLinecap="round" style={{animationDelay:`${i*0.35}s`}}/>
                    ))}
                  </>),
                  // ── DOLLS — enchanted toy room at night ─────────────────────
                  'Dolls': (<>
                    {/* Stars */}
                    <S cx={6}  cy={4}  r={1.0} d="0s"/><S cx={18} cy={2}  r={0.8} d="0.4s"/>
                    <S cx={70} cy={4}  r={1.2} d="0.7s"/><S cx={76} cy={14} r={0.9} d="0.5s"/>
                    {/* Window with moonlight */}
                    <rect x="52" y="4" width="20" height="18" rx="2" fill="rgba(150,180,255,0.15)" stroke="rgba(200,220,255,0.3)" strokeWidth="1"/>
                    <line x1="62" y1="4" x2="62" y2="22" stroke="rgba(200,220,255,0.3)" strokeWidth="0.8"/>
                    <line x1="52" y1="13" x2="72" y2="13" stroke="rgba(200,220,255,0.3)" strokeWidth="0.8"/>
                    <circle cx="62" cy="13" r="5" fill="rgba(200,220,255,0.12)"/>
                    {/* Shelf */}
                    <rect x="0" y="38" width="80" height="3" rx="1" fill="rgba(180,130,80,0.5)"/>
                    {/* Main doll figure */}
                    <g className="it-bob" style={{transformOrigin:'30px 22px'}}>
                      {/* Hair/head */}
                      <circle cx="30" cy="10" r="8" fill="rgba(220,150,200,0.4)"/>
                      <circle cx="30" cy="11" r="6.5" fill="rgba(255,200,180,0.97)"/>
                      {/* Hair */}
                      <path d="M24,9 Q27,3 30,5 Q33,3 36,9" fill="rgba(200,100,150,0.85)"/>
                      {/* Eyes */}
                      <circle cx="27.5" cy="11" r="1.8" fill="rgba(80,40,100,0.9)"/>
                      <circle cx="32.5" cy="11" r="1.8" fill="rgba(80,40,100,0.9)"/>
                      <circle cx="27.8" cy="10.5" r="0.8" fill="rgba(255,255,255,0.9)"/>
                      <circle cx="32.8" cy="10.5" r="0.8" fill="rgba(255,255,255,0.9)"/>
                      {/* Smile */}
                      <path d="M27,14 Q30,17 33,14" fill="none" stroke="rgba(200,100,120,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Dress */}
                      <polygon points="24,17 36,17 40,35 20,35" fill="rgba(255,120,180,0.8)"/>
                      {/* Dress detail */}
                      <line x1="30" y1="17" x2="30" y2="35" stroke="rgba(255,200,230,0.5)" strokeWidth="1"/>
                      {/* Arms */}
                      <line x1="24" y1="20" x2="15" y2="26" stroke="rgba(255,200,180,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="36" y1="20" x2="45" y2="26" stroke="rgba(255,200,180,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
                    </g>
                    {/* Flowers blooming around doll */}
                    {[{x:12,y:30},{x:50,y:28},{x:8,y:46},{x:68,y:44}].map(({x,y},i)=>(
                      <g key={i} className="it-bloom" style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${i*0.25}s`}}>
                        {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*4} cy={y+Math.sin(j*72*Math.PI/180)*4} rx="3" ry="1.5" fill={['rgba(255,120,180,0.8)','rgba(255,200,50,0.8)','rgba(200,100,255,0.8)','rgba(100,200,255,0.8)','rgba(255,150,80,0.8)'][j]} transform={`rotate(${j*72},${x},${y})`}/>)}
                        <circle cx={x} cy={y} r="2" fill="rgba(255,230,100,0.9)"/>
                      </g>
                    ))}
                  </>),
                  // ── CARS & TRUCKS — night highway ────────────────────────────
                  'Cars & Trucks': (<>
                    {/* Night sky with stars */}
                    <S cx={12} cy={5}  r={1.2} d="0s"/><S cx={30} cy={3}  r={0.9} d="0.3s"/>
                    <S cx={52} cy={6}  r={1.4} d="0.6s"/><S cx={68} cy={4}  r={1.0} d="0.9s"/>
                    {/* Road surface */}
                    <rect x="0" y="36" width="80" height="24" fill="rgba(40,40,50,0.95)"/>
                    {/* Road edge lines */}
                    <line x1="0" y1="36" x2="80" y2="36" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                    <line x1="0" y1="59" x2="80" y2="59" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                    {/* Lane dashes */}
                    {[0,1,2,3].map(i=><rect key={i} x={i*22+2} y={46} width={14} height={2} rx="1" fill="rgba(255,220,0,0.8)"/>)}
                    {/* Car zooming — with glowing headlights */}
                    <g className="it-car">
                      {/* Car body */}
                      <rect x="-5" y="38" width="34" height="12" rx="3" fill="rgba(220,50,50,0.95)"/>
                      {/* Roof/cabin */}
                      <rect x="2"  y="31" width="22" height="9"  rx="2" fill="rgba(180,30,30,0.95)"/>
                      {/* Windows */}
                      <rect x="4"  y="33" width="8"  height="5"  rx="1" fill="rgba(150,210,255,0.7)"/>
                      <rect x="14" y="33" width="8"  height="5"  rx="1" fill="rgba(150,210,255,0.7)"/>
                      {/* Wheels */}
                      <circle cx="2"  cy="51" r="5" fill="rgba(20,20,20,0.95)"/>
                      <circle cx="2"  cy="51" r="2.5" fill="rgba(100,100,100,0.8)"/>
                      <circle cx="22" cy="51" r="5" fill="rgba(20,20,20,0.95)"/>
                      <circle cx="22" cy="51" r="2.5" fill="rgba(100,100,100,0.8)"/>
                      {/* Headlights — bright yellow cones */}
                      <rect x="27" y="40" width="6" height="4" rx="1" fill="rgba(255,230,50,0.97)"/>
                      {/* Headlight beam */}
                      <polygon points="29,42 80,36 80,48" fill="rgba(255,230,50,0.06)"/>
                    </g>
                    {/* Speed lines */}
                    {[0,1,2,3].map(i=><line key={i} x1={62-i*8} y1={40+i*4} x2={80} y2={40+i*4} stroke="rgba(255,220,50,0.2)" strokeWidth="1" className="it-flash" style={{animationDelay:`${i*0.1}s`}}/>)}
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
                        : darkBg || 'white',
                      boxShadow: active
                        ? `0 8px 24px ${option.sh}, 0 2px 4px rgba(0,0,0,0.08)`
                        : darkBg
                          ? '0 4px 20px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(255,255,255,0.08)'
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
                    <span style={{ position: 'relative', zIndex: 1, fontSize: '0.75rem', fontWeight: '800', lineHeight: 1.2, textAlign: 'center', color: (active || !!darkBg) ? 'rgba(255,255,255,1)' : '#1A1209', letterSpacing: '0.03em', textShadow: (active || !!darkBg) ? '0 1px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(255,255,255,0.9)' }}>
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
