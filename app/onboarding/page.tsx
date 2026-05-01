'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createChild } from '@/lib/supabase/child-actions';
import type { FablePose } from '@/components/Fable';

const Fable = dynamic(() => import('@/components/Fable'), { ssr: false });

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

const INTEREST_OPTIONS = [
  { emoji: '🦸', label: 'Superheroes' },
  { emoji: '🧙', label: 'Fantasy' },
  { emoji: '🧚', label: 'Fairies' },
  { emoji: '🦄', label: 'Unicorns' },
  { emoji: '👑', label: 'Princesses' },
  { emoji: '🏴‍☠️', label: 'Pirates' },
  { emoji: '🪄', label: 'Magic' },
  { emoji: '👽', label: 'Aliens' },
  { emoji: '🦕', label: 'Dinosaurs' },
  { emoji: '🐾', label: 'Animals' },
  { emoji: '🌊', label: 'Ocean' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '🚀', label: 'Space' },
  { emoji: '🤖', label: 'Robots' },
  { emoji: '🔬', label: 'Science' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '⚽', label: 'Soccer' },
  { emoji: '🏈', label: 'Football' },
  { emoji: '🤸', label: 'Gymnastics' },
  { emoji: '💃', label: 'Dancing' },
  { emoji: '🥋', label: 'Karate' },
  { emoji: '🏊', label: 'Swimming' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🍳', label: 'Cooking' },
  { emoji: '🪆', label: 'Dolls' },
  { emoji: '🚗', label: 'Cars & Trucks' },
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {INTEREST_OPTIONS.map((option) => {
                const active = state.interests.includes(option.label);
                return (
                  <button key={option.label} onClick={() => handleInterestToggle(option.label)}
                    style={{ ...chip(active), padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    {option.label}
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
                  <p style={{ fontWeight: '600', color: '#1A1209', marginBottom: '14px', fontSize: '0.95rem' }}>
                    {emoji} {interest}
                  </p>
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
                  <p style={{ fontWeight: '600', color: '#1A1209', marginBottom: '14px', fontSize: '0.95rem' }}>⭐ Other interests</p>
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
