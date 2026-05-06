'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, Check, Shield, RefreshCw, Star, Heart } from 'lucide-react';

const S = `
  .hero-grid {
    display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: center;
  }
  @media (min-width: 768px) { .hero-grid { grid-template-columns: 1fr 1fr; } }

  .three-col { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 768px) { .three-col { grid-template-columns: 1fr 1fr 1fr; } }

  .two-col { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 780px; margin: 0 auto; }
  @media (min-width: 640px) { .two-col { grid-template-columns: 1fr 1fr; } }

  .proof-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; }
  @media (min-width: 768px) { .proof-grid { grid-template-columns: 1fr 1fr; } }

  .nav-desktop { display: none; }
  @media (min-width: 768px) {
    .nav-desktop { display: flex; }
    .nav-mobile-btn { display: none !important; }
  }

  .story-card {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(13,24,61,0.14);
    border: 1px solid #F0E4D0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .story-card:hover { transform: translateY(-4px); box-shadow: 0 16px 50px rgba(13,24,61,0.2); }

  .trust-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (min-width: 768px) { .trust-bar { grid-template-columns: repeat(4, 1fr); } }

  .trust-item {
    display: flex; gap: 12px; align-items: flex-start;
    background: white; border-radius: 14px; padding: 1.25rem;
    border: 1px solid #F0E4D0;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .trust-item:hover { box-shadow: 0 4px 20px rgba(13,24,61,0.1); transform: translateY(-2px); }

  .proof-card {
    background: white; border-radius: 16px; overflow: hidden;
    border: 1.5px solid #F0E4D0; box-shadow: 0 2px 16px rgba(13,24,61,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .proof-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(13,24,61,0.14); }

  .step-card {
    text-align: center; padding: 2.5rem 1.75rem; border-radius: 20px;
    background: rgba(255,255,255,0.55); border: 2px solid rgba(13,24,61,0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    backdrop-filter: blur(4px);
  }
  .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(13,24,61,0.12); }

  .plan-card {
    border-radius: 18px; padding: 2rem;
    transition: transform 0.2s ease;
  }
  .plan-card:hover { transform: translateY(-3px); }

  @keyframes cursor-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .cursor { display: inline-block; width: 2px; height: 1em; background: #FF6B35; margin-left: 2px; vertical-align: text-bottom; animation: cursor-blink 1s step-end infinite; }

  @keyframes gentle-bob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
  .book-float { animation: gentle-bob 5s ease-in-out infinite; }

  .wave-divider svg { display: block; width: 100%; }

  .hero-book-panel {
    background: #0D183D;
    border-radius: 24px; padding: 2.5rem 2rem;
    position: relative; overflow: hidden; min-height: 440px;
    display: flex; flex-direction: column; justify-content: center; gap: 1.5rem;
  }
`;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [childName, setChildName] = useState('');

  const previewName = childName.trim() || 'your child';
  const capitalised = previewName.charAt(0).toUpperCase() + previewName.slice(1);

  return (
    <div style={{ background: '#FFF4E6', minHeight: '100vh' }}>
      <style>{S}</style>

      {/* ─── Nav ─── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFF4E6', borderBottom: '1px solid #F0E4D0', padding: '0.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/mood-3.png" alt="TalePop" style={{ height: '72px', width: 'auto', mixBlendMode: 'multiply' }} />
          </Link>
          <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.6rem 1.5rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem', boxShadow: '0 2px 10px rgba(255,107,53,0.3)' }}>
              Start for free
            </Link>
          </div>
          <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
            {mobileMenuOpen ? <X size={24} color="#FF6B35" /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F0E4D0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0D183D', textDecoration: 'none', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0D183D', textDecoration: 'none', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.75rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', textAlign: 'center' }}>Start for free</Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4.5rem 2rem 3.5rem' }}>
        <div className="hero-grid">

          {/* Left: copy + widget */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0D183D', borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '1.75rem' }}>
              <span>🎁</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFB703', letterSpacing: '0.04em' }}>2 FREE STORIES  -  NO CARD NEEDED</span>
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', lineHeight: 1.1, color: '#0D183D', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              The bedtime story<br />
              <span style={{ color: '#FF6B35' }}>written only for them.</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#5E6A7A', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '440px', fontWeight: 500 }}>
              Tell us who your child is  -  their name, what they love, who their best friend is  -  and we&apos;ll write them a story that has never existed before.
            </p>

            {/* Name preview widget */}
            <div style={{ background: 'white', border: '2px solid #F0E4D0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem', maxWidth: '440px', boxShadow: '0 4px 24px rgba(13,24,61,0.08)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D183D', display: 'block', marginBottom: '0.5rem' }}>
                What&apos;s your child&apos;s name?
              </label>
              <input
                type="text"
                placeholder="e.g. Mia"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                maxLength={20}
                style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, color: '#0D183D', outline: 'none', fontFamily: 'inherit', marginBottom: '0.875rem', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />
              <div style={{ background: '#FFF4E6', borderRadius: '10px', padding: '0.875rem 1rem', borderLeft: '3px solid #FF6B35' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1496A6', letterSpacing: '0.04em', marginBottom: '5px', textTransform: 'uppercase' }}>Tonight&apos;s story begins...</p>
                <p style={{ fontSize: '0.92rem', color: '#0D183D', lineHeight: 1.65, fontWeight: 500 }}>
                  Once upon a time, <strong style={{ color: '#FF6B35' }}>{capitalised}</strong> discovered a glowing doorway hidden behind their bookshelf  -  and on the other side was a world that existed just for them{childName.trim() ? <span className="cursor" /> : '...'}
                </p>
              </div>
            </div>

            <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2.25rem', background: '#FF6B35', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '1.05rem', boxShadow: '0 4px 18px rgba(255,107,53,0.38)', letterSpacing: '-0.01em' }}>
              Begin their story
            </Link>
            <p style={{ fontSize: '0.8rem', color: '#9CA8B4', marginTop: '0.75rem', fontWeight: 500 }}>
              2 free stories. No credit card. Cancel anytime.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {['Ages 3–10', 'From 30¢ per story', 'Safe & ad-free'].map(b => (
                <span key={b} style={{ fontSize: '0.72rem', color: '#1496A6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1496A6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: illustrated scene */}
          <div className="hero-book-panel" style={{
            backgroundImage: "url('/hero-illustration.png')",
            backgroundSize: '280%',
            backgroundPosition: '2% 38%',
            backgroundRepeat: 'no-repeat',
            padding: 0
          }}>
            {/* Top fade: blends into cream hero background */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to bottom, #FFF4E6 0%, transparent 100%)' }} />
            {/* Bottom fade: blends into dark section below */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(13,24,61,0.9) 0%, transparent 100%)' }} />
          </div>
        </div>
      </section>

      {/* ─── Story preview ─── */}
      <section style={{ background: 'white', padding: '3rem 2rem 6rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFF0E0', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1rem', border: '1px solid #FFD4A8' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.04em' }}>📖 READ A REAL TALEPOP STORY</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#0D183D', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
              Written for Zara & Zak. No one else.
            </h2>
            <p style={{ color: '#5E6A7A', fontSize: '0.95rem', fontWeight: 500, maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Every word invented from scratch  -  their names, their adventure, their world.
            </p>
          </div>

          <div className="story-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #0D183D 0%, #1496A6 100%)', padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'white', lineHeight: 1.25 }}>
                  Zara, Zak and the Kingdom Beyond the Mist
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginTop: '5px' }}>Written for Zara & Zak</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Age 7 & 9', 'Dragon', 'Unicorn'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Story illustration  -  hero-illustration.png, left side characters (0% 44%) */}
            <div style={{
              position: 'relative', height: '220px', overflow: 'hidden',
              backgroundImage: "url('/hero-illustration.png')",
              backgroundSize: '280%', backgroundPosition: '0% 44%'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,24,61,0.5) 0%, transparent 30%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, white 100%)' }} />
              <span style={{ position: 'absolute', bottom: '1rem', left: '2rem', background: '#FF6B35', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>CHAPTER 1</span>
            </div>

            <div style={{ padding: '2rem 2rem 2.5rem' }}>
              <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.9, fontWeight: 500, marginBottom: '1rem' }}>
                <strong style={{ color: '#FF6B35', fontSize: '1.8rem', float: 'left', lineHeight: 1, marginRight: '6px', marginTop: '4px', fontFamily: 'Fredoka One, cursive' }}>Z</strong>
                ara and her brother Zak had been walking through the mist for what felt like hours when the castle appeared  -  impossibly tall, purple-turreted, glowing at every window as if someone inside had been expecting them.
              </p>
              <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.9, fontWeight: 500, marginBottom: '1.5rem' }}>
                A dragon landed on the drawbridge. It was green, about the size of a large horse, and it was wearing a very small hat. Behind it, a unicorn peered around the tower with enormous golden eyes.
              </p>
              <div style={{ borderLeft: '3px solid #1496A6', paddingLeft: '1.25rem', color: '#5E6A7A', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.8 }}>
                &ldquo;We&apos;ve been waiting,&rdquo; said the dragon.<br />
                Zak looked at Zara. Zara looked at Zak.<br />
                &ldquo;The kingdom only appears for the right children,&rdquo; said the dragon. &ldquo;And you are exactly right.&rdquo;
              </div>
              <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #F0E4D0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#9CA8B4', fontWeight: 600 }}>Page 1 of 5</span>
                {['Adventure', 'Dragon', 'Unicorn'].map(t => (
                  <span key={t} style={{ background: '#FFF0E0', border: '1px solid #FFD4A8', borderRadius: '20px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#FF6B35' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave into dark strip */}
      <div style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1200 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '45px' }}>
          <path d="M0,15 C200,45 400,0 600,25 C800,48 1000,5 1200,20 L1200,50 L0,50 Z" fill="#0D183D"/>
        </svg>
      </div>

      {/* ─── Social proof strip ─── */}
      <section style={{ background: '#0D183D', padding: '1.25rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 5rem)', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { n: '2,500+', label: 'adventures begun' },
            { n: '4.9 ★', label: 'from parents' },
            { n: '2 min', label: 'to first story' },
            { n: '30¢', label: 'per story' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <p className="font-serif" style={{ fontSize: '1.5rem', color: '#FFB703', marginBottom: '3px' }}>{s.n}</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wave out of dark strip */}
      <div style={{ lineHeight: 0, background: '#0D183D' }}>
        <svg viewBox="0 0 1200 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '45px' }}>
          <path d="M0,20 C300,50 900,0 1200,30 L1200,50 L0,50 Z" fill="#FFF4E6"/>
        </svg>
      </div>

      {/* ─── Two children proof ─── */}
      <section style={{ background: '#FFF4E6', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', color: '#0D183D', marginBottom: '0.875rem', letterSpacing: '-0.01em' }}>
              Two children. Two completely different stories.
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, maxWidth: '500px', margin: '0 auto', lineHeight: 1.75, fontSize: '0.975rem' }}>
              Their name, age, interests, friends, and even their pet go in. What comes out has never been written before  -  and never will be again.
            </p>
          </div>

          <div className="proof-grid">
            <div className="proof-card">
              <div style={{ background: '#FF6B35', padding: '1.1rem 1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🚀</div>
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Leo, age 5</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 500 }}>Loves space · Has a dog named Snoopy</p>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.75rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.07em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>His story began:</p>
                <p style={{ fontSize: '0.925rem', color: '#0D183D', lineHeight: 1.8, fontWeight: 500 }}>
                  The mission had one problem: Snoopy kept pressing buttons. Not important buttons  -  Leo had hidden those. Just the ones that made lights flash and sounds beep. &apos;Snoopy,&apos; said Leo, &apos;we are approaching the asteroid belt.&apos; Snoopy wagged his tail and pressed another button. The spaceship played a fanfare...
                </p>
              </div>
            </div>

            <div className="proof-card">
              <div style={{ background: '#1496A6', padding: '1.1rem 1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🧁</div>
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Isla, age 8</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 500 }}>Loves baking · Best friend is Sophie</p>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.75rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1496A6', letterSpacing: '0.07em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Her story began:</p>
                <p style={{ fontSize: '0.925rem', color: '#0D183D', lineHeight: 1.8, fontWeight: 500 }}>
                  The recipe said &ldquo;add a pinch of magic&rdquo; and Isla assumed that was just something cookbooks said. It was not. The moment she and Sophie stirred the bowl, the kitchen ceiling turned into a sky full of edible stars...
                </p>
              </div>
            </div>
          </div>

          <div className="trust-bar" style={{ marginTop: '3rem' }}>
            {[
              { icon: <RefreshCw size={18} color="#FF6B35" />, title: 'Never the same story twice', desc: 'Every story is invented fresh. No recycled plots, ever.' },
              { icon: <Star size={18} color="#FFB703" />, title: 'Their world, front and centre', desc: 'Their interests shape the entire plot  -  not just the name.' },
              { icon: <Shield size={18} color="#6CC06C" />, title: 'Safe & age-appropriate', desc: 'Every story crafted thoughtfully for kids aged 3–10.' },
              { icon: <Heart size={18} color="#FF6B35" />, title: 'No data sold. Ever.', desc: 'Your child\'s details are private. That\'s a promise.' },
            ].map((t, i) => (
              <div key={i} className="trust-item">
                <div style={{ flexShrink: 0, marginTop: '2px' }}>{t.icon}</div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D183D', marginBottom: '4px' }}>{t.title}</p>
                  <p style={{ fontSize: '0.78rem', color: '#5E6A7A', fontWeight: 500, lineHeight: 1.6 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Illustrated scene break ─── */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/mood-2.png')",
          backgroundSize: '100%',
          backgroundPosition: '50% 28%',
          backgroundRepeat: 'no-repeat'
        }} />
        {/* Fade top from cream, fade bottom to dark */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #FFF4E6 0%, transparent 25%, transparent 55%, #0D183D 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>
          <p className="font-serif" style={{ color: 'white', fontSize: 'clamp(1.1rem, 3vw, 1.65rem)', textAlign: 'center', textShadow: '0 2px 24px rgba(0,0,0,0.7)', maxWidth: '600px', padding: '0 2rem', lineHeight: 1.5 }}>
            The story that makes them say &ldquo;just one more page.&rdquo;
          </p>
        </div>
      </div>

      {/* ─── Testimonial ─── */}
      <section style={{ background: 'linear-gradient(135deg, #0D183D 0%, #0b2252 100%)', padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle, #FFB703 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        {/* Huge decorative quote mark */}
        <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', fontSize: '14rem', lineHeight: 1, color: 'rgba(255,183,3,0.06)', fontFamily: 'Georgia, serif', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '2rem' }}>
            {[1,2,3,4,5].map(i => <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="#FFB703"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
          </div>
          <p className="font-serif" style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.55rem)', color: 'white', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            &ldquo;Noah made us read his story <strong style={{ color: '#FFB703' }}>14 nights in a row</strong>. The first time, he just stared at his name on the page and said &lsquo;Mum, that&rsquo;s actually me.&rsquo; He cried when we suggested a different book. We haven&apos;t suggested it again.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #FFB703)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>👩</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Sarah M.</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', fontWeight: 500 }}>Mum of Noah, age 6 · Melbourne</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works  -  SUNSHINE YELLOW ─── */}
      <section id="how-it-works" style={{ background: '#FFB703', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#0D183D', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Your child&apos;s story in three steps
            </h2>
            <p style={{ color: 'rgba(13,24,61,0.6)', fontWeight: 600, fontSize: '0.95rem' }}>Ready to read at bedtime tonight.</p>
          </div>
          <div className="three-col">
            {[
              { num: '1', emoji: '✏️', title: 'Tell us about them', desc: 'Name, age, what makes them laugh, their best friend, their pet  -  the more you share, the richer the story.', color: '#FF6B35' },
              { num: '2', emoji: '📖', title: 'We write it from scratch', desc: 'A unique 5-page adventure, invented entirely around your child. No two TalePop stories have ever been the same.', color: '#0D183D' },
              { num: '3', emoji: '🌙', title: 'Read it together tonight', desc: 'Open their story, read it aloud, and watch their face when they realise the adventure is theirs.', color: '#1496A6' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{step.emoji}</div>
                <div style={{ width: '34px', height: '34px', background: step.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: `0 4px 14px ${step.color}55` }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>{step.num}</span>
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#0D183D' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(13,24,61,0.65)', lineHeight: 1.75, fontWeight: 500 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" style={{ background: '#FFF4E6', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#0D183D', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Your child&apos;s story for just 30¢.
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Simple, transparent pricing. Cancel anytime.</p>
            <p style={{ color: '#FF6B35', fontWeight: 700, fontSize: '0.85rem' }}>Join 2,500+ families already reading tonight.</p>
          </div>

          <div className="two-col" style={{ marginTop: '3rem' }}>
            <div className="plan-card" style={{ border: '2px solid #F0E4D0', background: 'white' }}>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: '#0D183D' }}>Monthly</h3>
              <p style={{ color: '#9CA8B4', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Flexible  -  cancel anytime</p>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '-0.02em' }}>A$9.99</span>
                <span style={{ color: '#9CA8B4', fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF0E0', border: '1.5px solid #FFD4A8', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1rem' }}>📖</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35' }}>just 30¢ per story</span>
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '0.9rem', background: '#FF6B35', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: '800', marginBottom: '1.75rem', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' }}>
                Subscribe monthly &rarr;
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Up to 15 stories per month', 'Multiple children profiles', 'Story series (up to 4 volumes)', 'Beautifully illustrated pages', 'Cancel in one click'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#0D183D', fontWeight: 500, alignItems: 'flex-start' }}>
                    <Check size={16} color="#6CC06C" style={{ flexShrink: 0, marginTop: '3px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-card" style={{ background: '#FF6B35', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#FFB703', color: '#0D183D', padding: '0.35rem 1.25rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '900', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                ⭐ BEST VALUE  -  SAVE 20%
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Annual</h3>
              <p style={{ opacity: 0.75, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Two months free</p>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>A$7.99</span>
                <span style={{ opacity: 0.7, fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>📖</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>as little as 24¢ per story</span>
              </div>
              <p style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 500 }}>A$95.90 billed annually</p>
              <Link href="/signup?plan=annual" style={{ display: 'block', textAlign: 'center', padding: '0.9rem', background: 'white', borderRadius: '12px', color: '#FF6B35', textDecoration: 'none', fontWeight: '800', marginBottom: '1.75rem', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                Get the best deal &rarr;
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Everything in Monthly', 'Priority story generation', 'Early access to new features', 'Save A$24 per year'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 500, alignItems: 'flex-start' }}>
                    <Check size={16} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '3px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {/* Stripe trust badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #E8E0D5', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 1px 6px rgba(13,24,61,0.06)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6CC06C" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: '0.8rem', color: '#5E6A7A', fontWeight: 600 }}>
                Secure payment via <strong style={{ color: '#635BFF' }}>Stripe</strong>  -  your card details are never stored by TalePop
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Cancel anytime', 'Any device', 'Unlimited child profiles'].map(t => (
                <span key={t} style={{ fontSize: '0.78rem', color: '#9CA8B4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA8B4" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#0D183D', textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.01em' }}>
            Questions parents ask us
          </h2>
          {[
            {
              q: 'How personalised is it, really?',
              a: "Every word is invented fresh - not a template with the name swapped in. Your child's interests, best friend, pet, and personality shape the actual plot. Two children with the same name get completely different stories."
            },
            {
              q: 'What age is TalePop for?',
              a: "Ages 3 to 10. You set a reading level when you create your child's profile and we adjust vocabulary, sentence length, and story complexity accordingly. A 4-year-old gets short, simple sentences with big moments; a 9-year-old gets richer language and a proper three-act structure."
            },
            {
              q: 'Can I add more than one child?',
              a: 'Yes  -  unlimited profiles, one subscription. Each child gets their own profile, their own story preferences, and their own shelf. Brothers and sisters never share a story unless you want them to.'
            },
            {
              q: 'Can I actually cancel anytime?',
              a: 'One click from your account settings. No hoops, no retention flows, no email-us-to-cancel. If you cancel, you keep access until the end of your billing period.'
            },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: '1px solid #F0E4D0', paddingBottom: '1.75rem', marginBottom: '1.75rem' }}>
              <p className="font-serif" style={{ fontSize: '1.05rem', color: '#0D183D', fontWeight: 700, marginBottom: '0.6rem' }}>
                {item.q}
              </p>
              <p style={{ color: '#5E6A7A', lineHeight: 1.8, fontWeight: 500, fontSize: '0.95rem' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{ background: '#0D183D', padding: '6rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle, #FFB703 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌙</p>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Their story is waiting to be told.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7, fontWeight: 500 }}>
            2 minutes to set up. 2 free stories. Then from just 30¢ a story.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1.1rem 3rem', background: '#FF6B35', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '1.05rem', boxShadow: '0 4px 24px rgba(255,107,53,0.45)', letterSpacing: '-0.01em' }}>
            Begin their story
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 500 }}>No credit card. Cancel anytime. 2 stories free.</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#080E22', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/talepop-logo-light.png" alt="TalePop" style={{ height: '50px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Terms of Service</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Sign in</Link>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 500 }}>© {new Date().getFullYear()} TalePop</span>
        </div>
      </footer>
    </div>
  );
}
