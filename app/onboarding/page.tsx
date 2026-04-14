'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  petName: string;
  petType: string;
  readingLevel: string;
};

const INTEREST_OPTIONS = [
  { emoji: '🦕', label: 'Dinosaurs' },
  { emoji: '🚀', label: 'Space' },
  { emoji: '🧚', label: 'Fairies' },
  { emoji: '⚽', label: 'Sport' },
  { emoji: '🐾', label: 'Animals' },
  { emoji: '🌊', label: 'Ocean' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🧙', label: 'Fantasy' },
  { emoji: '🤖', label: 'Robots' },
  { emoji: '🦄', label: 'Unicorns' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🔬', label: 'Science' },
];

export default function OnboardingPage() {
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
    petName: '',
    petType: '',
    readingLevel: '',
  });

  const [showCustomInterest, setShowCustomInterest] = useState(false);

  const handleNext = () => {
    if (state.step < 4) {
      setState({ ...state, step: state.step + 1 });
    } else {
      // Submit profile - in production, send to API
      console.log('Profile created:', state);
    }
  };

  const handleBack = () => {
    if (state.step > 2) {
      setState({ ...state, step: state.step - 1 });
    }
  };

  const handleInterestToggle = (label: string) => {
    setState((prev) => {
      const isSelected = prev.interests.includes(label);
      return {
        ...prev,
        interests: isSelected
          ? prev.interests.filter((i) => i !== label)
          : [...prev.interests, label],
      };
    });
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

  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
      {[2, 3, 4].map((step) => (
        <div
          key={step}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: state.step >= step ? '#741515' : '#E8E0D0',
            transition: 'background-color 0.3s',
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {state.step === 2 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>
              Tell us about your child
            </h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>
              This is how they'll appear as the hero of every story
            </p>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1A1209' }}>
                What is their name?
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Leo"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                style={{ fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1A1209' }}>
                How old are they?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={() => setState({ ...state, age: Math.max(3, state.age - 1) })}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1.5px solid #E8E0D0',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = '#741515';
                    (e.target as HTMLButtonElement).style.color = '#741515';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = '#E8E0D0';
                    (e.target as HTMLButtonElement).style.color = '#1A1209';
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '1.5rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                  {state.age}
                </span>
                <button
                  onClick={() => setState({ ...state, age: Math.min(12, state.age + 1) })}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1.5px solid #E8E0D0',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = '#741515';
                    (e.target as HTMLButtonElement).style.color = '#741515';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = '#E8E0D0';
                    (e.target as HTMLButtonElement).style.color = '#1A1209';
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1A1209' }}>
                Gender
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Boy', 'Girl', 'Non-binary', 'Skip'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setState({ ...state, gender: option })}
                    className={`chip ${state.gender === option ? 'active' : ''}`}
                    style={{
                      cursor: 'pointer',
                      border: state.gender === option ? '1.5px solid #741515' : '1.5px solid #E8E0D0',
                      backgroundColor: state.gender === option ? '#741515' : '#fff',
                      color: state.gender === option ? '#fff' : '#1A1209',
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={handleNext}
                className="btn-brand"
                style={{ flex: 1, padding: '0.75rem 1.75rem' }}
              >
                Next step
              </button>
              <Link href="/signup" style={{ color: '#741515', textDecoration: 'none', fontWeight: '500' }}>
                Back
              </Link>
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>
              What does {state.name || 'your child'} love?
            </h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>
              Select at least 2 — these will shape every story
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {INTEREST_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleInterestToggle(option.label)}
                    className={`chip ${state.interests.includes(option.label) ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: state.interests.includes(option.label) ? '1.5px solid #741515' : '1.5px solid #E8E0D0',
                      backgroundColor: state.interests.includes(option.label) ? '#741515' : '#fff',
                      color: state.interests.includes(option.label) ? '#fff' : '#1A1209',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              {!showCustomInterest ? (
                <button
                  onClick={() => setShowCustomInterest(true)}
                  className="chip"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '12px',
                  }}
                >
                  + Add your own
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Dinosaurs"
                    value={state.customInterest}
                    onChange={(e) => setState({ ...state, customInterest: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
                  />
                  <button
                    onClick={handleAddCustomInterest}
                    className="btn-brand"
                    style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
                  >
                    Add
                  </button>
                </div>
              )}

              {state.interests.length > 0 && state.interests.length < 2 && (
                <p style={{ color: '#741515', marginTop: '12px', fontSize: '0.875rem', fontWeight: '500' }}>
                  Select at least 2 interests
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={handleNext}
                disabled={state.interests.length < 2}
                className="btn-brand"
                style={{
                  flex: 1,
                  padding: '0.75rem 1.75rem',
                  opacity: state.interests.length < 2 ? 0.5 : 1,
                  cursor: state.interests.length < 2 ? 'not-allowed' : 'pointer',
                }}
              >
                Next step
              </button>
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#741515',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: 0,
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {state.step === 4 && (
          <div>
            <ProgressDots />
            <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1209' }}>
              Almost there!
            </h1>
            <p style={{ color: '#6B5E4E', marginBottom: '32px', fontSize: '0.95rem' }}>
              A few final details to make {state.name || 'their'} stories perfect
            </p>

            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#1A1209' }}>Appearance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>
                    Hair colour
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Brown"
                    value={state.hairColour}
                    onChange={(e) => setState({ ...state, hairColour: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>
                    Eye colour
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Blue"
                    value={state.eyeColour}
                    onChange={(e) => setState({ ...state, eyeColour: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#6B5E4E' }}>
                Sibling names (optional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Marcus, Sophie"
                value={state.siblingNames}
                onChange={(e) => setState({ ...state, siblingNames: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#6B5E4E' }}>
                Pet name & type (optional)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Pet name"
                  value={state.petName}
                  onChange={(e) => setState({ ...state, petName: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Dog"
                  value={state.petType}
                  onChange={(e) => setState({ ...state, petType: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1A1209' }}>
                Reading level
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { id: 'simple', label: 'Simple (ages 3-5)' },
                  { id: 'medium', label: 'Medium (ages 6-8)' },
                  { id: 'imaginative', label: 'Imaginative (ages 9-12)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setState({ ...state, readingLevel: option.id })}
                    className={`chip ${state.readingLevel === option.id ? 'active' : ''}`}
                    style={{
                      cursor: 'pointer',
                      border: state.readingLevel === option.id ? '1.5px solid #741515' : '1.5px solid #E8E0D0',
                      backgroundColor: state.readingLevel === option.id ? '#741515' : '#fff',
                      color: state.readingLevel === option.id ? '#fff' : '#1A1209',
                      padding: '0.5rem 1rem',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={handleNext}
                className="btn-brand"
                style={{ flex: 1, padding: '0.75rem 1.75rem' }}
              >
                Create {state.name || 'profile'}
              </button>
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#741515',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: 0,
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
