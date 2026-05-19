'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createChild } from '@/lib/supabase/child-actions';
import { createClient } from '@/lib/supabase/client';
import { TRIAL_INTERESTS } from '@/lib/sample-stories/index';

// Content filter — block inappropriate terms for a children's app
const BLOCKED_TERMS = [
  // Profanity
  'fuck', 'shit', 'bitch', 'bastard', 'piss', 'cock', 'cunt', 'whore', 'slut', 'twat', 'arse',
  // Sexual / anatomy slang
  'dick', 'penis', 'vagina', 'pussy', 'boob', 'tit', 'nude', 'naked', 'sex', 'porn', 'erotic',
  // Adult themes called out by team
  'gay', 'lesbian', 'trans', 'queer', 'lgbt', 'mardi gras', 'stripper', 'strip club',
  // Drugs / alcohol
  'weed', 'marijuana', 'cocaine', 'heroin', 'alcohol', 'drugs',
  // Violence / hate
  'murder', 'rape', 'nazi', 'racist', 'terrorist',
];

function isContentAppropriate(text: string): boolean {
  const lower = text.toLowerCase();
  return !BLOCKED_TERMS.some(term => {
    if (term.includes(' ')) return lower.includes(term);
    return new RegExp(`\b${term}\b`, 'i').test(lower);
  });
}

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
  skinColour: string;
  siblings: Person[];
  friends: Person[];
  petName: string;
  petType: string;
  pets: { name: string; type: string }[];
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

