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
                const DARK_BG: Record<string,string> = { 'Space':'#0C0A2E', 'Superheroes':'#0B1120', 'Pirates':'#071422', 'Fantasy':'#1A0A3E', 'Aliens':'#030A0F', 'Gaming':'#0D0A1E' };
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
                  // ── FANTASY — twilight castle with magic orb ─────────────────
                  'Fantasy': (<>
                    {/* Stars in the sky */}
                    <S cx={8}  cy={5}  r={1.2} d="0s"/><S cx={22} cy={3}  r={0.9} d="0.3s"/><S cx={52} cy={6}  r={1.4} d="0.6s"/>
                    <S cx={65} cy={3}  r={1.0} d="0.9s"/><S cx={74} cy={12} r={1.3} d="0.4s"/><S cx={5}  cy={22} r={0.8} d="0.7s"/>
                    {/* Moon — soft glow in corner */}
                    <circle cx="72" cy="10" r="7"  fill="rgba(220,200,255,0.3)"/>
                    <circle cx="72" cy="10" r="5"  fill="rgba(230,215,255,0.5)"/>
                    <circle cx="72" cy="10" r="3"  fill="rgba(240,230,255,0.7)" className="it-pulse"/>
                    {/* Castle — solid and detailed */}
                    <rect x="12" y="34" width="11" height="26" fill="rgba(160,120,220,0.7)"/>
                    <rect x="57" y="34" width="11" height="26" fill="rgba(160,120,220,0.7)"/>
                    <rect x="26" y="24" width="28" height="36" fill="rgba(140,100,200,0.8)"/>
                    {/* Battlements */}
                    {[13,16,19,27,30,33,36,39,42,45,48,58,61,64].map((x,i)=>(
                      <rect key={i} x={x} y={i<3?30:i<12?20:30} width="2.5" height="5" fill="rgba(180,140,240,0.8)" rx="0.5"/>
                    ))}
                    {/* Tower roofs */}
                    <polygon points="17.5,30 12,22 23,22" fill="rgba(200,150,255,0.85)"/>
                    <polygon points="62.5,30 57,22 68,22" fill="rgba(200,150,255,0.85)"/>
                    <polygon points="40,24 26,14 54,14" fill="rgba(180,130,255,0.9)"/>
                    {/* Door arch */}
                    <rect x="35" y="46" width="10" height="14" rx="5" fill="rgba(0,0,0,0.4)"/>
                    {/* Castle windows glowing */}
                    {[[18,36],[62,36],[30,30],[40,30],[50,30]].map(([x,y],i)=>(
                      <rect key={i} x={x-1.5} y={y} width="3" height="4" rx="1.5" fill="rgba(255,220,80,0.9)" className="it-star" style={{animationDelay:`${i*0.2}s`}}/>
                    ))}
                    {/* Magical orb — floating above castle */}
                    <circle cx="40" cy="9" r="9"  fill="rgba(160,80,255,0.15)"/>
                    <circle cx="40" cy="9" r="6"  fill="rgba(180,100,255,0.3)"/>
                    <circle cx="40" cy="9" r="3.5" fill="rgba(210,150,255,0.9)" className="it-pulse"/>
                    {/* Orbiting sparkles */}
                    {[0,1,2,3,4].map(i=>(
                      <circle key={i} r="2" fill="rgba(220,180,255,0.95)" className="it-orbit" style={{transformOrigin:'40px 9px',animationDelay:`${i*0.22}s`}}/>
                    ))}
                  </>),
                  // ── FAIRIES — enchanted garden ──────────────────────────────
                  'Fairies': (<>
                    {[[8,55],[22,52],[40,56],[58,52],[72,55]].map(([x,y],i)=>(
                      <g key={i}>
                        <line x1={x} y1={y} x2={x} y2={60} stroke={c(0.35)} strokeWidth="1.5"/>
                        {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*3.5} cy={y+Math.sin(j*72*Math.PI/180)*3.5} rx="2.2" ry="1.4" fill={c(0.5)} transform={`rotate(${j*72},${x},${y})`}/>)}
                        <circle cx={x} cy={y} r="1.8" fill={c(0.8)}/>
                      </g>
                    ))}
                    <ellipse cx="40" cy="26" rx="3.5" ry="6" fill={c(0.7)}/>
                    <circle  cx="40" cy="18" r="4.5" fill={c(0.6)}/>
                    <ellipse cx="32" cy="24" rx="9" ry="5" fill={c(0.22)} transform="rotate(-22,32,24)"/>
                    <ellipse cx="48" cy="24" rx="9" ry="5" fill={c(0.22)} transform="rotate(22,48,24)"/>
                    {[0,1,2,3,4].map(i=><circle key={i} cx={48+i*5} cy={28-i*2} r="1.5" fill={c(0.9)} className="it-star" style={{animationDelay:`${i*0.2}s`}}/>)}
                    <g className="it-up" style={{transformOrigin:'40px 14px'}}>
                      <circle cx="40" cy="8" r="2" fill={c(0.9)}/>
                    </g>
                  </>),
                  // ── UNICORNS — rainbow meadow ───────────────────────────────
                  'Unicorns': (<>
                    {[['#F87171',55],['#FB923C',50],['#FCD34D',45],['#86EFAC',40],['#67E8F9',35],['#A78BFA',30]].map(([col,y],i)=>(
                      <path key={i} d={`M5,${y} Q20,${(y as number)-8} 40,${y} Q60,${(y as number)+8} 75,${y}`} fill="none" stroke={col as string} strokeWidth="3" opacity="0.55"/>
                    ))}
                    <ellipse cx="40" cy="20" rx="12" ry="8" fill={c(0.2)}/>
                    <polygon points="40,4 38,18 42,18" fill="rgba(255,200,50,0.9)"/>
                    <circle cx="40" cy="20" r="2" fill={c(0.5)}/>
                    {[{x:20,y:14},{x:58,y:12},{x:15,y:30},{x:65,y:28}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="1.8" fill={c(0.9)} className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <g className="it-bloom" style={{transformOrigin:'40px 15px'}}>
                      {[0,1,2,3,4,5].map(i=><line key={i} x1="40" y1="15" x2={40+14*Math.cos(i*60*Math.PI/180)} y2={15+14*Math.sin(i*60*Math.PI/180)} stroke={c(0.7)} strokeWidth="1.5"/>)}
                    </g>
                  </>),
                  // ── PRINCESSES — royal palace ───────────────────────────────
                  'Princesses': (<>
                    {[[20,50],[35,44],[45,44],[60,50]].map(([x,y],i)=>(
                      <g key={i}><rect x={x-4} y={y-14} width={8} height={14+10} fill={c(0.2)} rx="1"/><polygon points={`${x},${y-14} ${x-4},${y-6} ${x+4},${y-6}`} fill={c(0.3)}/></g>
                    ))}
                    <rect x="16" y="44" width="48" height="16" fill={c(0.15)}/>
                    <polygon points="40,6 35,22 29,18 33,28 27,26 35,34 45,34 53,26 47,28 47,18 45,22" fill={c(0.65)}/>
                    {[[32,16,`rgba(255,200,0,0.95)`],[40,11,`rgba(255,220,60,1)`],[48,16,`rgba(255,180,80,0.95)`],[36,21,`rgba(255,100,100,0.85)`],[44,21,`rgba(200,100,255,0.85)`]].map(([x,y,col],i)=>(
                      <circle key={i} cx={x as number} cy={y as number} r="3" fill={col as string} className="it-star" style={{animationDelay:`${i*0.18}s`}}/>
                    ))}
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
                  // ── MAGIC — wand waves with sparkles ────────────────────────
                  'Magic': (<>
                    {/* Background sparkles — fixed positions, opacity blink only */}
                    {[{x:8,y:7},{x:68,y:5},{x:74,y:22},{x:12,y:38},{x:72,y:45},{x:5,y:52},{x:38,y:56}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r={i%2===0?1.8:1.2} fill={c(0.85)} className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    {/* Entire wand pivots from handle — always waving */}
                    <g className="it-wand-swing" style={{transformOrigin:'34px 52px'}}>
                      {/* Handle */}
                      <rect x="29" y="48" width="10" height="13" rx="4" fill="rgba(90,50,15,0.97)"/>
                      <rect x="27" y="44" width="14" height="6"  rx="3" fill="rgba(130,80,20,0.97)"/>
                      {/* Wand stick */}
                      <line x1="34" y1="44" x2="56" y2="10" stroke="rgba(210,175,95,0.95)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Tip glow halo */}
                      <circle cx="56" cy="9" r="8" fill={c(0.18)}/>
                      <circle cx="56" cy="9" r="5" fill={c(0.4)}/>
                      {/* Bright star tip */}
                      <circle cx="56" cy="9" r="3" fill={c(0.95)} className="it-pulse"/>
                      {/* Star rays */}
                      {[0,1,2,3,4,5,6,7].map(i=>(
                        <line key={i} x1="56" y1="9" x2={56+8*Math.cos(i*45*Math.PI/180)} y2={9+8*Math.sin(i*45*Math.PI/180)} stroke={c(0.7)} strokeWidth="1.2" strokeLinecap="round"/>
                      ))}
                      {/* Orbiting sparkles around the star tip */}
                      {[0,1,2,3,4,5].map(i=>(
                        <circle key={i} r="2.2" fill={c(0.9)} className="it-orbit" style={{transformOrigin:'56px 9px',animationDelay:`${i*0.2}s`}}/>
                      ))}
                      {/* Sparkle trail along the wand stick */}
                      {[{x:51,y:17},{x:47,y:24},{x:42,y:31},{x:38,y:38}].map(({x,y},i)=>(
                        <circle key={i} cx={x} cy={y} r={2.2-i*0.4} fill={c(0.55-i*0.08)} className="it-star" style={{animationDelay:`${i*0.2}s`}}/>
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
                  // ── DINOSAURS — prehistoric jungle ──────────────────────────
                  'Dinosaurs': (<>
                    {[[4,38],[4,48],[74,40],[74,52]].map(([x,y],i)=>(
                      <g key={i}><line x1={x+4} y1={60} x2={x+4} y2={y} stroke={c(0.35)} strokeWidth="2"/>
                      {[-8,0,8].map((dx,j)=><ellipse key={j} cx={x+4+dx} cy={y-j*4} rx="7" ry="4" fill={c(0.2)} transform={`rotate(${dx*3},${x+4+dx},${y-j*4})`}/>)}</g>
                    ))}
                    <rect x="0" y="52" width="80" height="8" fill={c(0.1)}/>
                    {[15,30,45,62].map((x,i)=>(
                      <g key={i}><ellipse cx={x} cy={54} rx="5" ry="3" fill={c(0.2)}/><ellipse cx={x+8} cy={56} rx="4" ry="2.5" fill={c(0.15)}/></g>
                    ))}
                    <g className="it-walk" style={{transformOrigin:'12px 36px'}}>
                      <ellipse cx="12" cy="36" rx="9" ry="7" fill={c(0.75)}/>
                      <ellipse cx="19" cy="32" rx="6" ry="5" fill={c(0.65)}/>
                      <polygon points="25,30 32,25 28,33" fill={c(0.55)}/>
                      <circle cx="21" cy="31" r="2" fill={active?`rgba(${r1},${g1},${b1},1)`:c(0.5)}/>
                      <line x1="7"  y1="42" x2="5"  y2="50" stroke={c(0.65)} strokeWidth="2"/>
                      <line x1="16" y1="42" x2="14" y2="50" stroke={c(0.65)} strokeWidth="2"/>
                    </g>
                  </>),
                  // ── ANIMALS — wildlife ──────────────────────────────────────
                  'Animals': (<>
                    <rect x="0" y="50" width="80" height="10" fill={c(0.12)}/>
                    {[8,24,40,56,72].map((x,i)=><line key={i} x1={x} y1={50} x2={x-2+i} y2={42} stroke={c(0.25)} strokeWidth="1.5"/>)}
                    <circle cx="40" cy="24" r="15" fill={c(0.3)}/>
                    <circle cx="30" cy="14" r="8"  fill={c(0.35)}/>
                    <circle cx="50" cy="14" r="8"  fill={c(0.35)}/>
                    <circle cx="40" cy="24" r="10" fill={c(0.5)}/>
                    <circle cx="36" cy="21" r="3.5" fill={c(0.75)}/>
                    <circle cx="44" cy="21" r="3.5" fill={c(0.75)}/>
                    <circle cx="36.5" cy="20" r="1.5" fill={active?`rgba(${r1},${g1},${b1},1)`:c(0.55)}/>
                    <circle cx="44.5" cy="20" r="1.5" fill={active?`rgba(${r1},${g1},${b1},1)`:c(0.55)}/>
                    <ellipse cx="40" cy="26" rx="4" ry="3" fill={c(0.4)}/>
                    <path d="M36,28 Q40,32 44,28" fill="none" stroke={c(0.6)} strokeWidth="1.5" strokeLinecap="round"/>
                    <g className="it-swim" style={{transformOrigin:'15px 38px'}}>
                      <line x1="15" y1="30" x2="22" y2="38" stroke={c(0.55)} strokeWidth="2" strokeLinecap="round"/>
                      <ellipse cx="15" cy="29" rx="3" ry="2" fill={c(0.4)}/>
                    </g>
                  </>),
                  // ── OCEAN — underwater world ────────────────────────────────
                  'Ocean': (<>
                    {[[6,56],[18,52],[62,54],[74,50]].map(([x,y],i)=>(
                      <g key={i}><line x1={x+3} y1={60} x2={x+3} y2={y} stroke={c(0.3)} strokeWidth="2"/>
                      <path d={`M${x},${y} Q${x+3},${y-7} ${x+6},${y} Q${x+3},${y-4} ${x},${y}`} fill={c(0.35)}/></g>
                    ))}
                    <path d="M0,38 Q10,32 20,38 Q30,44 40,38 Q50,32 60,38 Q70,44 80,38" fill={c(0.25)} className="it-wave-y"/>
                    <path d="M0,46 Q10,40 20,46 Q30,52 40,46 Q50,40 60,46 Q70,52 80,46" fill={c(0.35)} className="it-wave-y" style={{animationDelay:'0.4s'}}/>
                    {[14,30,48,65].map((cx,i)=>(
                      <circle key={i} cx={cx} cy={20+i*4} r={2+i%2} fill={c(0.3)} className="it-up" style={{animationDelay:`${i*0.45}s`}}/>
                    ))}
                    <g className="it-swim">
                      <ellipse cx="0" cy="28" rx="11" ry="6" fill="rgba(255,140,0,0.9)"/>
                      <polygon points="11,28 19,22 19,34" fill="rgba(255,100,0,0.8)"/>
                      <circle cx="-3" cy="27" r="2" fill="rgba(0,0,0,0.65)"/>
                      <circle cx="-3.5" cy="26.5" r="0.8" fill="rgba(255,255,255,0.8)"/>
                      <line x1="2" y1="22" x2="2" y2="34" stroke="rgba(220,80,0,0.4)" strokeWidth="1.5"/>
                      <line x1="6" y1="22" x2="6" y2="34" stroke="rgba(220,80,0,0.4)" strokeWidth="1.5"/>
                    </g>
                  </>),
                  // ── NATURE — garden ─────────────────────────────────────────
                  'Nature': (<>
                    <rect x="38" y="28" width="4" height="32" fill={c(0.5)}/>
                    <circle cx="40" cy="18" r="16" fill={c(0.3)}/>
                    <circle cx="40" cy="16" r="11" fill={c(0.5)}/>
                    {[{cx:32,cy:52},{cx:40,cy:55},{cx:48,cy:52},{cx:25,cy:50},{cx:55,cy:50}].map(({cx,cy},i)=>(
                      <g key={i}><line x1={cx} y1={cy} x2={cx} y2={59} stroke={c(0.35)} strokeWidth="1.5"/>
                      {[0,1,2,3,4].map(j=><ellipse key={j} cx={cx+Math.cos(j*72*Math.PI/180)*3} cy={cy+Math.sin(j*72*Math.PI/180)*3} rx="2" ry="1.2" fill={c(0.5)} transform={`rotate(${j*72},${cx},${cy})`}/>)}
                      <circle cx={cx} cy={cy} r="1.5" fill={c(0.7)}/></g>
                    ))}
                    {[[-14,8],[12,-14],[18,4],[-6,14]].map(([dx,dy],i)=>(
                      <g key={i} className="it-leaf" style={{transformOrigin:`${40+dx}px ${16+dy}px`,animationDelay:`${i*0.55}s`}}>
                        <ellipse cx={40+dx} cy={16+dy} rx="6" ry="3" fill={c(0.7)} transform={`rotate(${i*45},${40+dx},${16+dy})`}/>
                      </g>
                    ))}
                  </>),
                  // ── ROBOTS — robot workshop ──────────────────────────────────
                  'Robots': (<>
                    {[[5,25],[5,35],[75,25],[75,35]].map(([x,y],i)=>(
                      <line key={i} x1={x} y1={y} x2={i<2?25:55} y2={y} stroke={c(0.2)} strokeWidth="1" strokeDasharray="2,2"/>
                    ))}
                    <rect x="26" y="20" width="28" height="26" rx="4" fill={c(0.28)}/>
                    <rect x="30" y="10" width="20" height="12" rx="2" fill={c(0.32)}/>
                    <line x1="40" y1="8" x2="40" y2="10" stroke={c(0.5)} strokeWidth="1.5"/>
                    <circle cx="40" cy="7" r="2" fill={c(0.6)}/>
                    <circle cx="34" cy="28" r="4.5" fill={c(0.2)}/>
                    <circle cx="34" cy="28" r="3" fill={c(0.7)} className="it-star" style={{animationDelay:'0s'}}/>
                    <circle cx="46" cy="28" r="4.5" fill={c(0.2)}/>
                    <circle cx="46" cy="28" r="3" fill={c(0.7)} className="it-star" style={{animationDelay:'0.6s'}}/>
                    <rect x="33" y="36" width="14" height="4" rx="2" fill={c(0.4)}/>
                    <rect x="26" y="46" width="6" height="14" rx="2" fill={c(0.25)}/>
                    <rect x="48" y="46" width="6" height="14" rx="2" fill={c(0.25)}/>
                    <g className="it-spin-f" style={{transformOrigin:'68px 22px'}}>
                      <circle cx="68" cy="22" r="9" fill="none" stroke={c(0.35)} strokeWidth="1.5"/>
                      <circle cx="68" cy="22" r="3" fill={c(0.4)}/>
                      {[0,1,2,3,4,5].map(i=><line key={i} x1="68" y1="22" x2={68+9*Math.cos(i*60*Math.PI/180)} y2={22+9*Math.sin(i*60*Math.PI/180)} stroke={c(0.35)} strokeWidth="1.2"/>)}
                    </g>
                  </>),
                  // ── SCIENCE — laboratory ────────────────────────────────────
                  'Science': (<>
                    <path d="M32,14 L27,44 Q27,53 40,53 Q53,53 53,44 L48,14 Z" fill={c(0.18)} stroke={c(0.45)} strokeWidth="1.5"/>
                    <rect x="30" y="12" width="20" height="4" rx="2" fill={c(0.35)}/>
                    <ellipse cx="40" cy="46" rx="10" ry="5" fill={c(0.3)}/>
                    <rect x="27" y="30" width="26" height="14" rx="0" fill={c(0.12)}/>
                    {[0,1,2,3].map(i=>(
                      <circle key={i} cx={32+i*5} cy={38-i*3} r="2.5" fill={c(0.65)} className="it-up" style={{animationDelay:`${i*0.38}s`}}/>
                    ))}
                    <g className="it-flash" style={{transformOrigin:'68px 28px'}}>
                      <polygon points="68,10 64,24 69,24 64,42 74,22 69,22 73,10" fill={active?'rgba(255,220,0,0.95)':c(0.8)}/>
                    </g>
                    <line x1="10" y1="18" x2="20" y2="18" stroke={c(0.3)} strokeWidth="1"/><line x1="10" y1="24" x2="20" y2="24" stroke={c(0.2)} strokeWidth="1"/>
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
                  // ── SOCCER — match ──────────────────────────────────────────
                  'Soccer': (<>
                    <rect x="0" y="0" width="80" height="60" fill={c(0.05)}/>
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={0} width={8} height={60} fill={c(i%2===0?0.08:0.04)}/>)}
                    <line x1="40" y1="0" x2="40" y2="60" stroke={c(0.25)} strokeWidth="1"/>
                    <circle cx="40" cy="30" r="20" fill="none" stroke={c(0.2)} strokeWidth="1"/>
                    <line x1="0" y1="20" x2="0" y2="40" stroke={c(0.5)} strokeWidth="2.5"/>
                    <line x1="0" y1="20" x2="12" y2="20" stroke={c(0.5)} strokeWidth="2.5"/>
                    <line x1="0" y1="40" x2="12" y2="40" stroke={c(0.5)} strokeWidth="2.5"/>
                    <g className="it-bounce" style={{transformOrigin:'40px 30px'}}>
                      <circle cx="40" cy="30" r="9" fill={c(0.8)}/>
                      {[0,1,2,3,4].map(i=><line key={i} x1="40" y1="30" x2={40+9*Math.cos(i*72*Math.PI/180)} y2={30+9*Math.sin(i*72*Math.PI/180)} stroke={c(0.3)} strokeWidth="1.2"/>)}
                    </g>
                  </>),
                  // ── FOOTBALL — field ────────────────────────────────────────
                  'Football': (<>
                    {[10,20,30,40,50,60,70].map((x,i)=><line key={i} x1={x} y1={5} x2={x} y2={55} stroke={c(0.1)} strokeWidth="1"/>)}
                    <line x1="5"  y1="30" x2="75" y2="30" stroke={c(0.2)} strokeWidth="1"/>
                    <line x1="5" y1="8"  x2="5" y2="52" stroke={c(0.55)} strokeWidth="2.5"/>
                    <line x1="5" y1="8"  x2="18" y2="8"  stroke={c(0.55)} strokeWidth="2.5"/>
                    <line x1="5" y1="52" x2="18" y2="52" stroke={c(0.55)} strokeWidth="2.5"/>
                    <g className="it-bounce" style={{transformOrigin:'50px 30px'}}>
                      <ellipse cx="50" cy="30" rx="11" ry="7" fill={c(0.75)} transform="rotate(-15,50,30)"/>
                      <line x1="42" y1="27" x2="58" y2="33" stroke={c(0.35)} strokeWidth="2" transform="rotate(-15,50,30)"/>
                      {[0,1,2].map(i=><line key={i} x1={45+i*5} y1="23" x2={43+i*5} y2="37" stroke={c(0.2)} strokeWidth="1" transform="rotate(-15,50,30)"/>)}
                    </g>
                  </>),
                  // ── GYMNASTICS — performance ────────────────────────────────
                  'Gymnastics': (<>
                    <rect x="10" y="50" width="60" height="4" rx="2" fill={c(0.45)}/>
                    {[0,1,2,3,4,5,6].map(i=><rect key={i} x={12+i*9} y={50} width={5} height={4} fill={i%2===0?c(0.55):c(0.35)} rx="1"/>)}
                    <g className="it-spin-f" style={{transformOrigin:'40px 28px'}}>
                      <circle cx="40" cy="14" r="5.5" fill={c(0.75)}/>
                      <line x1="40" y1="19.5" x2="40" y2="35" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="28" y1="25" x2="52" y2="25" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="40" y1="35" x2="33" y2="48" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="40" y1="35" x2="47" y2="48" stroke={c(0.65)} strokeWidth="2.5"/>
                    </g>
                    {[{x:12,y:18},{x:68,y:18},{x:20,y:38},{x:60,y:38}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="2" fill={c(0.6)} className="it-star" style={{animationDelay:`${i*0.35}s`}}/>
                    ))}
                  </>),
                  // ── DANCING — dance floor ───────────────────────────────────
                  'Dancing': (<>
                    <ellipse cx="40" cy="54" rx="32" ry="6" fill={c(0.12)}/>
                    <circle cx="40" cy="30" r="26" fill="none" stroke={c(0.1)} strokeWidth="1" strokeDasharray="3,4"/>
                    <circle cx="40" cy="30" r="18" fill="none" stroke={c(0.08)} strokeWidth="1" strokeDasharray="3,4"/>
                    <g className="it-spin-f" style={{transformOrigin:'40px 29px'}}>
                      <circle cx="40" cy="14" r="5.5" fill={c(0.75)}/>
                      <line x1="40" y1="19.5" x2="40" y2="35" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="29" y1="25" x2="51" y2="25" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="40" y1="35" x2="32" y2="48" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="40" y1="35" x2="48" y2="44" stroke={c(0.65)} strokeWidth="2.5"/>
                    </g>
                    {[16,30,50,64].map((x,i)=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.35}s`,transformOrigin:`${x}px 44px`}}>
                        <text x={x-5} y="46" fontSize="13" fill={c(0.8)}>♪</text>
                      </g>
                    ))}
                  </>),
                  // ── KARATE — dojo ───────────────────────────────────────────
                  'Karate': (<>
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={50} width={14} height={10} fill={c(0.1+i*0.035)} rx="1"/>)}
                    <line x1="0" y1="50" x2="80" y2="50" stroke={c(0.4)} strokeWidth="2"/>
                    <g className="it-bob" style={{transformOrigin:'30px 28px'}}>
                      <circle cx="30" cy="12" r="5.5" fill={c(0.75)}/>
                      <line x1="30" y1="17.5" x2="30" y2="33" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="18" y1="23" x2="42" y2="21" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="30" y1="33" x2="22" y2="46" stroke={c(0.65)} strokeWidth="2.5"/>
                      <line x1="30" y1="33" x2="38" y2="43" stroke={c(0.65)} strokeWidth="2.5"/>
                    </g>
                    <g className="it-flash" style={{transformOrigin:'58px 28px'}}>
                      {[0,1,2,3,4].map(i=><line key={i} x1="58" y1="28" x2={66+i*3} y2={18+i*6} stroke={c(0.9)} strokeWidth="2"/>)}
                    </g>
                  </>),
                  // ── SWIMMING — pool ─────────────────────────────────────────
                  'Swimming': (<>
                    {[8,18,28,38,48,58,68].map((x,i)=><line key={i} x1={x} y1={5} x2={x} y2={55} stroke={c(0.1)} strokeWidth="1"/>)}
                    {[0,1,2,3].map(i=>(
                      <ellipse key={i} cx="40" cy="32" rx={10+i*9} ry={5+i*4} fill="none" stroke={c(0.18-i*0.03)} strokeWidth="1" className="it-pulse" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    <path d="M0,50 Q10,44 20,50 Q30,56 40,50 Q50,44 60,50 Q70,56 80,50" fill={c(0.25)} className="it-wave-y"/>
                    <g className="it-swim">
                      <circle cx="0" cy="22" r="5.5" fill={c(0.75)}/>
                      <line x1="0" y1="27.5" x2="0" y2="40" stroke={c(0.65)} strokeWidth="2"/>
                      <line x1="-11" y1="30" x2="11" y2="28" stroke={c(0.65)} strokeWidth="2"/>
                    </g>
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
                  // ── MUSIC — concert ─────────────────────────────────────────
                  'Music': (<>
                    {[15,25,35,45,55].map((y,i)=><line key={i} x1="5" y1={y} x2="65" y2={y} stroke={c(0.3)} strokeWidth="0.8"/>)}
                    <text x="4" y="40" fontSize="28" fill={c(0.5)} fontFamily="serif">𝄞</text>
                    <ellipse cx="46" cy="35" rx="5" ry="3.5" fill={c(0.7)}/><line x1="51" y1="35" x2="51" y2="15" stroke={c(0.7)} strokeWidth="1.5"/>
                    <ellipse cx="56" cy="25" rx="5" ry="3.5" fill={c(0.6)}/><line x1="61" y1="25" x2="61" y2="5" stroke={c(0.6)} strokeWidth="1.5"/>
                    {[0,1,2].map(i=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.5}s`,transformOrigin:`${20+i*16}px 50px`}}>
                        <text x={14+i*16} y="52" fontSize="14" fill={c(0.85)}>♪</text>
                      </g>
                    ))}
                  </>),
                  // ── COOKING — kitchen ───────────────────────────────────────
                  'Cooking': (<>
                    <rect x="10" y="44" width="60" height="4" rx="1" fill={c(0.35)}/>
                    {[22,44].map((x,i)=><ellipse key={i} cx={x} cy={46} rx="5" ry="2" fill={c(0.25)}/>)}
                    <ellipse cx="40" cy="40" rx="20" ry="12" fill={c(0.22)}/>
                    <rect x="20" y="28" width="40" height="14" rx="4" fill={c(0.32)}/>
                    <rect x="57" y="30" width="14" height="4" rx="2" fill={c(0.28)} transform="rotate(8,57,30)"/>
                    <rect x="38" y="10" width="4"  height="20" rx="2" fill={c(0.6)} strokeLinecap="round"/>
                    <ellipse cx="40" cy="28" rx="7" ry="3.5" fill="none" stroke={c(0.5)} strokeWidth="1.5"/>
                    {[0,1,2].map(i=>(
                      <path key={i} className="it-up" d={`M${32+i*8},24 Q${30+i*8},17 ${34+i*8},12`} fill="none" stroke={c(0.45)} strokeWidth="1.8" strokeLinecap="round" style={{animationDelay:`${i*0.35}s`}}/>
                    ))}
                  </>),
                  // ── DOLLS — toy room ────────────────────────────────────────
                  'Dolls': (<>
                    {[[8,55],[22,52],[40,56],[58,52],[72,55]].map(([x,y],i)=>(
                      <g key={i}>
                        <line x1={x} y1={y} x2={x} y2={60} stroke={c(0.3)} strokeWidth="1.5"/>
                        {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*3} cy={y+Math.sin(j*72*Math.PI/180)*3} rx="2" ry="1.2" fill={c(0.55)} transform={`rotate(${j*72},${x},${y})`}/>)}
                        <circle cx={x} cy={y} r="1.5" fill={c(0.75)}/>
                      </g>
                    ))}
                    <circle cx="40" cy="14" r="7" fill={c(0.55)}/>
                    <ellipse cx="40" cy="28" rx="9" ry="11" fill={c(0.45)}/>
                    <ellipse cx="40" cy="36" rx="14" ry="6" fill={c(0.35)}/>
                    {[{x:20,y:22},{x:60,y:18},{x:14,y:38},{x:66,y:40}].map(({x,y},i)=>(
                      <g key={i} className="it-bloom" style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${i*0.2}s`}}>
                        {[0,1,2,3,4].map(j=><ellipse key={j} cx={x+Math.cos(j*72*Math.PI/180)*4} cy={y+Math.sin(j*72*Math.PI/180)*4} rx="3" ry="1.5" fill={c(0.65)} transform={`rotate(${j*72},${x},${y})`}/>)}
                        <circle cx={x} cy={y} r="2" fill={c(0.85)}/>
                      </g>
                    ))}
                  </>),
                  // ── CARS & TRUCKS — road ────────────────────────────────────
                  'Cars & Trucks': (<>
                    <rect x="0" y="40" width="80" height="20" fill={c(0.12)}/>
                    <rect x="0" y="38" width="80" height="3"  fill={c(0.25)}/>
                    <rect x="0" y="57" width="80" height="3"  fill={c(0.25)}/>
                    {[0,1,2,3,4].map(i=><rect key={i} x={4+i*18} y={49} width={10} height={2} rx="1" fill={c(0.35)}/>)}
                    <g className="it-car">
                      <rect x="-5" y="40" width="32" height="11" rx="3" fill={c(0.9)}/>
                      <rect x="0"  y="33" width="22" height="9"  rx="2" fill={c(0.7)}/>
                      <circle cx="-1" cy="52" r="4.5" fill={c(0.5)}/>
                      <circle cx="21" cy="52" r="4.5" fill={c(0.5)}/>
                      <rect x="22" y="42" width="5" height="3" rx="1" fill="rgba(255,220,0,0.95)"/>
                    </g>
                    {[0,1,2,3].map(i=><line key={i} x1={60-i*5} y1={42+i} x2={80} y2={42+i} stroke={c(0.18)} strokeWidth="1" className="it-flash" style={{animationDelay:`${i*0.08}s`}}/>)}
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
                    <span style={{ position: 'relative', zIndex: 1, fontSize: '0.72rem', fontWeight: '700', lineHeight: 1.25, textAlign: 'center', color: (active || !!darkBg) ? 'rgba(255,255,255,0.95)' : '#1A1209', letterSpacing: '0.01em' }}>
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
