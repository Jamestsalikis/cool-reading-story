'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  onClose: () => void;
};

export default function FeedbackModal({ onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('feedback').insert({
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      // Record last feedback date in localStorage so we don't ask again for 7 days
      localStorage.setItem('last_feedback_at', new Date().toISOString());
    }

    setDone(true);
    setTimeout(onClose, 1800);
  };

  const stars = [1, 2, 3, 4, 5];
  const activeRating = hovered || rating;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#FFFEF9', borderRadius: '20px', padding: '36px 32px',
        maxWidth: '420px', width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}>
        {done ? (
          <div>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌟</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1A1209', marginBottom: '8px' }}>
              Thank you!
            </h2>
            <p style={{ color: '#6B5E4E', fontSize: '0.95rem' }}>Your feedback helps us make better stories.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1A1209', marginBottom: '8px' }}>
              How are you enjoying Cool Reading Story?
            </h2>
            <p style={{ color: '#6B5E4E', fontSize: '0.875rem', marginBottom: '28px' }}>
              Takes 30 seconds — helps us make it better for your child.
            </p>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
              {stars.map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '2.2rem', padding: '4px',
                    filter: s <= activeRating ? 'none' : 'grayscale(1) opacity(0.3)',
                    transform: s <= activeRating ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>

            {/* Star label */}
            {activeRating > 0 && (
              <p style={{ color: '#741515', fontWeight: '600', fontSize: '0.875rem', marginBottom: '16px' }}>
                {['', 'Not great', 'Could be better', 'Pretty good', 'Really good', 'Love it!'][activeRating]}
              </p>
            )}

            {/* Comment */}
            <textarea
              placeholder="Anything you'd like us to know? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid #E8E0D0', borderRadius: '10px',
                fontSize: '0.9rem', fontFamily: 'inherit',
                resize: 'none', outline: 'none',
                color: '#1A1209', background: '#FAF7F0',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '0.75rem',
                  border: '1.5px solid #E8E0D0', borderRadius: '10px',
                  background: 'transparent', color: '#6B5E4E',
                  cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
                }}
              >
                Maybe later
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating || submitting}
                style={{
                  flex: 2, padding: '0.75rem',
                  borderRadius: '10px', border: 'none',
                  background: rating ? '#741515' : '#E8E0D0',
                  color: rating ? '#fff' : '#9B8B7A',
                  cursor: rating ? 'pointer' : 'not-allowed',
                  fontWeight: '600', fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Sending...' : 'Send feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
