'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createChild } from '@/lib/supabase/child-actions';

type OnboardingState = {
  step: number;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  customInterest: string;
  hairColour: string;
  eyeColour: string;
  siblingNames: string;
  siblingNicknames: string;
  bestFriendName: string;
  bestFriendNickname: string;
  petName: string;
  petType: string;
  city: string;
  country: string;
  readingLevel: string;
};

const INTEREST_OPTIONS = [
  // Adventure & Fantasy
  { emoji: '🦸', label: 'Superheroes' },
  { emoji: '🧙', label: 'Fantasy' },
  { emoji: '🧚', label: 'Fairies' },
  { emoji: '🦄', label: 'Unicorns' },
  { emoji: '👑', label: 'Princesses' },
  { emoji: '🏴‍☠️', label: 'Pirates' },
  { emoji: '🪄', label: 'Magic' },
  { emoji: '👽', label: 'Aliens' },
  // Nature & Animals
  { emoji: '🦕', label: 'Dinosaurs' },
  { emoji: '🐾', label: 'Animals' },
  { emoji: '🌊', label: 'Ocean' },
  { emoji: '🌿', label: 'Nature' },
  // Science & Tech
  { emoji: '🚀', label: 'Space' },
  { emoji: '🤖', label: 'Robots' },
  { emoji: '🔬', label: 'Science' },
  { emoji: '🎮', label: 'Gaming' },
  // Sports
  { emoji: '⚽', label: 'Soccer' },
  { emoji: '🏈', label: 'Football' },
  { emoji: '🤸', label: 'Gymnastics' },
  { emoji: '💃', label: 'Dancing' },
  { emoji: '🥋', label: 'Karate' },
  { emoji: '🏊', label: 'Swimming' },
  // Creative
  { emoji: '🎨', label: 'Art' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🍳', label: 'Cooking' },
  // Toys & Play
  { emoji: '🪆', label: 'Dolls' },
  { emoji: '🚗', label: 'Cars & Trucks' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    step: 2,
    name: '',
    age: 6,
    gender: '',
    interests: [],
    customInterest: '',
    hairColour: '',
    eyeColour: '',
    siblingNames: '',
    siblingNicknames: '',
    bestFriendName: '',
    bestFriendNickname: '',
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

  const handleNext = async () => {
    if (state.step === 2) {
      if (!state.name.trim()) {
        setNameError('Please enter your child\'s name');
        return;
      }
      setNameError('');
      setState({ ...state, step: state.step + 1 });
    } else if (state.step < 4) {
      setState({ ...state, step: state.step + 1 });
    } else {
      setSubmitting(true);
      setSubmitError('');
      try {
        const result = await createChild({
          name: state.name,
          age: state.age,
          gender: state.gender,
          interests: state.interests,
          hairColour: state.hairColour,
          eyeColour: state.eyeColour,
          siblingNames: state.siblingNames,
          siblingNicknames: state.siblingNicknames,
          bestFriendName: state.bestFriendName,
          bestFriendNickname: state.bestFriendNickname,
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

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    border: '1.5px solid #E8E0D0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#1A1209',
  };

  const chipBase = {
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '500' as const,
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
    transition: 'all 0.15s',
  };

  const chip = (active: boolean) => ({
    ...chipBase,
    border: active ? '1.5px solid #741515' : '1.5px solid #E8E0D0',
    backgroundColor: active ? '#741515' : '#fff',
    color: active ? '#fff' : '#1A1209',
  });

  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
      {[2, 3, 4].map((step) => (
        <div key={step} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: state.step >= step ? '#741515' : '#E8E0D0', transition: 'background-color 0.3s' }} />
      ))}
    </div>
  );

  const labelStyle = { display: 'block' as const, marginBottom: '8px', fontWeight: '500' as const, color: '#1A1209', fontSize: '0.9rem' };
  const optionalLabel = { ...labelStyle, color: '#6B5E4E' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Step 2 — Name, age, gender */}
        {state.step === 2 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>Tell us about your child</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>This is how they'll appear as the hero of every story</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Child's name <span style={{ color: '#741515' }}>*</span></label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: nameError ? '#991B1B' : '#E8E0D0' }}
                placeholder="e.g. Leo"
                value={state.name}
                onChange={(e) => { setState({ ...state, name: e.target.value }); setNameError(''); }}
              />
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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {['Boy', 'Girl', 'Skip'].map((option) => (
                  <button key={option} onClick={() => setState({ ...state, gender: option })} style={chip(state.gender === option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={handleNext} className="btn-brand" style={{ flex: 1, padding: '0.75rem 1.75rem' }}>Next step</button>
              <Link href="/signup" style={{ color: '#741515', textDecoration: 'none', fontWeight: '500' }}>Back</Link>
            </div>
          </div>
        )}

        {/* Step 3 — Interests */}
        {state.step === 3 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>What does {state.name || 'your child'} love?</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>Select at least 2 — these shape every story</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {INTEREST_OPTIONS.map((option) => {
                const active = state.interests.includes(option.label);
                return (
                  <button
                    key={option.label}
                    onClick={() => handleInterestToggle(option.label)}
                    style={{
                      ...chip(active),
                      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '5px',
                      padding: '12px 8px', fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{option.emoji}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>

            {!showCustomInterest ? (
              <button onClick={() => setShowCustomInterest(true)} style={{ ...chipBase, border: '1.5px solid #E8E0D0', backgroundColor: '#fff', color: '#1A1209', width: '100%', marginBottom: '16px' }}>
                + Add your own
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input type="text" style={inputStyle} placeholder="e.g. Ballet" value={state.customInterest} onChange={(e) => setState({ ...state, customInterest: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()} />
                <button onClick={handleAddCustomInterest} className="btn-brand" style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' as const }}>Add</button>
              </div>
            )}

            {state.interests.length > 0 && state.interests.length < 2 && (
              <p style={{ color: '#741515', marginBottom: '12px', fontSize: '0.875rem', fontWeight: '500' }}>Select at least 2 interests</p>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={handleNext} disabled={state.interests.length < 2} className="btn-brand" style={{ flex: 1, padding: '0.75rem 1.75rem', opacity: state.interests.length < 2 ? 0.5 : 1, cursor: state.interests.length < 2 ? 'not-allowed' : 'pointer' }}>
                Next step
              </button>
              <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#741515', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}

        {/* Step 4 — Details */}
        {state.step === 4 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>Almost there!</h1>
            <p style={{ color: '#6B5E4E', marginBottom: '28px', fontSize: '0.95rem' }}>A few more details to make {state.name || 'their'} stories feel truly personal</p>

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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>Sibling names</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Marcus, Sophie" value={state.siblingNames} onChange={(e) => setState({ ...state, siblingNames: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Sibling nicknames</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Marc, Soph" value={state.siblingNicknames} onChange={(e) => setState({ ...state, siblingNicknames: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Best friend */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Best friend <span style={{ color: '#9B8B7A', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={optionalLabel}>Name</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Olivia" value={state.bestFriendName} onChange={(e) => setState({ ...state, bestFriendName: e.target.value })} />
                </div>
                <div>
                  <label style={optionalLabel}>Nickname</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Livvy" value={state.bestFriendNickname} onChange={(e) => setState({ ...state, bestFriendNickname: e.target.value })} />
                </div>
              </div>
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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {[
                  { id: 'simple', label: 'Simple', sub: 'Ages 3–5' },
                  { id: 'medium', label: 'Medium', sub: 'Ages 6–8' },
                  { id: 'imaginative', label: 'Imaginative', sub: 'Ages 9–12' },
                ].map((option) => {
                  const active = state.readingLevel === option.id;
                  return (
                    <button key={option.id} onClick={() => setState({ ...state, readingLevel: option.id })} style={{ ...chip(active), display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '2px', padding: '10px 20px' }}>
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
              <button onClick={handleNext} disabled={submitting} className="btn-brand" style={{ flex: 1, padding: '0.75rem 1.75rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Creating profile...' : `Create ${state.name || 'profile'}`}
              </button>
              <button onClick={handleBack} disabled={submitting} style={{ background: 'none', border: 'none', color: '#741515', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
