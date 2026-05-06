'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, Check, Shield, RefreshCw, Star, BookOpen, Sparkles, Heart } from 'lucide-react';

const S = `
  .hero-grid {
    display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: center;
  }
  @media (min-width: 768px) { .hero-grid { grid-template-columns: 1fr 1fr; } }

  .three-col { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 768px) { .three-col { grid-template-columns: 1fr 1fr 1fr; } }

  .two-col { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 760px; margin: 0 auto; }
  @media (min-width: 640px) { .two-col { grid-template-columns: 1fr 1fr; } }

  .proof-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; }
  @media (min-width: 768px) { .proof-grid { grid-template-columns: 1fr 1fr; } }

  .nav-desktop { display: none; }
  @media (min-width: 768px) {
    .nav-desktop { display: flex; }
    .nav-mobile-btn { display: none !important; }
  }
  .hero-img-panel {
    border-radius: 24px; overflow: hidden; position: relative; min-height: 440px;
    background: #1a2a5e;
  }
  .story-card {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(13,24,61,0.14);
    border: 1px solid #F0E4D0;
  }
  .trust-bar {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  }
  @media (min-width: 768px) { .trust-bar { grid-template-columns: repeat(4, 1fr); } }
  @keyframes cursor-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .cursor { display: inline-block; width: 2px; height: 1em; background: #FF6B35; margin-left: 2px; vertical-align: text-bottom; animation: cursor-blink 1s step-end infinite; }
  .step-card {
    text-align: center; padding: 2.25rem 1.75rem; border-radius: 20px;
    background: #FFFAF5; border: 1.5px solid #F0E4D0;
    position: relative; overflow: hidden;
  }
  .step-card::before {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 90px; height: 90px; border-radius: 50%;
    opacity: 0.07;
  }
  .wave-divider svg { display: block; width: 100%; }
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
            <img src="/mood-3.png" alt="TalePop" style={{ height: '72px', width: 'auto' }} />
          </Link>
          <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.6rem 1.4rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem' }}>
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
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <div className="hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0D183D', borderRadius: '999px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>🎁</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFB703', letterSpacing: '0.03em' }}>2 FREE STORIES — NO CARD NEEDED</span>
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.15, color: '#0D183D', marginBottom: '1.25rem' }}>
              The bedtime story<br />
              <span style={{ color: '#FF6B35' }}>written only for them.</span>
            </h1>

            <p style={{ fontSize: '1.0625rem', color: '#5E6A7A', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '460px', fontWeight: 500 }}>
              Tell us who your child is — their name, what they love, who their best friend is — and we&apos;ll write them a story that has never existed before.
            </p>

            {/* ── Name preview widget ── */}
            <div style={{ background: 'white', border: '2px solid #F0E4D0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem', maxWidth: '440px', boxShadow: '0 4px 20px rgba(13,24,61,0.07)' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                What&apos;s your child&apos;s name?
              </label>
              <input
                type="text"
                placeholder="e.g. Mia"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                maxLength={20}
                style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, color: '#0D183D', outline: 'none', fontFamily: 'inherit', marginBottom: '0.875rem', boxSizing: 'border-box' }}
              />
              <div style={{ background: '#FFF4E6', borderRadius: '10px', padding: '0.875rem 1rem', borderLeft: '3px solid #FF6B35' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1496A6', letterSpacing: '0.05em', marginBottom: '4px' }}>TONIGHT&apos;S STORY BEGINS...</p>
                <p style={{ fontSize: '0.92rem', color: '#0D183D', lineHeight: 1.6, fontWeight: 500 }}>
                  Once upon a time, <strong style={{ color: '#FF6B35' }}>{capitalised}</strong> discovered a glowing doorway hidden behind their bookshelf — and on the other side was a world that existed just for them
                  {childName.trim() ? <span className="cursor" /> : '...'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/signup" style={{ padding: '0.95rem 2rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1rem', boxShadow: '0 4px 16px rgba(255,107,53,0.35)' }}>
                Begin their story
              </Link>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5E6A7A', marginTop: '0.75rem', fontWeight: 500 }}>
              2 free stories. No credit card. Cancel anytime.
            </p>
          </div>

          {/* Hero illustration — characters area of mood board */}
          <div className="hero-img-panel" style={{
            animation: 'float 5s ease-in-out infinite',
            backgroundImage: "url('/mood-2.png')",
            backgroundSize: 'cover',
            backgroundPosition: '50% 38%'
          }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent, rgba(13,24,61,0.85))' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
              <p className="font-serif" style={{ fontSize: '1.05rem' }}>Every night, a story all their own. ✨</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="wave-divider" style={{ marginTop: '-2px', lineHeight: 0 }}>
        <svg viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ height: '50px' }}>
          <path d="M0,20 C200,55 400,0 600,30 C800,58 1000,5 1200,25 L1200,60 L0,60 Z" fill="#0D183D"/>
        </svg>
      </div>

      {/* ─── Warm proof strip ─── */}
      <section style={{ background: '#0D183D', padding: '1.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { n: '2,500+', label: 'adventures begun' },
            { n: '4.9 ★', label: 'from parents' },
            { n: '2 min', label: 'to first story' },
            { n: '0', label: 'recycled plots' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <p className="font-serif" style={{ fontSize: '1.4rem', color: '#FFB703', marginBottom: '2px' }}>{s.n}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wave out */}
      <div style={{ lineHeight: 0, background: '#0D183D' }}>
        <svg viewBox="0 0 1200 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '45px' }}>
          <path d="M0,20 C300,50 900,0 1200,30 L1200,50 L0,50 Z" fill="white"/>
        </svg>
      </div>

      {/* ─── Real story output ─── */}
      <section style={{ background: 'white', padding: '3rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.75rem' }}>
              This is what a TalePop story looks like.
            </h2>
            <p style={{ color: '#5E6A7A', fontSize: '0.95rem', fontWeight: 500, maxWidth: '520px', margin: '0 auto' }}>
              Written fresh for Zara and Zak. Not pulled from a library. Not built from a template. Theirs alone.
            </p>
          </div>

          <div className="story-card" style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #0D183D 0%, #1496A6 100%)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'white', lineHeight: 1.2 }}>
                  Zara, Zak and the Kingdom Beyond the Mist
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: '4px' }}>Written for Zara & Zak</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Age 7 & 9', 'Dragon', 'Unicorn'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{t}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0D183D' }}>
                <img src="/hero-illustration.png" alt="Story illustration"
                  style={{ position: 'absolute', width: '280%', maxWidth: 'none', top: '-15%', left: '-30%' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, white)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '2rem' }}>
                  <span style={{ background: '#FF6B35', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>CHAPTER 1</span>
                </div>
              </div>

              <div style={{ padding: '2rem' }}>
                <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.85, fontWeight: 500, marginBottom: '1rem' }}>
                  <strong style={{ color: '#FF6B35', fontSize: '1.8rem', float: 'left', lineHeight: 1, marginRight: '6px', marginTop: '4px', fontFamily: 'Fredoka One, cursive' }}>Z</strong>
                  ara and her brother Zak had been walking through the mist for what felt like hours when the castle appeared — impossibly tall, purple-turreted, glowing at every window as if someone inside had been expecting them.
                </p>
                <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.85, fontWeight: 500, marginBottom: '1.5rem' }}>
                  A dragon landed on the drawbridge. It was green, about the size of a large horse, and it was wearing a very small hat. Behind it, a unicorn peered around the tower with enormous golden eyes.
                </p>
                <div style={{ borderLeft: '3px solid #1496A6', paddingLeft: '1rem', color: '#5E6A7A', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                  &ldquo;We&apos;ve been waiting,&rdquo; said the dragon.<br />
                  Zak looked at Zara. Zara looked at Zak.<br />
                  &ldquo;For us?&rdquo; said Zara.<br />
                  &ldquo;The kingdom only appears for the right children,&rdquo; said the dragon. &ldquo;And you are exactly right.&rdquo;
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F0E4D0', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#5E6A7A', fontWeight: 600 }}>Page 1 of 5</span>
                  {['Adventure', 'Dragon', 'Unicorn'].map(t => (
                    <span key={t} style={{ background: '#FFF0E0', border: '1px solid #FFD4A8', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#FF6B35' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two children, two worlds ─── */}
      <section style={{ background: '#FFF4E6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', color: '#0D183D', marginBottom: '0.75rem' }}>
              Two children. Two completely different stories.
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Their name, age, interests, friends, and even their pet go in. What comes out has never been written before — and never will be again.
            </p>
          </div>

          <div className="proof-grid">
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #F0E4D0', boxShadow: '0 2px 16px rgba(13,24,61,0.06)' }}>
              <div style={{ background: '#FF6B35', padding: '1rem 1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🚀</div>
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>Leo, age 5</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500 }}>Loves space · Has a dog named Biscuit</p>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>HIS STORY BEGAN:</p>
                <p style={{ fontSize: '0.9rem', color: '#0D183D', lineHeight: 1.75, fontWeight: 500 }}>
                  The mission had one problem: Biscuit kept pressing buttons. Not important buttons — Leo had hidden those. Just the ones that made lights flash and sounds beep. &apos;Biscuit,&apos; said Leo, &apos;we are approaching the asteroid belt.&apos; Biscuit wagged his tail and pressed another button. The spaceship played a fanfare...
                </p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #F0E4D0', boxShadow: '0 2px 16px rgba(13,24,61,0.06)' }}>
              <div style={{ background: '#1496A6', padding: '1rem 1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🧁</div>
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>Isla, age 8</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500 }}>Loves baking · Best friend is Sophie</p>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1496A6', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>HER STORY BEGAN:</p>
                <p style={{ fontSize: '0.9rem', color: '#0D183D', lineHeight: 1.75, fontWeight: 500 }}>
                  The recipe said &ldquo;add a pinch of magic&rdquo; and Isla assumed that was just something cookbooks said. It was not. The moment she and Sophie stirred the bowl, the kitchen ceiling turned into a sky full of edible stars...
                </p>
              </div>
            </div>
          </div>

          <div className="trust-bar" style={{ marginTop: '3rem' }}>
            {[
              { icon: <RefreshCw size={18} color="#FF6B35" />, title: 'Never the same story twice', desc: 'Every story is invented fresh. No recycled plots, ever.' },
              { icon: <Star size={18} color="#FFB703" />, title: 'Their world, front and centre', desc: 'Their interests shape the entire plot — not just the name.' },
              { icon: <Shield size={18} color="#6CC06C" />, title: 'Safe & age-appropriate', desc: 'Every story crafted thoughtfully for kids aged 3–10.' },
              { icon: <Heart size={18} color="#FF6B35" />, title: 'No data sold. Ever.', desc: 'Your child\'s details are private. That\'s a promise.' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #F0E4D0' }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>{t.icon}</div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D183D', marginBottom: '3px' }}>{t.title}</p>
                  <p style={{ fontSize: '0.78rem', color: '#5E6A7A', fontWeight: 500, lineHeight: 1.5 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Single testimonial ─── */}
      <section style={{ background: 'linear-gradient(135deg, #0D183D 0%, #0a2250 100%)', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {/* subtle star scatter */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle, #FFB703 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '2rem' }}>
            {[1,2,3,4,5].map(i => <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="#FFB703"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
          </div>
          <p className="font-serif" style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.5rem)', color: 'white', lineHeight: 1.75, marginBottom: '2rem' }}>
            &ldquo;Noah made us read his story <strong style={{ color: '#FFB703' }}>14 nights in a row</strong>. The first time, he just stared at his name on the page and said &lsquo;Mum, that&rsquo;s actually me.&rsquo; He cried when we suggested a different book. We haven&apos;t suggested it again.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👩</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Sarah M.</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>Mum of Noah, age 6</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.5rem' }}>
              Your child&apos;s story in three steps
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, fontSize: '0.95rem' }}>Ready to read at bedtime tonight.</p>
          </div>
          <div className="three-col">
            {[
              { num: '1', emoji: '✏️', title: "Tell us about them", desc: "Name, age, what makes them laugh, their best friend, their pet — the more you share, the richer the story.", color: '#FF6B35' },
              { num: '2', emoji: '📖', title: 'We write it from scratch', desc: 'A unique 5-page adventure, invented entirely around your child. No two TalePop stories have ever been the same.', color: '#1496A6' },
              { num: '3', emoji: '🌙', title: 'Read it together tonight', desc: 'Open their story, read it aloud, and watch their face when they realise the adventure is theirs.', color: '#FFB703' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.emoji}</div>
                <div style={{ width: '32px', height: '32px', background: step.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: `0 4px 14px ${step.color}55` }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>{step.num}</span>
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#0D183D' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#5E6A7A', lineHeight: 1.7, fontWeight: 500 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" style={{ background: '#FFF4E6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.5rem' }}>
              Less than a paperback a month.
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, fontSize: '0.95rem' }}>Start with 2 free stories — no card required.</p>
          </div>
          <div className="two-col">
            <div style={{ border: '2px solid #F0E4D0', borderRadius: '16px', padding: '2rem', background: 'white' }}>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0D183D' }}>Monthly</h3>
              <p style={{ color: '#5E6A7A', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Flexible — cancel anytime</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF6B35' }}>A$9.99</span>
                <span style={{ color: '#5E6A7A', fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', border: '2px solid #FF6B35', borderRadius: '10px', color: '#FF6B35', textDecoration: 'none', fontWeight: '700', marginBottom: '1.75rem' }}>
                Start with 2 free stories
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Up to 15 stories per month', 'Multiple children profiles', 'Story series (up to 4 volumes)', 'Beautifully illustrated pages', 'Cancel in one click'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#0D183D', fontWeight: 500 }}>
                    <Check size={17} color="#6CC06C" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ border: '2px solid #FF6B35', borderRadius: '16px', padding: '2rem', background: '#FF6B35', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#FFB703', color: '#0D183D', padding: '0.35rem 1.1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                ⭐ BEST VALUE — SAVE 20%
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Annual</h3>
              <p style={{ opacity: 0.85, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Two months free</p>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>A$7.99</span>
                <span style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 500 }}>A$95.90 billed annually</p>
              <Link href="/signup?plan=annual" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: 'white', borderRadius: '10px', color: '#FF6B35', textDecoration: 'none', fontWeight: '800', marginBottom: '1.75rem' }}>
                Start with 2 free stories
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Everything in Monthly', 'Priority story generation', 'Early access to new features', 'Save A$24 per year'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    <Check size={17} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{ position: 'relative', background: '#0D183D', padding: '5rem 2rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/hero-illustration.png')", backgroundSize: '220%', backgroundPosition: '15% 75%', opacity: 0.12 }} />
        <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Their story is waiting to be told.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
            2 minutes to set up. 2 free stories. The look on their face — priceless.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1.1rem 2.75rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
            Begin their story
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 500 }}>No credit card. Cancel anytime. 2 stories free.</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#080E22', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/talepop-logo-light.png" alt="TalePop" style={{ height: '52px', width: 'auto' }} />
            </Link>

          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Terms of Service</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Sign in</Link>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', fontWeight: 500 }}>© {new Date().getFullYear()} TalePop</span>
        </div>
      </footer>
    </div>
  );
}
