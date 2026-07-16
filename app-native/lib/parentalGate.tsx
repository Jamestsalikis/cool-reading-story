'use client';

/**
 * Parental gate for the native app (Apple Kids Category / Google Families rules).
 *
 * Apple guideline 1.3 and Google's Families policy require that purchases and
 * links that leave the app are placed behind a parental gate in apps aimed at
 * children. TalePop is published as Made for Kids, so any checkout must pass
 * this gate first.
 *
 * Usage:
 *   1. Mount <ParentalGateHost /> once, high in the tree (done in app/layout.tsx).
 *   2. Before starting a purchase or opening an external link, call
 *      `if (!(await verifyParent())) return;`
 *
 * On the website (no Capacitor) verifyParent() resolves true immediately, so the
 * web purchase flow is unchanged.
 */

import { useEffect, useState } from 'react';
import { isNativeApp } from './iap';

type GateState = { resolve: (ok: boolean) => void; a: number; b: number };

// Module-level hook registered by the mounted host.
let openGate: (() => Promise<boolean>) | null = null;

/**
 * Resolves true if the user is allowed to proceed (parent verified, or running
 * on the web where no gate is required). Resolves false if the gate is
 * cancelled or failed.
 */
export async function verifyParent(): Promise<boolean> {
  if (!isNativeApp()) return true;   // website: no gate needed
  if (!openGate) return true;         // host not mounted (fail-open, web-safe)
  return openGate();
}

export function ParentalGateHost() {
  const [state, setState] = useState<GateState | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    openGate = () =>
      new Promise<boolean>((resolve) => {
        // Two single digits 2-9; multiplication keeps it out of reach of young children.
        const a = 2 + Math.floor(Math.random() * 8);
        const b = 2 + Math.floor(Math.random() * 8);
        setAnswer('');
        setError(false);
        setState({ resolve, a, b });
      });
    return () => {
      openGate = null;
    };
  }, []);

  if (!state) return null;

  const finish = (ok: boolean) => {
    state.resolve(ok);
    setState(null);
  };

  const submit = () => {
    if (parseInt(answer, 10) === state.a * state.b) finish(true);
    else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#FFFEF9', borderRadius: '20px', padding: '32px 28px',
          maxWidth: '380px', width: '100%', textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: '#C4784A', textTransform: 'uppercase', marginBottom: '10px' }}>
          Ask a grown-up
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#1C1614', marginBottom: '8px' }}>
          Parents only
        </h2>
        <p style={{ color: '#6B5E4E', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
          To continue, please solve this to confirm you are an adult.
        </p>

        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1C1614', marginBottom: '14px' }}>
          {state.a} × {state.b} = ?
        </div>

        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          autoFocus
          style={{
            width: '120px', padding: '12px', fontSize: '1.2rem', textAlign: 'center',
            borderRadius: '12px', border: error ? '2px solid #B3261E' : '2px solid #E8E0D0',
            marginBottom: error ? '6px' : '18px', outline: 'none',
          }}
        />
        {error && (
          <p style={{ color: '#B3261E', fontSize: '0.8rem', marginBottom: '14px' }}>
            Not quite — try again.
          </p>
        )}

        <button
          onClick={submit}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: '#741515', color: '#fff', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', marginBottom: '10px',
          }}
        >
          Continue
        </button>
        <button
          onClick={() => finish(false)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#9B8B7A', cursor: 'pointer', fontSize: '0.875rem', padding: '6px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