// 2 questions per interest  -  specific enough to give Claude vivid details
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
    { q: "What's your robot's name and what can it do?",          placeholder: 'e.g. RoboMax  -  makes pancakes and tells jokes' },
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
    { q: 'Do you prefer the pool or the ocean?',                  placeholder: 'e.g. The ocean  -  it feels like an adventure' },
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
    { q: 'If you had your own restaurant, what would it be called and serve?', placeholder: 'e.g. "Princess Kitchen"  -  only desserts' },
  ],
  'Dolls': [
    { q: "What are your favourite dolls' names?",                 placeholder: 'e.g. Bella, Princess Rose, Captain Tiny' },
    { q: 'What adventures do your dolls go on?',                  placeholder: 'e.g. They explore a magical toy kingdom' },
  ],
  'Cars & Trucks': [
    { q: "What's your dream car or truck?",                       placeholder: 'e.g. A red race car, a giant monster truck' },
    { q: 'Would you rather drive a race car, a monster truck, or a fire engine?', placeholder: 'e.g. Monster truck  -  so I can crush everything' },
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
    skinColour: '',
    siblings: [],
    friends: [],
    petName: '',
    petType: '',
    pets: [],
    city: '',
    country: '',
    readingLevel: 'medium',
  });

  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [nameError, setNameError] = useState('');
  const [interestError, setInterestError] = useState('');
  const [isFreeUser, setIsFreeUser] = useState(true); // assume free until confirmed

  // Check subscription status on mount
  useEffect(() => {
    const checkSub = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Admin accounts bypass subscription check — treat as premium
      const { data: adminData } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      if (adminData) { setIsFreeUser(false); return; }
      const { data } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      setIsFreeUser(!data || data.status !== 'subscribed');
    };
    checkSub();
  }, []);

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
      if (!isContentAppropriate(state.name)) { setNameError("This name is not appropriate for a children\'s app. Please choose a different name."); return; }
      setNameError('');
      setState({ ...state, step: 3 });
    } else if (state.step === 3) {
      // Free users skip follow-up questions (they get a cached sample); subscribers go through step 4
      setState({ ...state, step: isFreeUser ? 5 : 4 });
    } else if (state.step === 4) {
      // Validate all follow-up answers for appropriate content
      const badAnswer = Object.values(state.followUpAnswers).find(v => v.trim() && !isContentAppropriate(v));
      if (badAnswer) {
        alert("One of your answers contains content that isn\'t appropriate for a children\'s app. Please review your answers and try again.");
        return;
      }
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
          skinColour: state.skinColour,
          siblings: state.siblings,
          friends: state.friends,
          petName: state.pets[0]?.name || state.petName,
          petType: state.pets[0]?.type || state.petType,
          pets: state.pets,
          city: state.city,
          country: state.country,
          readingLevel: state.readingLevel || 'medium',
        });

        if (result.error || !result.child) {
          if (result.error === 'subscription_required') {
            setSubmitError('A subscription is required to add more than one child profile. Please subscribe from your dashboard.');
          } else {
            setSubmitError(result.error || 'Failed to save profile');
          }
          setSubmitting(false);
          return;
        }

        // Generate story, start page 1 image, then redirect to story viewer
        try {
          const storyRes = await fetch('/api/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ child_id: result.child.id }),
          });
          const storyData = await storyRes.json();
          const storyId = storyData?.story?.id;
          if (storyId) {
            // Fire page 1 image generation — story page handles the rest
            fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ story_id: storyId, page_number: 1 }),
            });
            router.push(`/stories/${storyId}`);
            return;
          }
        } catch { /* fall through to dashboard on error */ }
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
    // Free users can only pick trial interests
    if (isFreeUser && !TRIAL_INTERESTS.includes(label as typeof TRIAL_INTERESTS[number])) return;
    setState((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : (isFreeUser ? prev.interests.length >= 3 : prev.interests.length >= 5) ? prev.interests : [...prev.interests, label],
    }));
  };

  const handleAddCustomInterest = () => {
    const val = state.customInterest.trim();
    if (!val) return;
    if (!isContentAppropriate(val)) {
      setInterestError("This content is not appropriate for a children\'s app. Please choose a different interest.");
      return;
    }
    if (state.interests.length < (isFreeUser ? 3 : 5)) {
      setInterestError('');
      setState((prev) => ({
        ...prev,
        interests: [...prev.interests, val],
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
    border: '1.5px solid #F0E4D0', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none',
    backgroundColor: '#fff', color: '#0D183D',
  };

  const chipBase: React.CSSProperties = {
    cursor: 'pointer', borderRadius: '8px',
    fontWeight: '500', fontSize: '0.85rem', padding: '0.5rem 1rem', transition: 'all 0.15s',
    border: 'none',
  };

  const chip = (active: boolean): React.CSSProperties => ({
    ...chipBase,
    border: `1.5px solid ${active ? '#FF6B35' : '#F0E4D0'}`,
    backgroundColor: active ? '#FF6B35' : '#fff',
    color: active ? '#fff' : '#0D183D',
  });

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0D183D', fontSize: '0.9rem' };
  const optionalLabel: React.CSSProperties = { ...labelStyle, color: '#5E6A7A' };

  const TOTAL_STEPS = 4; // steps 2–5 = 4 visible dots
  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
      {[2, 3, 4, 5].map((s) => (
        <div key={s} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: state.step >= s ? '#FF6B35' : '#F0E4D0', transition: 'background-color 0.3s' }} />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF4E6', padding: '32px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>


        {/* ── Step 2: Name / Age / Gender ── */}
        {state.step === 2 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#0D183D' }}>Tell us about your child</h1>
            <p style={{ color: '#5E6A7A', marginBottom: '32px', fontSize: '0.95rem' }}>This is how they'll appear as the hero of every story</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Child's name <span style={{ color: '#FF6B35' }}>*</span></label>
              <input type="text" style={{ ...inputStyle, borderColor: nameError ? '#991B1B' : '#F0E4D0' }} placeholder="e.g. Leo" value={state.name}
                onChange={(e) => { setState({ ...state, name: e.target.value }); setNameError(''); }} />
              {nameError && <p style={{ color: '#991B1B', fontSize: '0.8rem', marginTop: '6px' }}>{nameError}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Age <span style={{ color: '#FF6B35' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setState({ ...state, age: Math.max(3, state.age - 1) })} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1.5px solid #F0E4D0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}>−</button>
                <span style={{ fontSize: '1.5rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{state.age}</span>
                <button onClick={() => setState({ ...state, age: Math.min(12, state.age + 1) })} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1.5px solid #F0E4D0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}>+</button>
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
              <Link href="/dashboard" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '500' }}>Back</Link>
            </div>
          </div>
        )}

        {/* ── Step 3: Interests ── */}
        {state.step === 3 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#0D183D' }}>What does {state.name || 'your child'} love?</h1>
            <p style={{ color: (isFreeUser ? state.interests.length >= 3 : state.interests.length >= 5) ? '#FF6B35' : '#5E6A7A', marginBottom: '32px', fontSize: '0.95rem' }}>
              {(isFreeUser ? state.interests.length >= 3 : state.interests.length >= 5) ? 'Maximum reached. Remove one to swap.' : `Pick 1 to ${isFreeUser ? 3 : 5} interests — these shape every story`}
            </p>

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
            {isFreeUser && (
              <div style={{ background: '#FFFBEB', border: '1px solid #D97706', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '12px', fontSize: '0.8125rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span><strong>Free trial:</strong> Choose from 8 sample interests. Subscribe to unlock all 27 themes and personalise your story fully.</span>
              </div>
            )}
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
                  'Magic':'#180A30', 'Gymnastics':'#1A0318', 'Dancing':'#180408',
                  'Karate':'#160A04', 'Art':'#160A04',
                };
                const darkBg = DARK_BG[option.label];
                const S = (props:{cx:number;cy:number;r:number;d:string}) => <circle cx={props.cx} cy={props.cy} r={props.r} fill="rgba(255,248,200,0.92)" className="it-star" style={{animationDelay:props.d}}/>;
                const scene: Record<string, React.ReactNode> = {
                  'Space': (<>
                    {/* Stars  -  opacity only (no scale/transform so they don't appear to move) */}
                    {[{x:6,y:5,r:1.8},{x:19,y:3,r:1.1},{x:33,y:8,r:2.3},{x:50,y:4,r:1.4},{x:63,y:7,r:1.9},{x:75,y:5,r:1.1},
                      {x:10,y:22,r:1.3},{x:72,y:20,r:1.7},{x:4,y:40,r:1.5},{x:66,y:42,r:1.2},{x:40,y:52,r:1.7},{x:14,y:53,r:1.1},{x:78,y:48,r:1.4},{x:55,y:30,r:1.0},{x:27,y:32,r:0.9}
                    ].map(({x,y,r},i)=>(
                      <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,250,220,0.95)" className="it-star" style={{animationDelay:`${i*0.19}s`}}/>
                    ))}
                    {/* Hero star  -  same pure opacity blink */}
                    <circle cx="34" cy="8" r="2.8" fill="rgba(255,255,200,1)" className="it-star" style={{animationDelay:'0.7s'}}/>
                    {/* Crescent moon  -  fixed position, no movement */}
                    <circle cx="62" cy="16" r="13" fill="rgba(255,235,140,0.97)"/>
                    <circle cx="68" cy="13" r="10.5" fill={active ? `rgba(${r1},${g1},${b1},1)` : '#0C0A2E'}/>
                    {/* Rocket  -  flies straight left-to-right on hover */}
                    <g className="it-rocket-h">
                      {/* Body - horizontal ellipse */}
                      <ellipse cx="0" cy="32" rx="14" ry="6" fill="#EF4444"/>
                      {/* Nose cone  -  points right */}
                      <polygon points="14,32 8,26 8,38" fill="#F97316"/>
                      {/* Porthole */}
                      <circle cx="-3" cy="32" r="4.5" fill="#BFDBFE"/>
                      <circle cx="-3" cy="32" r="3"   fill="#60A5FA"/>
                      <circle cx="-4.5" cy="30.5" r="1" fill="rgba(255,255,255,0.7)"/>
                      {/* Top fin */}
                      <polygon points="-10,26 -16,18 -8,26" fill="#B91C1C"/>
                      {/* Bottom fin */}
                      <polygon points="-10,38 -16,46 -8,38" fill="#B91C1C"/>
                      {/* Flame  -  at the back (left) */}
                      <ellipse cx="-16" cy="32" rx="8"   ry="4.5" fill="rgba(251,146,60,0.95)"/>
                      <ellipse cx="-18" cy="32" rx="5.5" ry="3"   fill="rgba(253,224,71,0.95)"/>
                    </g>
                  </>),
                  // ── SUPERHEROES  -  dark city, hero flies in & hovers ───────────
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
                    {/* Window lights  -  bright and visible */}
                    {[[10,34],[10,40],[19,40],[25,35],[25,41],[49,37],[49,43],[57,28],[57,34],[57,40],[69,36],[69,42]].map(([x,y],i)=>(
                      <rect key={i} x={x} y={y} width="2.5" height="2" fill="rgba(255,230,100,0.95)" className="it-star" style={{animationDelay:`${i*0.18}s`}}/>
                    ))}
                    {/* HERO  -  bigger, bolder, 2.4s cycle */}
                    <g className="it-hero" style={{transformOrigin:'40px 27px'}}>
                      {/* Cape  -  large, dramatic */}
                      <path d="M35,22 Q16,27 14,40 Q24,33 33,37 Q30,28 35,22" fill="#DC2626"/>
                      {/* Body */}
                      <ellipse cx="41" cy="29" rx="7.5" ry="9.5" fill="#1D4ED8"/>
                      {/* Belt */}
                      <rect x="33.5" y="33" width="15" height="3" rx="1.5" fill="#FBBF24"/>
                      {/* S shield  -  larger */}
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
                  // ── FANTASY  -  Disney-style castle with spires ────────────────
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
                    {/* Main center tower  -  tallest & grandest */}
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
                    {/* Glowing windows  -  warm amber glow */}
                    {[[8,36],[21.5,22],[40,10],[58.5,22],[72,36],[33,32],[40,32],[47,32],[21.5,40],[58.5,40]].map(([x,y],i)=>(
                      <rect key={i} x={(x as number)-1.5} y={(y as number)} width="3" height="4.5" rx="1.5" fill="rgba(255,215,90,0.92)" className="it-star" style={{animationDelay:`${i*0.14}s`}}/>
                    ))}
                    {/* Star on tallest spire */}
                    <circle cx="40" cy="1" r="3.5" fill="rgba(255,215,60,0.97)" className="it-pulse"/>
                    {[0,1,2,3,4,5,6,7].map(i=>(
                      <line key={i} x1="40" y1="1" x2={40+6*Math.cos(i*45*Math.PI/180)} y2={1+6*Math.sin(i*45*Math.PI/180)} stroke="rgba(255,215,60,0.55)" strokeWidth="1.1"/>
                    ))}
                  </>),
                  // ── FAIRIES  -  fairy garden, flutters on hover ────────────────
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
                    {/* Resting fairy  -  gently bobs in idle */}
                    <g className="it-bob" style={{transformOrigin:'40px 26px', animationDelay:'0.0s'}}>
                      {/* Upper wings  -  large teardrop shape */}
                      <path d="M40,20 Q28,10 24,20 Q28,28 40,24 Z" fill="rgba(200,160,255,0.38)" stroke="rgba(200,160,255,0.6)" strokeWidth="0.8"/>
                      <path d="M40,20 Q52,10 56,20 Q52,28 40,24 Z" fill="rgba(200,160,255,0.38)" stroke="rgba(200,160,255,0.6)" strokeWidth="0.8"/>
                      {/* Lower wings  -  smaller */}
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
                      {/* Hair  -  flowing */}
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
                    {/* Fairy flutters across on hover  -  trailing sparkle dust */}
                    <g className="it-fairy-flutter" style={{transformOrigin:'20px 28px'}}>
                      {/* Flying fairy  -  smaller, mid-flight pose */}
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
                  // ── UNICORNS  -  full body prancing unicorn ────────────────────
                  'Unicorns': (<>
                    <S cx={6} cy={4} r={1.2} d="0s"/><S cx={18} cy={2} r={0.8} d="0.35s"/>
                    <S cx={62} cy={5} r={1.4} d="0.7s"/><S cx={76} cy={3} r={1.0} d="0.4s"/>
                    {/* Pine forest silhouette */}
                    {[[5,22],[13,18],[66,20],[73,16]].map(([x,h],i)=>(
                      <g key={i}>
                        <rect x={x-1} y={60-h*0.28} width="2.5" height={h*0.28} fill="rgba(15,8,4,0.85)"/>
                        <polygon points={`${x-7},${60-h*0.28} ${x+7},${60-h*0.28} ${x},${60-h}`} fill="rgba(8,45,15,0.82)"/>
                        <polygon points={`${x-5},${60-h*0.52} ${x+5},${60-h*0.52} ${x},${60-h*1.1}`} fill="rgba(12,55,18,0.75)"/>
                      </g>
                    ))}
                    {/* Moon */}
                    <circle cx="68" cy="9" r="7" fill="rgba(255,240,200,0.18)"/>
                    <circle cx="68" cy="9" r="5" fill="rgba(255,240,210,0.40)"/>
                    {/* Unicorn */}
                    <g transform="translate(6,5) scale(0.78)">
                    <g className="it-bob" style={{transformOrigin:'38px 35px', animationDelay:'0.15s'}}>
                      {/* Tail  -  rainbow flowing */}
                      <path d="M20,35 Q8,24 5,15 Q9,26 13,32" fill="none" stroke="rgba(255,90,200,0.92)" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M20,37 Q7,37 5,46 Q10,40 15,39" fill="none" stroke="rgba(170,70,255,0.88)" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M20,33 Q8,20 11,11 Q14,21 18,27" fill="none" stroke="rgba(60,215,255,0.82)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Body  -  big and round */}
                      <ellipse cx="37" cy="37" rx="18" ry="11" fill="rgba(242,230,255,0.97)"/>
                      {/* Back legs  -  thick polygons */}
                      <polygon points="23,47 29,47 28,59 22,59" fill="rgba(228,215,252,0.97)"/>
                      <polygon points="31,47 37,47 38,59 32,59" fill="rgba(228,215,252,0.95)"/>
                      {/* Back hooves */}
                      <ellipse cx="25" cy="59" rx="3.5" ry="2" fill="rgba(160,120,210,0.88)"/>
                      <ellipse cx="35" cy="59" rx="3.5" ry="2" fill="rgba(160,120,210,0.88)"/>
                      {/* Neck */}
                      <polygon points="48,27 55,29 59,17 52,14" fill="rgba(242,230,255,0.97)"/>
                      {/* Mane  -  rainbow lush */}
                      <path d="M52,14 Q55,5 53,1 Q49,7 47,15" fill="none" stroke="rgba(255,80,185,0.95)" strokeWidth="6" strokeLinecap="round"/>
                      <path d="M55,16 Q60,7 57,2 Q53,9 51,17" fill="none" stroke="rgba(155,55,255,0.90)" strokeWidth="4.5" strokeLinecap="round"/>
                      <path d="M58,19 Q64,11 62,5 Q57,12 55,20" fill="none" stroke="rgba(55,210,255,0.85)" strokeWidth="3.2" strokeLinecap="round"/>
                      {/* Head */}
                      <ellipse cx="63" cy="21" rx="10" ry="8" fill="rgba(242,230,255,0.97)"/>
                      {/* Snout */}
                      <ellipse cx="72" cy="24" rx="5" ry="3.5" fill="rgba(235,218,255,0.97)"/>
                      <circle cx="75" cy="25.5" r="1.1" fill="rgba(195,155,228,0.55)"/>
                      {/* Eye  -  big expressive */}
                      <circle cx="64" cy="19" r="3.8" fill="rgba(55,20,100,0.95)"/>
                      <circle cx="65.2" cy="17.8" r="1.6" fill="rgba(255,255,255,0.95)"/>
                      <circle cx="64.8" cy="17.2" r="0.7" fill="rgba(255,255,255,0.7)"/>
                      {/* Eyelashes */}
                      <line x1="61" y1="16" x2="59.5" y2="14" stroke="rgba(70,30,110,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
                      <line x1="64" y1="15" x2="63.5" y2="13" stroke="rgba(70,30,110,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
                      <line x1="67" y1="16" x2="67.5" y2="14" stroke="rgba(70,30,110,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
                      {/* Horn  -  tall gold */}
                      <polygon points="61,14 59,0 67,13" fill="rgba(255,198,35,0.97)"/>
                      <line x1="60.5" y1="11" x2="62.5" y2="11" stroke="rgba(215,145,15,0.6)" strokeWidth="0.9"/>
                      <line x1="59.8" y1="8" x2="62" y2="8" stroke="rgba(215,145,15,0.6)" strokeWidth="0.9"/>
                      <line x1="59.2" y1="5" x2="61.5" y2="5" stroke="rgba(215,145,15,0.6)" strokeWidth="0.9"/>
                      <line x1="59" y1="2" x2="60.8" y2="2" stroke="rgba(215,145,15,0.6)" strokeWidth="0.9"/>
                      {/* Front standing leg */}
                      <polygon points="43,47 49,47 48,59 42,59" fill="rgba(228,215,252,0.97)"/>
                      <ellipse cx="45" cy="59" rx="3.5" ry="2" fill="rgba(160,120,210,0.88)"/>
                      {/* Front prancing leg  -  raised */}
                      <polygon points="50,47 56,47 58,37 52,37" fill="rgba(228,215,252,0.97)"/>
                      <polygon points="53,37 58,37 63,46 57,46" fill="rgba(228,215,252,0.95)"/>
                      <ellipse cx="60" cy="46" rx="3.5" ry="2" fill="rgba(160,120,210,0.88)"/>
                    </g>
                    </g>
                    {/* Sparkles */}
                    {[{x:8,y:24},{x:4,y:36},{x:74,y:18},{x:78,y:30}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="1.8" fill="rgba(255,220,255,0.9)" className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                  </>),
                  // ── PRINCESSES  -  Disney princess in ballgown ─────────────────
                  'Princesses': (<>
                    <S cx={6}  cy={3}  r={1.0} d="0s"/><S cx={68} cy={4}  r={1.2} d="0.5s"/>
                    <S cx={76} cy={14} r={0.9} d="0.8s"/><S cx={14} cy={18} r={0.8} d="0.3s"/>
                    {/* Castle silhouette */}
                    <rect x="2"  y="30" width="14" height="28" fill="rgba(120,80,160,0.35)"/>
                    <rect x="64" y="30" width="14" height="28" fill="rgba(120,80,160,0.35)"/>
                    {[2,5,8,11].map((x,i)=><rect key={i} x={x} y={26} width={2} height={5} fill="rgba(120,80,160,0.45)"/>)}
                    {[64,67,70,73].map((x,i)=><rect key={i} x={x} y={26} width={2} height={5} fill="rgba(120,80,160,0.45)"/>)}
                    {/* Chandelier */}
                    <line x1="40" y1="0" x2="40" y2="8" stroke="rgba(220,190,80,0.6)" strokeWidth="1"/>
                    <ellipse cx="40" cy="10" rx="8" ry="4" fill="rgba(200,170,60,0.4)"/>
                    {[0,1,2,3,4,5].map(i=><circle key={i} cx={33+i*3} cy={12} r="1.5" fill="rgba(255,230,100,0.9)" className="it-star" style={{animationDelay:`${i*0.2}s`}}/>)}
                    {/* Princess figure */}
                    <g className="it-bob" style={{transformOrigin:'40px 30px', animationDelay:'0.9s'}}>
                      {/* Ballgown  -  3 layered tiers */}
                      <polygon points="40,32 16,60 64,60" fill="rgba(180,80,200,0.75)"/>
                      <polygon points="40,38 20,60 60,60" fill="rgba(200,100,220,0.65)"/>
                      <ellipse cx="40" cy="56" rx="20" ry="5" fill="rgba(220,130,240,0.5)"/>
                      {/* Gown sparkles */}
                      {[[26,44],[30,52],[36,48],[44,50],[50,44],[54,52]].map(([x,y],i)=>(
                        <circle key={i} cx={x} cy={y} r="1.8" fill="rgba(255,230,255,0.85)" className="it-star" style={{animationDelay:`${i*0.18}s`}}/>
                      ))}
                      {/* Bodice */}
                      <ellipse cx="40" cy="30" rx="6" ry="8" fill="rgba(200,100,220,0.88)"/>
                      {/* Gem necklace */}
                      {[-4,-1,2,5].map((dx,i)=><circle key={i} cx={40+dx} cy={24} r="1.5" fill={['rgba(255,100,100,0.9)','rgba(100,180,255,0.9)','rgba(100,255,150,0.9)','rgba(255,200,50,0.9)'][i]}/>)}
                      {/* Left gloved arm */}
                      <path d="M34,28 Q24,22 20,26" fill="none" stroke="rgba(255,200,210,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      <circle cx="20" cy="26" r="2.5" fill="rgba(255,200,210,0.95)"/>
                      {/* Right arm holding wand */}
                      <path d="M46,28 Q52,22 55,16" fill="none" stroke="rgba(255,200,210,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      <line x1="55" y1="16" x2="58" y2="8" stroke="rgba(200,180,60,0.92)" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="59" cy="7" r="4.5" fill="rgba(255,220,80,0.92)" className="it-pulse"/>
                      {[0,45,90,135,180,225,270,315].map((deg,i)=>(
                        <line key={i} x1="59" y1="7" x2={59+8*Math.cos(deg*Math.PI/180)} y2={7+8*Math.sin(deg*Math.PI/180)} stroke="rgba(255,220,80,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
                      ))}
                      {/* Neck & head */}
                      <ellipse cx="40" cy="19" rx="1.8" ry="3" fill="rgba(255,210,185,0.97)"/>
                      <circle cx="40" cy="13" r="7" fill="rgba(255,210,185,0.97)"/>
                      {/* Hair */}
                      <path d="M33,10 Q36,3 40,5 Q44,3 47,10" fill="rgba(200,140,50,0.95)"/>
                      <path d="M33,14 Q26,20 28,30" fill="none" stroke="rgba(200,140,50,0.8)" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M47,14 Q54,20 52,30" fill="none" stroke="rgba(200,140,50,0.8)" strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Face */}
                      <circle cx="37.5" cy="13.5" r="1.3" fill="rgba(100,60,120,0.9)"/>
                      <circle cx="42.5" cy="13.5" r="1.3" fill="rgba(100,60,120,0.9)"/>
                      <path d="M37.5,16.5 Q40,19 42.5,16.5" fill="none" stroke="rgba(200,80,120,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Crown  -  5-point elaborate */}
                      <polygon points="33,8 36,2 40,5.5 44,2 47,8" fill="rgba(255,200,40,0.97)"/>
                      <rect x="33" y="7" width="14" height="3.5" rx="1" fill="rgba(240,180,30,0.95)"/>
                      <circle cx="36" cy="3" r="2" fill="rgba(255,80,120,0.95)" className="it-pulse"/>
                      <circle cx="40" cy="5.5" r="1.5" fill="rgba(100,200,255,0.9)"/>
                      <circle cx="44" cy="3" r="2" fill="rgba(255,80,120,0.95)" className="it-pulse" style={{animationDelay:'0.5s'}}/>
                    </g>
                  </>),
                  // ── PIRATES  -  tall ship on the dark sea ─────────────────────
                  'Pirates': (<>
                    {/* Stars  -  fixed, opacity only */}
                    <S cx={62} cy={4} r={1.3} d="0s"/><S cx={72} cy={10} r={1.0} d="0.4s"/><S cx={55} cy={2} r={1.5} d="0.8s"/><S cx={76} cy={18} r={0.9} d="0.6s"/>
                    {/* Crescent moon */}
                    <circle cx="10" cy="11" r="9" fill="rgba(255,235,145,0.92)"/>
                    <circle cx="14" cy="9"  r="7.5" fill="#071422"/>
                    {/* Waves  -  dark ocean */}
                    <path d="M0,50 Q10,44 20,50 Q30,56 40,50 Q50,44 60,50 Q70,56 80,50" fill="rgba(20,50,130,0.45)" className="it-wave-y"/>
                    <path d="M0,56 Q10,50 20,56 Q30,62 40,56 Q50,50 60,56 Q70,62 80,56" fill="rgba(20,50,130,0.55)" className="it-wave-y" style={{animationDelay:'0.5s'}}/>
                    {/* Ship  -  gently bobs on the water */}
                    <g className="it-bob" style={{transformOrigin:'40px 40px', animationDelay:'1.1s'}}>
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
                      {/* Pirate idle  -  always faintly visible so hover "reveal" is satisfying */}
                      <g opacity="0.25">
                        <circle cx="40" cy="2.5" r="2.8" fill="rgba(215,168,112,1)"/>
                        <rect x="37" y="0.2" width="6" height="2" rx="0.5" fill="rgba(18,18,18,1)"/>
                        <rect x="37.5" y="4" width="5" height="5.5" rx="0.5" fill="rgba(25,25,80,1)"/>
                      </g>
                      {/* Pirate on hover  -  bounces in then waves dramatically */}
                      <g className="it-pirate-appear" style={{transformOrigin:'40px 4px'}}>
                        {/* Body */}
                        <rect x="37.5" y="4" width="5" height="5.5" rx="0.5" fill="rgba(25,25,80,0.97)"/>
                        {/* Head */}
                        <circle cx="40" cy="2.5" r="2.8" fill="rgba(215,168,112,0.97)"/>
                        {/* Pirate hat */}
                        <rect x="37" y="0.2" width="6" height="2" rx="0.5" fill="rgba(18,18,18,0.97)"/>
                        {/* Waving arm  -  wide rotation */}
                        <g className="it-pirate-wave" style={{transformOrigin:'42.5px 5.5px'}}>
                          <line x1="42.5" y1="5.5" x2="49" y2="1.5" stroke="rgba(25,25,80,0.97)" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="49" cy="1.5" r="2" fill="rgba(215,168,112,0.97)"/>
                        </g>
                        {/* Resting arm */}
                        <line x1="37.5" y1="5.5" x2="33" y2="7.5" stroke="rgba(25,25,80,0.97)" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </g>
                  </>),
                  // ── MAGIC  -  elegant wand with swirling energy ────────────────
                  'Magic': (<>
                    {/* Twinkling background stars */}
                    {[{x:66,y:6,r:1.6},{x:76,y:24,r:1.2},{x:8,y:12,r:1.5},{x:4,y:46,r:1.2},{x:78,y:50,r:1.4}].map(({x,y,r},i)=>(
                      <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,210,80,0.85)" className="it-star" style={{animationDelay:`${i*0.42}s`}}/>
                    ))}
                    {/* WIZARD HAT  -  tall golden */}
                    <polygon points="34,1 22,27 52,27" fill="rgba(210,162,18,0.97)"/>
                    <polygon points="34,1 22,27 52,27" fill="rgba(255,220,70,0.22)"/>
                    <ellipse cx="37" cy="27" rx="18" ry="5" fill="rgba(182,128,10,0.97)"/>
                    {/* Star on hat */}
                    <polygon points="34,7 35.4,11 39.4,11 36.2,13.5 37.6,17.5 34,15.2 30.4,17.5 31.8,13.5 28.6,11 32.6,11" fill="rgba(255,248,120,0.97)"/>
                    {/* WIZARD FACE */}
                    <circle cx="37" cy="35" r="7.5" fill="rgba(228,188,132,0.96)"/>
                    <circle cx="34" cy="33.5" r="1.4" fill="rgba(45,15,75,0.92)"/>
                    <circle cx="40" cy="33.5" r="1.4" fill="rgba(45,15,75,0.92)"/>
                    <path d="M33.5,37 Q37,40 40.5,37" fill="none" stroke="rgba(140,80,40,0.82)" strokeWidth="1.4" strokeLinecap="round"/>
                    {/* WIZARD ROBE */}
                    <path d="M22,42 Q17,60 13,60 L58,60 Q56,42 50,42 Q44,40 37,42 Q30,40 22,42Z" fill="rgba(82,32,148,0.97)"/>
                    <line x1="37" y1="43" x2="35" y2="59" stroke="rgba(125,80,210,0.35)" strokeWidth="2"/>
                    {/* WAND ARM  -  sleeve extending right */}
                    <path d="M50,50 Q60,44 66,36" fill="none" stroke="rgba(82,32,148,0.97)" strokeWidth="10" strokeLinecap="round"/>
                    {/* Hand */}
                    <circle cx="66" cy="36" r="5.5" fill="rgba(228,188,132,0.96)"/>
                    {/* Wand shaft */}
                    <line x1="66" y1="32" x2="72" y2="14" stroke="rgba(80,44,10,0.97)" strokeWidth="4" strokeLinecap="round"/>
                    <line x1="66" y1="32" x2="72" y2="14" stroke="rgba(200,148,55,0.28)" strokeWidth="2" strokeLinecap="round"/>
                    {/* Grip ring */}
                    <line x1="63" y1="35" x2="70" y2="25" stroke="rgba(160,105,28,0.82)" strokeWidth="2.5" strokeLinecap="round"/>
                    {/* MAGIC BURST at wand tip */}
                    <g className="it-bob" style={{transformOrigin:'72px 14px',animationDelay:'0.7s'}}>
                      <circle cx="72" cy="14" r="12" fill="rgba(195,145,255,0.1)"/>
                      <circle cx="72" cy="14" r="7.5" fill="rgba(220,175,255,0.22)"/>
                      <circle cx="72" cy="14" r="4.5" fill="rgba(245,208,255,0.6)"/>
                      <circle cx="72" cy="14" r="2.6" fill="rgba(255,244,255,0.97)" className="it-pulse"/>
                      {[0,45,90,135,180,225,270,315].map((deg,i)=>(
                        <line key={i} x1="72" y1="14"
                          x2={72+13*Math.cos(deg*Math.PI/180)}
                          y2={14+13*Math.sin(deg*Math.PI/180)}
                          stroke={i%2===0?"rgba(255,218,75,0.92)":"rgba(208,138,255,0.82)"}
                          strokeWidth={i%2===0?2.2:1.4} strokeLinecap="round"/>
                      ))}
                      {[{x:-8,y:-8},{x:5,y:-12},{x:12,y:2},{x:-12,y:4},{x:2,y:11}].map(({x,y},i)=>(
                        <circle key={i} cx={72+x} cy={14+y} r={2.2} fill="rgba(255,228,78,0.9)" className="it-star" style={{animationDelay:`${i*0.22}s`}}/>
                      ))}
                    </g>
                  </>),
                  // ── ALIENS  -  dark space encounter ───────────────────────────
                  'Aliens': (<>
                    {/* Stars */}
                    {[{x:6,y:4,r:1.3},{x:18,y:2,r:0.9},{x:38,y:5,r:1.6},{x:54,y:3,r:1.1},{x:66,y:6,r:1.4},{x:74,y:14,r:1.0},{x:4,y:18,r:1.2},{x:76,y:28,r:0.8}].map(({x,y,r},i)=>(
                      <circle key={i} cx={x} cy={y} r={r} fill="rgba(200,255,200,0.85)" className="it-star" style={{animationDelay:`${i*0.22}s`}}/>
                    ))}
                    {/* Planet in corner */}
                    <circle cx="68" cy="10" r="9"  fill="rgba(0,180,80,0.25)"/>
                    <circle cx="68" cy="10" r="7"  fill="rgba(0,200,100,0.35)"/>
                    <ellipse cx="68" cy="10" rx="9" ry="3" fill="none" stroke="rgba(0,220,120,0.4)" strokeWidth="1.5" transform="rotate(-20,68,10)"/>
                    {/* UFO  -  hovering */}
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
                  // ── DINOSAURS  -  triceratops + brachiosaurus ──────────────────
                  'Dinosaurs': (<>
                    {/* Forest background  -  layered dark pines */}
                    {[[0,28],[6,34],[68,30],[74,26]].map(([x,h],i)=>(
                      <g key={i}>
                        <rect x={x+1} y={60-h*0.28} width="3" height={h*0.28} fill="rgba(12,28,8,0.95)" rx="1"/>
                        <polygon points={`${x+2.5-h*0.4},${60-h*0.28} ${x+2.5+h*0.4},${60-h*0.28} ${x+2.5},${60-h}`} fill="rgba(8,38,12,0.93)"/>
                        <polygon points={`${x+2.5-h*0.3},${60-h*0.52} ${x+2.5+h*0.3},${60-h*0.52} ${x+2.5},${60-h*1.12}`} fill="rgba(10,48,14,0.85)"/>
                      </g>
                    ))}
                    {/* Mid forest  -  slightly lighter */}
                    {[[14,20],[20,24],[54,22],[60,18]].map(([x,h],i)=>(
                      <g key={i}>
                        <rect x={x+1} y={60-h*0.28} width="2.5" height={h*0.28} fill="rgba(14,36,10,0.88)" rx="1"/>
                        <polygon points={`${x+2.5-h*0.35},${60-h*0.28} ${x+2.5+h*0.35},${60-h*0.28} ${x+2.5},${60-h}`} fill="rgba(12,48,16,0.82)"/>
                      </g>
                    ))}
                    {/* Moon */}
                    <circle cx="40" cy="8" r="8" fill="rgba(255,248,210,0.14)"/>
                    <circle cx="40" cy="8" r="5" fill="rgba(255,248,210,0.38)"/>
                    {/* Ground */}
                    <rect x="0" y="53" width="80" height="7" fill="rgba(10,34,10,0.75)"/>
                    {/* Ground ferns */}
                    {[10,28,46,64].map((x,i)=>(
                      <g key={i}>
                        <path d={`M${x},53 Q${x-6},47 ${x-10},45`} fill="none" stroke="rgba(16,55,14,0.7)" strokeWidth="2" strokeLinecap="round"/>
                        <path d={`M${x},53 Q${x+6},47 ${x+10},45`} fill="none" stroke="rgba(16,55,14,0.7)" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    ))}
                    {/* Stegosaurus */}
                    <g className="it-bob" style={{transformOrigin:'36px 40px', animationDelay:'0.2s'}}>
                      {/* Tail  -  thick, curves left and up */}
                      <path d="M18,42 Q8,38 4,30 Q3,25 6,24" fill="none" stroke="rgba(48,110,38,0.97)" strokeWidth="8" strokeLinecap="round"/>
                      {/* Tail tip spike */}
                      <polygon points="4,22 8,28 2,26" fill="rgba(35,85,28,0.95)"/>
                      {/* Body  -  wide, low, fat */}
                      <ellipse cx="36" cy="42" rx="20" ry="11" fill="rgba(52,118,42,0.97)"/>
                      {/* Belly highlight */}
                      <ellipse cx="36" cy="46" rx="13" ry="6" fill="rgba(68,145,55,0.35)"/>
                      {/* Neck connecting to head */}
                      <polygon points="50,34 56,36 60,28 54,26" fill="rgba(52,118,42,0.97)"/>
                      {/* Head  -  small, angled forward-down */}
                      <ellipse cx="60" cy="34" rx="9" ry="6" fill="rgba(52,118,42,0.97)"/>
                      {/* Snout  -  beak-like */}
                      <polygon points="67,35 74,38 72,42 65,40" fill="rgba(42,95,34,0.97)"/>
                      {/* Eye  -  small, calm */}
                      <circle cx="62" cy="31" r="2.8" fill="rgba(10,5,2,0.95)"/>
                      <circle cx="63" cy="30" r="1.1" fill="rgba(255,255,255,0.8)"/>
                      {/* Nostril */}
                      <ellipse cx="70" cy="37" rx="1.4" ry="1" fill="rgba(28,68,22,0.7)"/>
                      {/* 4 legs  -  thick pillars */}
                      <polygon points="22,51 29,51 28,60 21,60" fill="rgba(44,100,35,0.97)"/>
                      <polygon points="30,51 37,51 36,60 29,60" fill="rgba(44,100,35,0.95)"/>
                      <polygon points="38,51 45,51 44,60 37,60" fill="rgba(44,100,35,0.97)"/>
                      <polygon points="46,51 53,51 52,60 45,60" fill="rgba(44,100,35,0.95)"/>
                      {/* Toe bumps on feet */}
                      {[[24,60],[33,60],[41,60],[49,60]].map(([x,y],i)=>(
                        <ellipse key={i} cx={x} cy={y} rx="4" ry="2" fill="rgba(36,84,28,0.9)"/>
                      ))}
                      {/* Back plates  -  iconic stego feature, amber/orange for contrast */}
                      {[
                        {x:22,y:32,h:9},
                        {x:28,y:29,h:13},
                        {x:34,y:27,h:16},
                        {x:40,y:27,h:15},
                        {x:46,y:29,h:12},
                        {x:51,y:31,h:9},
                      ].map(({x,y,h},i)=>(
                        <polygon key={i}
                          points={`${x},${y} ${x-h*0.45},${y+h*0.55} ${x},${y+h} ${x+h*0.45},${y+h*0.55}`}
                          fill={i===2||i===3?"rgba(235,148,22,0.97)":"rgba(218,128,18,0.93)"}
                        />
                      ))}
                    </g>
                    {/* Fireflies */}
                    {[{x:12,y:30},{x:62,y:22},{x:72,y:35},{x:8,y:44}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(180,255,100,0.85)" className="it-star" style={{animationDelay:`${i*0.45}s`}}/>
                    ))}
                  </>),
                  // ── ANIMALS  -  safari with multiple animals ────────────────────
                  'Animals': (<>
                    <S cx={6} cy={3} r={1.0} d="0s"/><S cx={20} cy={2} r={0.8} d="0.4s"/>
                    {/* Savannah sunset */}
                    <circle cx="68" cy="14" r="12" fill="rgba(255,160,50,0.25)"/>
                    <circle cx="68" cy="14" r="8"  fill="rgba(255,180,60,0.45)"/>
                    <circle cx="68" cy="14" r="5"  fill="rgba(255,200,80,0.55)"/>
                    {/* Savannah ground */}
                    <rect x="0" y="48" width="80" height="12" fill="rgba(25,90,15,0.4)"/>
                    {/* Acacia tree */}
                    <rect x="56" y="30" width="4" height="20" fill="rgba(80,50,20,0.6)" rx="1"/>
                    <ellipse cx="58" cy="28" rx="12" ry="6" fill="rgba(25,100,25,0.5)"/>
                    {/* Giraffe  -  background left */}
                    <g style={{opacity:0.82}}>
                      <rect x="10" y="8" width="5" height="28" rx="2.5" fill="rgba(220,175,70,0.9)"/>
                      <ellipse cx="12.5" cy="7" rx="5" ry="4.5" fill="rgba(220,175,70,0.9)"/>
                      <rect x="14" y="5" width="5" height="2.5" rx="1" fill="rgba(200,155,55,0.88)"/>
                      <circle cx="16.5" cy="6" r="1" fill="rgba(0,0,0,0.82)"/>
                      <line x1="12" y1="3" x2="12" y2="0" stroke="rgba(180,140,50,0.8)" strokeWidth="1.5"/>
                      <line x1="14" y1="3" x2="14" y2="0" stroke="rgba(180,140,50,0.8)" strokeWidth="1.5"/>
                      <ellipse cx="12.5" cy="38" rx="8" ry="6" fill="rgba(220,175,70,0.88)"/>
                      {[[9,32],[13,32],[16,32],[19,32]].map(([x,y],i)=><rect key={i} x={x-1.5} y={y+10} width={3} height={16} rx="1.5" fill="rgba(200,155,55,0.9)"/>)}
                      {[[9,28],[13,30],[17,29],[20,31]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="2.5" ry="2" fill="rgba(155,100,15,0.55)"/>)}
                    </g>
                    {/* Elephant  -  background right */}
                    <g style={{opacity:0.75}}>
                      <ellipse cx="66" cy="40" rx="9" ry="7" fill="rgba(120,115,125,0.75)"/>
                      <ellipse cx="66" cy="31" rx="7" ry="6.5" fill="rgba(120,115,125,0.75)"/>
                      <ellipse cx="60" cy="31" rx="4.5" ry="6.5" fill="rgba(135,130,140,0.6)"/>
                      <path d="M70,36 Q74,40 72,47" fill="none" stroke="rgba(120,115,125,0.82)" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="70" cy="28" r="1.8" fill="rgba(0,0,0,0.88)"/>
                      <path d="M72,34 Q77,35 75,39" fill="none" stroke="rgba(230,220,200,0.7)" strokeWidth="2" strokeLinecap="round"/>
                      {[[60,45],[64,45],[68,45],[72,45]].map(([x,y],i)=><rect key={i} x={x-2} y={y} width={4} height={11} rx="2" fill="rgba(115,110,120,0.8)"/>)}
                    </g>
                    {/* Lion  -  foreground center */}
                    <g className="it-bob" style={{transformOrigin:'40px 36px', animationDelay:'0.8s'}}>
                      {/* Mane */}
                      <circle cx="40" cy="28" r="14" fill="rgba(155,85,18,0.72)"/>
                      {/* Body */}
                      <ellipse cx="40" cy="42" rx="11" ry="8" fill="rgba(210,165,70,0.92)"/>
                      {/* Head */}
                      <circle cx="40" cy="27" r="10" fill="rgba(210,165,70,0.97)"/>
                      {/* Eyes */}
                      <circle cx="36" cy="26" r="2.2" fill="rgba(80,50,10,0.9)"/>
                      <circle cx="44" cy="26" r="2.2" fill="rgba(80,50,10,0.9)"/>
                      <circle cx="36.6" cy="25.4" r="0.8" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="44.6" cy="25.4" r="0.8" fill="rgba(255,255,255,0.7)"/>
                      {/* Nose */}
                      <ellipse cx="40" cy="30" rx="3" ry="2" fill="rgba(200,120,100,0.8)"/>
                      <path d="M37.5,30 Q40,33.5 42.5,30" fill="none" stroke="rgba(180,100,80,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Whiskers */}
                      {[[-12,-1],[-12,2],[12,-1],[12,2]].map(([dx,dy],i)=>(
                        <line key={i} x1={40} y1={30+dy} x2={40+dx} y2={30+dy} stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round"/>
                      ))}
                      {/* Ears */}
                      <ellipse cx="30" cy="18" rx="5" ry="5" fill="rgba(155,85,18,0.8)"/>
                      <ellipse cx="50" cy="18" rx="5" ry="5" fill="rgba(155,85,18,0.8)"/>
                      {/* Legs */}
                      {[[32,48],[37,48],[43,48],[48,48]].map(([x,y],i)=>(
                        <rect key={i} x={x-2} y={y} width={4} height={10} rx="2" fill="rgba(200,155,60,0.9)"/>
                      ))}
                      {/* Tail */}
                      <path d="M51,42 Q58,38 60,44 Q62,48 58,50" fill="none" stroke="rgba(200,155,60,0.88)" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="57" cy="51" r="4" fill="rgba(148,78,14,0.75)"/>
                    </g>
                  </>),
                  // ── OCEAN  -  deep sea world ───────────────────────────────────
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
                    {/* Tropical fish  -  eye on right = swims forward left-to-right */}
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
                  // ── NATURE  -  sunrise forest ──────────────────────────────────
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
                  // ── ROBOTS  -  dark robot workshop ─────────────────────────────
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
                    {/* Eyes  -  glowing */}
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
                  // ── SCIENCE  -  glowing dark lab ───────────────────────────────
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
                  // ── GAMING  -  dark arcade ─────────────────────────────────────
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
                    <g className="it-bob" style={{transformOrigin:'56px 24px', animationDelay:'1.3s'}}>
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
                  // ── SOCCER  -  sunny pitch ─────────────────────────────────────
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
                  // ── FOOTBALL  -  night game under lights ──────────────────────
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
                  // ── GYMNASTICS  -  gymnast on balance beam ─────────────────
                  'Gymnastics': (<>
                    {/* Gym floor */}
                    <rect x="0" y="50" width="80" height="10" fill="rgba(255,225,160,0.3)"/>
                    <line x1="0" y1="50" x2="80" y2="50" stroke="rgba(200,160,80,0.4)" strokeWidth="1.5"/>
                    {/* Balance beam */}
                    <rect x="6" y="47" width="68" height="3" rx="1.5" fill={c(0.85)}/>
                    <rect x="14" y="50" width="4" height="4" rx="1" fill={c(0.5)}/>
                    <rect x="62" y="50" width="4" height="4" rx="1" fill={c(0.5)}/>
                    {/* Spotlight */}
                    <polygon points="18,0 36,0 46,47 8,47" fill="rgba(255,220,150,0.05)"/>
                    <circle cx="27" cy="2" r="5" fill="rgba(255,220,120,0.5)" className="it-pulse"/>
                    {/* Gymnast  -  cream skin on dark bg */}
                    <g className="it-bob" style={{transformOrigin:'27px 27px',animationDelay:'0.5s'}}>
                      {/* Arabesque leg  -  raised behind, going right */}
                      <polygon points="25,37 31,37 46,29 40,24" fill="rgba(232,205,178,0.97)"/>
                      <ellipse cx="43" cy="26.5" rx="4.5" ry="2.5" fill="rgba(232,205,178,0.97)" transform="rotate(-22,43,27)"/>
                      {/* Standing leg */}
                      <polygon points="22,37 28,37 27,47 21,47" fill="rgba(232,205,178,0.97)"/>
                      {/* Body leotard */}
                      <ellipse cx="26" cy="27" rx="8" ry="9" fill={c(0.92)}/>
                      <line x1="26" y1="18" x2="26" y2="36" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round"/>
                      {/* Wand arm  -  raised to top right */}
                      <polygon points="26,19 31,20 40,9 35,8" fill="rgba(232,205,178,0.97)"/>
                      <circle cx="37.5" cy="8.5" r="3.2" fill="rgba(232,205,178,0.97)"/>
                      {/* Wand stick */}
                      <line x1="40" y1="7" x2="50" y2="2" stroke="rgba(210,210,220,0.92)" strokeWidth="1.5" strokeLinecap="round"/>
                      {/* Other arm  -  out to left */}
                      <polygon points="21,24 26,28 13,33 11,29" fill="rgba(232,205,178,0.97)"/>
                      <circle cx="10" cy="31" r="3.2" fill="rgba(232,205,178,0.97)"/>
                      {/* Head */}
                      <circle cx="27" cy="11" r="7" fill="rgba(232,205,178,0.97)"/>
                      {/* Face */}
                      <circle cx="24.5" cy="10" r="1.3" fill="rgba(70,35,20,0.88)"/>
                      <circle cx="29.5" cy="10" r="1.3" fill="rgba(70,35,20,0.88)"/>
                      <path d="M25,13.5 Q27,15.5 29,13.5" fill="none" stroke="rgba(190,85,75,0.75)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Hair bun */}
                      <ellipse cx="27" cy="5" rx="5" ry="3.5" fill={c(0.88)}/>
                      <circle cx="27" cy="4.5" r="2" fill={c(0.96)}/>
                    </g>
                    {/* Ribbon  -  multicolor flowing from wand tip */}
                    <g className="it-ribbon" style={{transformOrigin:'50px 2px'}}>
                      <path d="M50,2 Q63,12 59,25 Q55,38 66,46" fill="none" stroke="rgba(255,75,185,0.93)" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M50,2 Q68,10 72,24 Q75,38 66,48" fill="none" stroke="rgba(60,210,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M50,2 Q60,8 64,20 Q68,33 60,42" fill="none" stroke="rgba(255,215,55,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                    </g>
                    {/* Stars */}
                    {[[4,20],[68,20]].map(([x,y],i)=>(
                      <g key={i}>{[0,7,14].map(dx=><circle key={dx} cx={x+dx} cy={y} r="2" fill={c(0.75)} className="it-star" style={{animationDelay:`${(i*3+dx/7)*0.2}s`}}/>)}</g>
                    ))}
                  </>),
                  // ── DANCING  -  dancer in spotlight ────────────────────────
                  'Dancing': (<>
                    {/* Stage floor */}
                    <rect x="0" y="50" width="80" height="10" fill="rgba(60,10,10,0.65)"/>
                    <line x1="0" y1="50" x2="80" y2="50" stroke="rgba(200,80,80,0.5)" strokeWidth="1.5"/>
                    {/* Spotlight */}
                    <circle cx="40" cy="2" r="8" fill="rgba(255,220,100,0.68)" className="it-pulse"/>
                    <polygon points="34,2 46,2 54,50 26,50" fill="rgba(255,220,100,0.08)"/>
                    <ellipse cx="40" cy="50" rx="26" ry="5" fill="rgba(255,200,100,0.09)"/>
                    {/* DANCER  -  cream skin + bright dress for contrast on dark maroon */}
                    <g className="it-bob" style={{transformOrigin:'40px 28px',animationDelay:'0.4s'}}>
                      {/* Flared skirt  -  wide, bright */}
                      <path d="M40,36 Q25,40 14,52 Q29,49 40,45 Q51,49 66,52 Q55,40 40,36" fill={c(0.88)}/>
                      <path d="M40,38 Q27,42 18,52 Q31,49 40,45" fill={c(0.62)}/>
                      {/* Skirt top/waist accent */}
                      <ellipse cx="40" cy="36" rx="8" ry="3" fill={c(0.75)}/>
                      {/* Body  -  cream for contrast */}
                      <ellipse cx="40" cy="26" rx="7" ry="10" fill="rgba(248,218,158,0.97)"/>
                      {/* Red dress bodice overlay */}
                      <ellipse cx="40" cy="31" rx="7" ry="6" fill={c(0.80)}/>
                      {/* Head  -  cream */}
                      <circle cx="40" cy="12" r="8" fill="rgba(248,218,158,0.97)"/>
                      {/* Hair up in bun */}
                      <ellipse cx="40" cy="5" rx="5.5" ry="4.5" fill={c(0.68)}/>
                      <circle cx="40" cy="5" r="2.5" fill={c(0.82)}/>
                      {/* Face */}
                      <circle cx="37" cy="11.5" r="1.5" fill={c(0.72)}/>
                      <circle cx="43" cy="11.5" r="1.5" fill={c(0.72)}/>
                      <path d="M37,14.5 Q40,17 43,14.5" fill="none" stroke={c(0.62)} strokeWidth="1.3" strokeLinecap="round"/>
                      {/* Arm raised up  -  cream */}
                      <path d="M34,22 Q23,16 19,7" fill="none" stroke="rgba(248,218,158,0.97)" strokeWidth="5.5" strokeLinecap="round"/>
                      <circle cx="19" cy="7" r="4" fill="rgba(248,218,158,0.97)"/>
                      {/* Arm out right  -  cream */}
                      <path d="M46,24 Q57,26 64,21" fill="none" stroke="rgba(248,218,158,0.97)" strokeWidth="5" strokeLinecap="round"/>
                      <circle cx="64" cy="21" r="3.5" fill="rgba(248,218,158,0.97)"/>
                      {/* Legs  -  cream */}
                      <line x1="37" y1="44" x2="32" y2="55" stroke="rgba(238,205,145,0.96)" strokeWidth="5" strokeLinecap="round"/>
                      <ellipse cx="31" cy="56" rx="3.5" ry="2" fill={c(0.68)}/>
                      <line x1="43" y1="44" x2="50" y2="54" stroke="rgba(238,205,145,0.94)" strokeWidth="4.5" strokeLinecap="round"/>
                      <ellipse cx="50" cy="55" rx="3" ry="2" fill={c(0.62)}/>
                    </g>
                    {/* Music notes */}
                    {[8,22,56,70].map((x,i)=>(
                      <g key={i} className="it-up" style={{animationDelay:`${i*0.38}s`,transformOrigin:`${x}px 44px`}}>
                        <text x={x-5} y="44" fontSize="14" fill={c(0.85)}>♪</text>
                      </g>
                    ))}
                  </>),
                  // ── KARATE  -  martial artist in proper gi ─────────────────────
                  'Karate': (<>
                    {/* Tatami mats */}
                    {[0,1,2,3,4].map(i=><rect key={i} x={i*16} y={51} width={14} height={9} fill={c(0.1+i*0.02)} rx="1"/>)}
                    <line x1="0" y1="51" x2="80" y2="51" stroke={c(0.45)} strokeWidth="1.5"/>
                    {/* Ki aura  -  subtle background glow */}
                    <g className="it-pulse" style={{transformOrigin:'36px 30px', opacity:0.5}}>
                      {[0,36,72,108,144,180,216,252,288,324].map((deg,i)=>(
                        <line key={i} x1="36" y1="30"
                          x2={36+24*Math.cos(deg*Math.PI/180)}
                          y2={30+24*Math.sin(deg*Math.PI/180)}
                          stroke={i%2===0?"rgba(255,180,20,0.6)":"rgba(255,100,20,0.45)"}
                          strokeWidth={i%2===0?1.8:1.2} strokeLinecap="round"/>
                      ))}
                    </g>
                    {/* Karateka  -  guard stance, both feet grounded */}
                    <g className="it-bob" style={{transformOrigin:'34px 32px', animationDelay:'0.6s'}}>
                      {/* Back left leg */}
                      <polygon points="22,45 29,45 27,59 20,59" fill="rgba(244,244,248,0.97)"/>
                      <ellipse cx="23.5" cy="59" rx="5" ry="2.8" fill="rgba(228,188,132,0.95)"/>
                      {/* Front right leg */}
                      <polygon points="35,45 42,45 44,59 37,59" fill="rgba(244,244,248,0.97)"/>
                      <ellipse cx="40.5" cy="59" rx="5" ry="2.8" fill="rgba(228,188,132,0.95)"/>
                      {/* Gi body */}
                      <path d="M19,22 L34,16 L49,22 L47,46 L21,46Z" fill="rgba(250,250,252,0.97)"/>
                      <path d="M34,16 L26,42" stroke="rgba(175,175,188,0.5)" strokeWidth="1.8"/>
                      <path d="M34,16 L42,42" stroke="rgba(175,175,188,0.5)" strokeWidth="1.8"/>
                      {/* Black belt */}
                      <rect x="19" y="41" width="30" height="5.5" rx="2.2" fill="rgba(8,8,12,0.97)"/>
                      {/* Front guard arm  -  extended forward at chest height */}
                      <polygon points="44,24 50,30 64,24 58,18" fill="rgba(244,244,248,0.97)"/>
                      <circle cx="61" cy="21" r="5.5" fill="rgba(228,188,132,0.95)"/>
                      {/* Back chamber arm  -  fist pulled to hip */}
                      <polygon points="23,27 27,34 10,43 6,36" fill="rgba(244,244,248,0.97)"/>
                      <circle cx="7" cy="39.5" r="5" fill="rgba(228,188,132,0.95)"/>
                      {/* Head */}
                      <circle cx="34" cy="9" r="9.5" fill="rgba(228,188,132,0.97)"/>
                      {/* Red headband */}
                      <rect x="24.5" y="5" width="19" height="5.5" rx="2.5" fill="rgba(212,25,25,0.95)"/>
                      {/* Eyes  -  focused forward */}
                      <circle cx="30" cy="9.5" r="1.7" fill="rgba(18,6,2,0.93)"/>
                      <circle cx="38" cy="9.5" r="1.7" fill="rgba(18,6,2,0.93)"/>
                      {/* Fierce brows */}
                      <path d="M27.5,6.5 L32,8.2" stroke="rgba(55,22,4,0.82)" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M40.5,8.2 L36,6.5" stroke="rgba(55,22,4,0.82)" strokeWidth="1.8" strokeLinecap="round"/>
                      {/* Determined mouth */}
                      <path d="M31.5,13.5 L36.5,13.5" stroke="rgba(135,65,22,0.75)" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    {/* Energy lines at guard fist */}
                    <line x1="65" y1="16" x2="72" y2="12" stroke="rgba(255,200,40,0.65)" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="67" y1="22" x2="74" y2="21" stroke="rgba(255,180,30,0.45)" strokeWidth="1.6" strokeLinecap="round"/>
                    <line x1="65" y1="27" x2="72" y2="28" stroke="rgba(255,160,20,0.32)" strokeWidth="1.3" strokeLinecap="round"/>
                  </>),
                  // ── SWIMMING  -  competition pool ───────────────────────────────
                  'Swimming': (<>
                    {/* Pool edge */}
                    <rect x="0" y="16" width="80" height="6" fill="rgba(180,180,200,0.85)"/>
                    {/* Starting blocks */}
                    {[6,19,32,45,58,71].map((x,i)=>(
                      <g key={i}>
                        <rect x={x} y={12} width={8} height={5} rx="1" fill="rgba(160,160,180,0.8)"/>
                        <rect x={x+1} y={10} width={6} height={3} rx="1" fill="rgba(140,140,160,0.7)"/>
                      </g>
                    ))}
                    {/* Pool water */}
                    <rect x="0" y="22" width="80" height="38" fill="rgba(0,90,200,0.65)"/>
                    {/* Lane ropes */}
                    {[13,26,39,52,65].map((x,i)=>(
                      <g key={i}>
                        <line x1={x} y1={22} x2={x} y2={60} stroke={i%2===0?'rgba(255,100,20,0.7)':'rgba(255,210,0,0.65)'} strokeWidth="1.8" strokeDasharray="3.5,3.5"/>
                        {[28,36,44,52].map((y,j)=><circle key={j} cx={x} cy={y} r="2.5" fill={i%2===0?'rgba(255,100,20,0.8)':'rgba(255,210,0,0.75)'}/>)}
                      </g>
                    ))}
                    {/* Wave shimmer */}
                    <path d="M0,28 Q10,24 20,28 Q30,32 40,28 Q50,24 60,28 Q70,32 80,28" fill="rgba(180,220,255,0.2)" className="it-wave-y"/>
                    <path d="M0,34 Q10,31 20,34 Q30,37 40,34 Q50,31 60,34 Q70,37 80,34" fill="rgba(100,180,255,0.12)" className="it-wave-y" style={{animationDelay:'0.4s'}}/>
                    {/* Swimmer  -  FIXED in lane 3 (x=26 to x=39), bobbing not sliding */}
                    <g className="it-bob" style={{transformOrigin:'32px 34px', animationDelay:'0.2s'}}>
                      {/* Body streamlined */}
                      <rect x="18" y="29" width="22" height="7" rx="3.5" fill="rgba(20,80,200,0.92)"/>
                      {/* Head with cap */}
                      <circle cx="30" cy="27" r="6" fill="rgba(230,185,140,0.97)"/>
                      <ellipse cx="30" cy="23" rx="6" ry="3.5" fill="rgba(220,30,30,0.92)"/>
                      {/* Goggles */}
                      <ellipse cx="27.5" cy="27" rx="2.2" ry="1.6" fill="rgba(30,140,255,0.88)"/>
                      <ellipse cx="33" cy="27" rx="2.2" ry="1.6" fill="rgba(30,140,255,0.88)"/>
                      <line x1="29.5" y1="27" x2="31" y2="27" stroke="rgba(20,100,200,0.7)" strokeWidth="1"/>
                      {/* Legs kicking */}
                      <path d="M18,33 Q14,37 10,33" fill="none" stroke="rgba(230,185,140,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M18,33 Q14,29 10,34" fill="none" stroke="rgba(230,185,140,0.85)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Lead arm  -  forward stroke */}
                      <path d="M38,31 Q43,23 48,25" fill="none" stroke="rgba(230,185,140,0.92)" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="48" cy="25" r="3.5" fill="rgba(230,185,140,0.92)"/>
                      {/* Water splash */}
                      <ellipse cx="46" cy="26" rx="5" ry="3" fill="rgba(200,235,255,0.5)"/>
                      {/* Recovery arm */}
                      <path d="M24,31 Q18,25 14,27" fill="none" stroke="rgba(230,185,140,0.8)" strokeWidth="3.5" strokeLinecap="round"/>
                    </g>
                  </>),
                  // ── ART  -  painter at easel creating art ──────────────────────
                  'Art': (<>
                    {/* Easel legs */}
                    <line x1="30" y1="8" x2="18" y2="58" stroke={c(0.6)} strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="50" y1="8" x2="62" y2="58" stroke={c(0.6)} strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="40" y1="46" x2="40" y2="58" stroke={c(0.55)} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="22" y1="44" x2="58" y2="44" stroke={c(0.5)} strokeWidth="1.5"/>
                    {/* Canvas */}
                    <rect x="22" y="6" width="36" height="38" rx="2" fill="rgba(255,252,245,0.97)" stroke={c(0.6)} strokeWidth="1.5"/>
                    {/* Painting on canvas */}
                    <rect x="23" y="7" width="34" height="16" rx="1" fill="rgba(135,200,255,0.7)"/>
                    <ellipse cx="30" cy="14" rx="5" ry="3" fill="rgba(255,255,255,0.6)"/>
                    <ellipse cx="44" cy="12" rx="6" ry="3.5" fill="rgba(255,255,255,0.55)"/>
                    <rect x="23" y="23" width="34" height="20" rx="1" fill="rgba(40,160,50,0.65)"/>
                    <ellipse cx="32" cy="22" rx="7" ry="5" fill="rgba(30,140,40,0.72)"/>
                    <rect x="31" y="25" width="3" height="18" fill="rgba(100,60,20,0.72)"/>
                    <ellipse cx="48" cy="24" rx="6" ry="4" fill="rgba(25,130,35,0.65)"/>
                    <rect x="47" y="27" width="3" height="16" fill="rgba(100,60,20,0.65)"/>
                    {/* Active brushstroke */}
                    <path className="it-draw" d="M24,36 Q32,30 42,34 Q50,38 54,32" fill="none" stroke="rgba(255,100,20,0.9)" strokeWidth="3" strokeDasharray="50" strokeLinecap="round"/>
                    {/* Hand + brush  -  arm coming in from right, brush tip at stroke end */}
                    <g className="it-bob" style={{transformOrigin:'62px 18px', animationDelay:'1.0s'}}>
                      {/* Arm */}
                      <path d="M78,4 Q70,12 60,26 Q57,30 55,33" fill="none" stroke="rgba(230,185,145,0.95)" strokeWidth="5" strokeLinecap="round"/>
                      {/* Brush handle */}
                      <line x1="72" y1="6" x2="55" y2="33" stroke="rgba(130,90,40,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Ferrule */}
                      <rect x="58" y="28" width="5" height="4" rx="1" fill="rgba(180,180,180,0.88)"/>
                      {/* Bristles  -  paint-loaded orange */}
                      <ellipse cx="55.5" cy="34.5" rx="2.5" ry="4.5" fill="rgba(255,100,20,0.92)"/>
                    </g>
                    {/* Palette */}
                    <ellipse cx="10" cy="44" rx="9" ry="11" fill="rgba(230,210,180,0.8)"/>
                    <circle cx="6"  cy="36" r="2.5" fill="rgba(255,80,80,0.85)"/>
                    <circle cx="12" cy="34" r="2.5" fill="rgba(255,200,0,0.85)"/>
                    <circle cx="16" cy="38" r="2.5" fill="rgba(50,180,50,0.85)"/>
                    <circle cx="17" cy="45" r="2.5" fill="rgba(60,100,255,0.85)"/>
                    <circle cx="12" cy="50" r="2.5" fill="rgba(200,60,200,0.85)"/>
                    <circle cx="6"  cy="50" r="2.5" fill="rgba(255,130,20,0.85)"/>
                  </>),
                  // ── MUSIC  -  dark concert hall ────────────────────────────────
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
                  // ── COOKING  -  busy kitchen with food ──────────────────────────
                  'Cooking': (<>
                    {/* Kitchen counter */}
                    <rect x="0"  y="46" width="80" height="14" fill="rgba(100,70,30,0.65)"/>
                    <rect x="0"  y="44" width="80" height="4"  rx="1" fill="rgba(120,90,40,0.7)"/>
                    {/* Chef figure  -  left */}
                    <g className="it-bob" style={{transformOrigin:'14px 24px', animationDelay:'1.2s'}}>
                      {/* Chef hat */}
                      <ellipse cx="14" cy="7" rx="7" ry="3" fill="rgba(245,242,238,0.95)"/>
                      <rect x="9" y="1" width="10" height="8" rx="1" fill="rgba(245,242,238,0.95)"/>
                      <rect x="8" y="8.5" width="12" height="3" rx="1" fill="rgba(220,218,212,0.88)"/>
                      {/* Head */}
                      <circle cx="14" cy="17" r="6" fill="rgba(240,200,165,0.97)"/>
                      <circle cx="12" cy="16.5" r="1.2" fill="rgba(80,50,20,0.9)"/>
                      <circle cx="16" cy="16.5" r="1.2" fill="rgba(80,50,20,0.9)"/>
                      <path d="M12,19 Q14,21 16,19" fill="none" stroke="rgba(180,80,80,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* Chef coat */}
                      <polygon points="8,23 20,23 22,44 6,44" fill="rgba(245,242,238,0.9)"/>
                      {[27,32,37].map(y=><circle key={y} cx="14" cy={y} r="1.2" fill="rgba(200,195,190,0.7)"/>)}
                      {/* Arms */}
                      <path d="M8,28 Q2,30 2,36" fill="none" stroke="rgba(245,242,238,0.9)" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M20,28 Q26,24 28,20" fill="none" stroke="rgba(245,242,238,0.9)" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="28" cy="20" r="3.5" fill="rgba(240,200,165,0.95)"/>
                    </g>
                    {/* Large cooking pot */}
                    <ellipse cx="46" cy="38" rx="18" ry="8" fill="rgba(70,55,55,0.85)"/>
                    <rect x="28" y="24" width="36" height="16" rx="4" fill="rgba(80,62,62,0.9)"/>
                    <path d="M28,30 Q20,30 20,34 Q20,38 28,38" fill="none" stroke="rgba(80,62,62,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                    <path d="M64,30 Q72,30 72,34 Q72,38 64,38" fill="none" stroke="rgba(80,62,62,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
                    {/* Stew */}
                    <ellipse cx="46" cy="24" rx="15" ry="5.5" fill="rgba(200,100,40,0.62)"/>
                    {/* Bubbles */}
                    {[36,44,52,58].map((x,i)=>(
                      <circle key={i} cx={x} cy={22-i%2*3} r="2.5" fill="rgba(230,130,50,0.65)" className="it-up" style={{animationDelay:`${i*0.28}s`}}/>
                    ))}
                    {/* Ladle */}
                    <rect x="44.5" y="4" width="3" height="20" rx="1.5" fill="rgba(180,140,80,0.85)" className="it-stir" style={{transformOrigin:'46px 22px'}}/>
                    <circle cx="46" cy="23" r="4" fill="none" stroke="rgba(180,140,80,0.88)" strokeWidth="2"/>
                    {/* Steam */}
                    {[0,1,2,3].map(i=>(
                      <path key={i} className="it-up" d={`M${30+i*9},18 Q${28+i*9},10 ${32+i*9},4`} fill="none" stroke="rgba(255,235,210,0.45)" strokeWidth="2.2" strokeLinecap="round" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    {/* Vegetables on counter */}
                    <circle cx="10" cy="50" r="5" fill="rgba(255,60,60,0.8)"/>
                    <circle cx="10" cy="46" r="2.5" fill="rgba(30,160,30,0.7)"/>
                    <ellipse cx="24" cy="50" rx="4" ry="5.5" fill="rgba(255,180,0,0.8)"/>
                    <ellipse cx="70" cy="50" rx="5" ry="5.5" fill="rgba(180,80,200,0.75)"/>
                    <ellipse cx="60" cy="51" rx="7" ry="4" fill="rgba(100,180,50,0.8)"/>
                  </>),
                  // ── DOLLS  -  Barbie-style dollhouse ────────────────────────────
                  'Dolls': (<>
                    {/* Glamour stars */}
                    {[{x:6,y:4},{x:14,y:14},{x:66,y:6},{x:74,y:16},{x:4,y:28},{x:76,y:26}].map(({x,y},i)=>(
                      <circle key={i} cx={x} cy={y} r={1.5+i%2*0.5} fill="rgba(255,200,220,0.85)" className="it-star" style={{animationDelay:`${i*0.3}s`}}/>
                    ))}
                    {/* Wardrobe  -  left */}
                    <rect x="4" y="8" width="18" height="50" rx="3" fill="rgba(220,80,150,0.32)"/>
                    <line x1="13" y1="8" x2="13" y2="58" stroke="rgba(200,60,130,0.28)" strokeWidth="1"/>
                    <path d="M9,16 Q6,18 5,22 Q9,24 9,26" fill="none" stroke="rgba(255,100,160,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M17,16 Q20,18 21,22 Q17,24 17,26" fill="none" stroke="rgba(180,100,220,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
                    {/* Fashion Barbie doll  -  center */}
                    <g className="it-bob" style={{transformOrigin:'48px 28px', animationDelay:'1.4s'}}>
                      {/* Long blonde hair */}
                      <path d="M42,14 Q36,20 33,32 Q35,42 39,50" fill="none" stroke="rgba(255,210,50,0.9)" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M42,14 Q37,18 34,28 Q36,38 41,48" fill="none" stroke="rgba(255,228,90,0.65)" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M54,14 Q60,20 63,32 Q61,42 57,50" fill="none" stroke="rgba(255,210,50,0.9)" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M54,14 Q59,18 62,28 Q60,38 55,48" fill="none" stroke="rgba(255,228,90,0.65)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Head */}
                      <circle cx="48" cy="13" r="8" fill="rgba(255,215,185,0.97)"/>
                      {/* Hair crown */}
                      <path d="M40,10 Q44,4 48,6 Q52,4 56,10" fill="rgba(255,210,50,0.95)"/>
                      {/* Eyes with lashes */}
                      <circle cx="44.5" cy="12.5" r="1.8" fill="rgba(60,30,80,0.92)"/>
                      <circle cx="51.5" cy="12.5" r="1.8" fill="rgba(60,30,80,0.92)"/>
                      {[-2,0,2].map(dx=><line key={dx} x1={44.5+dx*0.4} y1={11} x2={44.5+dx*0.4} y2={9.5} stroke="rgba(40,20,60,0.8)" strokeWidth="0.8"/>)}
                      {[-2,0,2].map(dx=><line key={dx+10} x1={51.5+dx*0.4} y1={11} x2={51.5+dx*0.4} y2={9.5} stroke="rgba(40,20,60,0.8)" strokeWidth="0.8"/>)}
                      {/* Cheeks + lips */}
                      <ellipse cx="44.5" cy="15" rx="2" ry="1" fill="rgba(255,140,160,0.8)"/>
                      <ellipse cx="51.5" cy="15" rx="2" ry="1" fill="rgba(255,140,160,0.8)"/>
                      <path d="M45.5,17.5 Q48,20 50.5,17.5" fill="none" stroke="rgba(220,80,120,0.88)" strokeWidth="1.3" strokeLinecap="round"/>
                      {/* Neck */}
                      <rect x="46.5" y="20" width="3" height="4" rx="1.5" fill="rgba(255,215,185,0.97)"/>
                      {/* Fitted bodice */}
                      <ellipse cx="48" cy="26" rx="5" ry="8" fill="rgba(220,50,140,0.88)"/>
                      {/* Flared skirt */}
                      <path d="M43,32 Q34,44 32,58 Q48,54 48,50 Q48,54 64,58 Q62,44 53,32 Z" fill="rgba(240,80,160,0.82)"/>
                      <path d="M43,35 Q36,46 34,58 Q48,55 48,50" fill="rgba(255,120,180,0.5)"/>
                      {/* Dress sparkles */}
                      {[[38,38],[42,46],[48,41],[54,46],[58,38]].map(([x,y],i)=>(
                        <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,230,240,0.9)" className="it-star" style={{animationDelay:`${i*0.2}s`}}/>
                      ))}
                      {/* Arms */}
                      <path d="M44,22 Q36,20 32,26" fill="none" stroke="rgba(255,215,185,0.95)" strokeWidth="3.5" strokeLinecap="round"/>
                      <circle cx="32" cy="26" r="3" fill="rgba(255,215,185,0.97)"/>
                      {/* Purse */}
                      <rect x="27" y="23" width="8" height="7" rx="2" fill="rgba(255,180,50,0.85)"/>
                      <path d="M29,23 Q31,19 33,23" fill="none" stroke="rgba(255,180,50,0.88)" strokeWidth="1.5"/>
                      <path d="M52,22 Q60,20 64,26" fill="none" stroke="rgba(255,215,185,0.95)" strokeWidth="3.5" strokeLinecap="round"/>
                      <circle cx="64" cy="26" r="3" fill="rgba(255,215,185,0.97)"/>
                      {/* Legs */}
                      <line x1="45" y1="54" x2="44" y2="60" stroke="rgba(255,215,185,0.95)" strokeWidth="3.5" strokeLinecap="round"/>
                      <line x1="51" y1="54" x2="52" y2="60" stroke="rgba(255,215,185,0.95)" strokeWidth="3.5" strokeLinecap="round"/>
                      {/* Heels */}
                      <path d="M42,60 Q44,60 44,58" fill="none" stroke="rgba(220,50,140,0.85)" strokeWidth="2.2" strokeLinecap="round"/>
                      <path d="M50,60 Q52,60 52,58" fill="none" stroke="rgba(220,50,140,0.85)" strokeWidth="2.2" strokeLinecap="round"/>
                    </g>
                  </>),
                  // ── CARS & TRUCKS  -  night highway ────────────────────────────
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
                    {/* Car zooming  -  with glowing headlights */}
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
                      {/* Headlights  -  bright yellow cones */}
                      <rect x="27" y="40" width="6" height="4" rx="1" fill="rgba(255,230,50,0.97)"/>
                      {/* Headlight beam */}
                      <polygon points="29,42 80,36 80,48" fill="rgba(255,230,50,0.06)"/>
                    </g>
                    {/* Speed lines */}
                    {[0,1,2,3].map(i=><line key={i} x1={62-i*8} y1={40+i*4} x2={80} y2={40+i*4} stroke="rgba(255,220,50,0.2)" strokeWidth="1" className="it-flash" style={{animationDelay:`${i*0.1}s`}}/>)}
                  </>),
                };
                const isLocked = isFreeUser && !TRIAL_INTERESTS.includes(option.label as typeof TRIAL_INTERESTS[number]);
                return (
                  <button
                    key={option.label}
                    className="int-tile"
                    onClick={() => {
                      if (isFreeUser && !TRIAL_INTERESTS.includes(option.label as typeof TRIAL_INTERESTS[number])) return;
                      handleInterestToggle(option.label);
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                      padding: '0 8px 12px',
                      borderRadius: '18px',
                      minHeight: '100px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
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
                          : '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1.5px #F0E4D0',
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
                    {isLocked && (
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 2, borderRadius: 'inherit',
                        background: 'rgba(8,12,28,0.70)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '4px 6px 10px',
                      }}>
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                          <rect x="1" y="11" width="18" height="12" rx="2.5"
                            fill="rgba(255,255,255,0.88)"/>
                          <path d="M5 11V7.5a5 5 0 0 1 10 0V11"
                            stroke="rgba(255,255,255,0.88)" strokeWidth="2.2"
                            strokeLinecap="round" fill="none"/>
                          <circle cx="10" cy="17" r="2" fill="rgba(8,12,28,0.5)"/>
                          <line x1="10" y1="17" x2="10" y2="19.5"
                            stroke="rgba(8,12,28,0.5)" strokeWidth="1.8"
                            strokeLinecap="round"/>
                        </svg>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: '700',
                          color: 'rgba(255,255,255,0.80)', textAlign: 'center',
                          letterSpacing: '0.02em', lineHeight: 1.2,
                        }}>{option.label}</span>
                      </div>
                    )}
                    <span style={{ position: 'relative', zIndex: 1, fontSize: '0.75rem', fontWeight: '800', lineHeight: 1.2, textAlign: 'center', color: (active || !!darkBg) ? 'rgba(255,255,255,1)' : '#0D183D', letterSpacing: '0.03em', textShadow: (active || !!darkBg) ? '0 1px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(255,255,255,0.9)' }}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Premium upsell */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #FFF4E6 0%, #FFF0E0 100%)', border: '1.5px solid #FFD4A8', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#5E3A0A', lineHeight: 1.4 }}>
                <strong style={{ color: '#C85A00' }}>Premium</strong> unlocks up to 5 interests, all locked tiles, and custom themes.
              </p>
            </div>

            {/* Custom interests added  -  shown above the input with X to remove */}
            {(() => {
              const builtInLabels = INTEREST_OPTIONS.map(o => o.label);
              const customAdded = state.interests.filter(i => !builtInLabels.includes(i));
              return customAdded.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {customAdded.map(interest => (
                    <span key={interest} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF0E6', border: '1.5px solid #FF6B35', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#FF6B35', fontWeight: '600' }}>
                      {interest}
                      <button onClick={() => handleInterestToggle(interest)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6B35', padding: 0, fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>×</button>
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Add custom interest input */}
            {interestError && (
              <p style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '500' }}>{interestError}</p>
            )}
            {isFreeUser ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text" disabled
                    style={{ ...inputStyle, width: '100%', opacity: 0.55, cursor: 'not-allowed', backgroundColor: '#F2F4F8', paddingRight: '40px', boxSizing: 'border-box' }}
                    placeholder="Subscribe to add your own interest" />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔒</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="Custom interests — Premium only (e.g. Ballet)" disabled value={state.customInterest} style={{ opacity: 0.55, cursor: 'not-allowed' }}
                  onChange={(e) => { setState({ ...state, customInterest: e.target.value }); setInterestError(''); }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()} />
                {state.customInterest.trim() && (
                  <button onClick={handleAddCustomInterest} className="btn-brand" style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}>Add</button>
                )}
              </div>
            )}

            {state.interests.length === 0 && (
              <p style={{ color: '#FF6B35', marginBottom: '12px', fontSize: '0.875rem', fontWeight: '500' }}>Select at least 1 interest</p>
            )}

            {isFreeUser ? (
              /* Free users: single button to generate free sample story */
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                  onClick={handleNext}
                  disabled={state.interests.length < 1}
                  className="btn-brand"
                  style={{
                    flex: 1, padding: '0.75rem 1.75rem',
                    opacity: state.interests.length < 1 ? 0.5 : 1,
                    cursor: state.interests.length < 1 ? 'not-allowed' : 'pointer',
                  }}>
                  Next step
                </button>
                <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
              </div>
            ) : (
              /* Subscribers: normal single next button */
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button onClick={handleNext} disabled={state.interests.length < 1} className="btn-brand"
                  style={{ flex: 1, padding: '0.75rem 1.75rem', opacity: state.interests.length < 1 ? 0.5 : 1, cursor: state.interests.length < 1 ? 'not-allowed' : 'pointer' }}>
                  Next step
                </button>
                <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Follow-up questions based on interests ── */}
        {state.step === 4 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#0D183D' }}>Let's get specific!</h1>
            <p style={{ color: '#5E6A7A', marginBottom: '32px', fontSize: '0.95rem' }}>
              These details make {state.name || 'your child'}'s story feel like it was written just for them. Skip any you don't know.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {followUpSections.map(({ interest, emoji, questions }) => (
                <div key={interest} style={{ borderLeft: '3px solid #F0E4D0', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: '#FFF0E6', fontSize: '1.15rem', flexShrink: 0,
                    }}>{emoji}</span>
                    <p style={{ fontWeight: '600', color: '#0D183D', margin: 0, fontSize: '0.95rem' }}>{interest}</p>
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
                <div style={{ borderLeft: '3px solid #F0E4D0', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#FFF0E6', fontSize: '0.85rem', flexShrink: 0, fontWeight: '700', color: '#FF6B35' }}>+</span>
                    <p style={{ fontWeight: '600', color: '#0D183D', margin: 0, fontSize: '0.95rem' }}>Other interests</p>
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
              <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Appearance & Details ── */}
        {state.step === 5 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#0D183D' }}>Almost there!</h1>
            <p style={{ color: '#5E6A7A', marginBottom: '28px', fontSize: '0.95rem' }}>
              A few more details to make {state.name || 'their'} stories feel truly personal
            </p>

            {/* Appearance */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Appearance <span style={{ color: '#5E6A7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>Skin colour</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    {[
                      { label: 'White',      hex: '#F5D5B5' },
                      { label: 'Tanned',     hex: '#C8956C' },
                      { label: 'Semi Brown', hex: '#8D5524' },
                      { label: 'Brown',      hex: '#4A2512' },
                    ].map(({ label, hex }) => (
                      <button key={label} type="button" title={label}
                        onClick={() => setState({ ...state, skinColour: state.skinColour === label ? '' : label })}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: hex, border: state.skinColour === label ? '3px solid #FF6B35' : '3px solid transparent',
                          outline: state.skinColour === label ? '2px solid #FF6B35' : '2px solid #E0CDB8',
                          outlineOffset: '2px', cursor: 'pointer', flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
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
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Where do they live? <span style={{ color: '#5E6A7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>City</label>
                  <input type="text" style={inputStyle} placeholder="" value={state.city} onChange={(e) => setState({ ...state, city: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Country</label>
                  <input type="text" style={inputStyle} placeholder="" value={state.country} onChange={(e) => setState({ ...state, country: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Family */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Family <span style={{ color: '#5E6A7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              {state.siblings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {state.siblings.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <select value={s.nickname || 'Brother'}
                        onChange={(e) => { const u = [...state.siblings]; u[i] = { ...u[i], nickname: e.target.value }; setState({ ...state, siblings: u }); }}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        {['Mum','Dad','Brother','Sister','Uncle','Aunt','Cousin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <input type="text" style={inputStyle} placeholder="Name" value={s.name}
                        onChange={(e) => { const u = [...state.siblings]; u[i] = { ...u[i], name: e.target.value }; setState({ ...state, siblings: u }); }} />
                      <button onClick={() => setState({ ...state, siblings: state.siblings.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: '1.5px solid #F0E4D0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#5E6A7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setState({ ...state, siblings: [...state.siblings, { name: '', nickname: 'Brother' }] })}
                style={{ ...chipBase, border: '1.5px dashed #F0E4D0', backgroundColor: 'transparent', color: '#5E6A7A', width: '100%' }}>
                + Add family member
              </button>
            </div>

            {/* Best friends */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Best friends <span style={{ color: '#5E6A7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              {state.friends.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {state.friends.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input type="text" style={inputStyle} placeholder="Name" value={f.name}
                        onChange={(e) => { const u = [...state.friends]; u[i] = { ...u[i], name: e.target.value }; setState({ ...state, friends: u }); }} />
                      <input type="text" style={inputStyle} placeholder="Nickname (optional)" value={f.nickname}
                        onChange={(e) => { const u = [...state.friends]; u[i] = { ...u[i], nickname: e.target.value }; setState({ ...state, friends: u }); }} />
                      <button onClick={() => setState({ ...state, friends: state.friends.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: '1.5px solid #F0E4D0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#5E6A7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setState({ ...state, friends: [...state.friends, { name: '', nickname: '' }] })}
                style={{ ...chipBase, border: '1.5px dashed #F0E4D0', backgroundColor: 'transparent', color: '#5E6A7A', width: '100%' }}>
                + Add friend
              </button>
            </div>

            {/* Pets */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Pets <span style={{ color: '#5E6A7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              {state.pets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {state.pets.map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input type="text" style={inputStyle} placeholder="Name" value={p.name}
                        onChange={(e) => { const u = [...state.pets]; u[i] = { ...u[i], name: e.target.value }; setState({ ...state, pets: u }); }} />
                      <input type="text" style={inputStyle} placeholder="Type (e.g. Dog)" value={p.type}
                        onChange={(e) => { const u = [...state.pets]; u[i] = { ...u[i], type: e.target.value }; setState({ ...state, pets: u }); }} />
                      <button onClick={() => setState({ ...state, pets: state.pets.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: '1.5px solid #F0E4D0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#5E6A7A', fontSize: '1rem', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setState({ ...state, pets: [...state.pets, { name: '', type: '' }] })}
                style={{ ...chipBase, border: '1.5px dashed #F0E4D0', backgroundColor: 'transparent', color: '#5E6A7A', width: '100%' }}>
                + Add pet
              </button>
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
                {submitting ? (isFreeUser ? 'Generating your story...' : 'Creating profile...') : (isFreeUser ? 'Generate my free story' : `Create ${state.name || 'profile'}`)}
              </button>
              <button onClick={handleBack} disabled={submitting}
                style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

