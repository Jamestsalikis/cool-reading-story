'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, Check, Shield, RefreshCw, Star } from 'lucide-react';

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
    border-radius: 24px; overflow: hidden; position: relative; min-height: 420px; background: #0D183D;
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
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFF4E6', borderBottom: '1px solid #F0E4D0', padding: '0.65rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/mood-3.png" alt="TalePop" style={{ height: '75px', width: 'auto' }} />
          </Link>
          <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.6rem 1.4rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem' }}>
              Try free tonight
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
            <Link href="/signup" style={{ padding: '0.75rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', textAlign: 'center' }}>Try free tonight</Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <div className="hero-grid">
          <div>
            {/* Free trial badge — LOUD */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0D183D', borderRadius: '999px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>🎁</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFB703', letterSpacing: '0.03em' }}>2 FREE STORIES — NO CARD NEEDED</span>
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.15, color: '#0D183D', marginBottom: '1.25rem' }}>
              Bedtime stories where<br />
              <span style={{ color: '#FF6B35' }}>your child is the hero.</span>
            </h1>

            <p style={{ fontSize: '1.0625rem', color: '#5E6A7A', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '460px', fontWeight: 500 }}>
              Type their name, pick their interests, and read their personalised story tonight — free.
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
                Read their story tonight →
              </Link>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5E6A7A', marginTop: '0.75rem', fontWeight: 500 }}>
              2 free stories. No credit card. Cancel anytime.
            </p>
          </div>

          {/* Hero illustration */}
          <div className="hero-img-panel" style={{ animation: 'float 5s ease-in-out infinite', backgroundImage: "url('/hero-illustration.png')", backgroundSize: '270%', backgroundPosition: '2% 3%' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(transparent, rgba(13,24,61,0.75))' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.65, letterSpacing: '0.07em', marginBottom: '4px' }}>EVERY STORY IS WRITTEN FRESH</p>
              <p className="font-serif" style={{ fontSize: '1.05rem' }}>No templates. No name-swap. Just their world. ✨</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social proof bar ─── */}
      <section style={{ background: '#0D183D', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { n: '12,000+', label: 'stories created' },
            { n: '4.9★', label: 'average rating' },
            { n: '2 min', label: 'to first story' },
            { n: '100%', label: 'kid-approved' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <p className="font-serif" style={{ fontSize: '1.4rem', color: '#FFB703', marginBottom: '2px' }}>{s.n}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THE PRODUCT: Real story output ─── */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>What you actually get</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.75rem' }}>
              This is what their story looks like.
            </h2>
            <p style={{ color: '#5E6A7A', fontSize: '0.95rem', fontWeight: 500, maxWidth: '520px', margin: '0 auto' }}>
              A real TalePop story, generated for a real child. Not a template. Not a name swap.
            </p>
          </div>

          {/* Story spread */}
          <div className="story-card" style={{ maxWidth: '860px', margin: '0 auto' }}>
            {/* Book header */}
            <div style={{ background: 'linear-gradient(135deg, #0D183D 0%, #1496A6 100%)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', marginBottom: '4px' }}>TALEPOP ORIGINAL STORY</p>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'white', lineHeight: 1.2 }}>
                  Zara and the Triassic Tide Pool
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Age 6', 'Loves dinosaurs', 'Brave & curious'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Story content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
              {/* Illustration area */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0D183D' }}>
                <img src="/hero-illustration.png" alt="Story illustration"
                  style={{ position: 'absolute', width: '200%', maxWidth: 'none', top: '-30%', left: '-10%' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, white)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '2rem' }}>
                  <span style={{ background: '#FF6B35', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>CHAPTER 1</span>
                </div>
              </div>

              {/* Story text */}
              <div style={{ padding: '2rem' }}>
                <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.85, fontWeight: 500, marginBottom: '1rem' }}>
                  <strong style={{ color: '#FF6B35', fontSize: '1.8rem', float: 'left', lineHeight: 1, marginRight: '6px', marginTop: '4px', fontFamily: 'Fredoka One, cursive' }}>Z</strong>
                  ara had found a lot of things in her grandmother&apos;s garden — snails, old coins, a button that might have been from a pirate&apos;s coat. But she had never, not once, found a tide pool that glowed.
                </p>
                <p style={{ fontSize: '1rem', color: '#0D183D', lineHeight: 1.85, fontWeight: 500, marginBottom: '1.5rem' }}>
                  She crouched at the edge, her red gumboots squeaking on the rocks, and peered in. Something enormous moved beneath the surface. Something that hadn&apos;t existed for sixty-six million years.
                </p>
                <div style={{ borderLeft: '3px solid #1496A6', paddingLeft: '1rem', color: '#5E6A7A', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                  &ldquo;Are you afraid?&rdquo; rumbled a voice from the deep.<br />
                  Zara thought about it carefully, the way brave people do.<br />
                  &ldquo;Not even a little,&rdquo; she said. And she jumped.
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F0E4D0', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#5E6A7A', fontWeight: 600 }}>Page 1 of 5 · Written for Zara, age 6 ·</span>
                  {['Adventure', 'Dinosaurs', 'Ocean'].map(t => (
                    <span key={t} style={{ background: '#FFF0E0', border: '1px solid #FFD4A8', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#FF6B35' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Not a template proof ─── */}
      <section style={{ background: '#FFF4E6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Not a template. Not a name swap.</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', color: '#0D183D', marginBottom: '0.75rem' }}>
              Every story is written fresh — just for your child.
            </h2>
            <p style={{ color: '#5E6A7A', fontWeight: 500, maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              Their name, age, interests, friends, and even their pet go in. The story that comes out has never existed before and never will again.
            </p>
          </div>

          <div className="proof-grid">
            {/* Child A */}
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
                  The rocket smelled like peanut butter, which Leo thought was suspicious. Biscuit didn&apos;t seem to mind — he was already strapped into the co-pilot seat, tail wagging at approximately warp speed...
                </p>
              </div>
            </div>

            {/* Child B */}
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

          {/* Trust items */}
          <div className="trust-bar" style={{ marginTop: '3rem' }}>
            {[
              { icon: <RefreshCw size={18} color="#FF6B35" />, title: 'Never the same story twice', desc: 'Every generation is unique. No recycled plots.' },
              { icon: <Star size={18} color="#FFB703" />, title: 'Their interests shape the plot', desc: 'Not just the name. Their world, front and centre.' },
              { icon: <Shield size={18} color="#6CC06C" />, title: 'Safe & age-appropriate', desc: 'Every story reviewed for kids 3–10.' },
              { icon: <Check size={18} color="#1496A6" />, title: 'No data sold. Ever.', desc: 'Your child\'s details stay private, always.' },
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

      {/* ─── Single devastating testimonial ─── */}
      <section style={{ background: '#0D183D', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
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
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>Mum of Noah, age 6 · TalePop subscriber</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ready in 2 minutes</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D' }}>How it works</h2>
          </div>
          <div className="three-col">
            {[
              { num: '1', title: "Build your child's profile", desc: "Name, age, interests, friends, even their pet. The more you give us, the more personal the story.", color: '#FF6B35' },
              { num: '2', title: 'We write it fresh', desc: 'Claude AI writes a unique 5-page adventure. Not a template — a story that has never existed before.', color: '#1496A6' },
              { num: '3', title: 'Read together tonight', desc: 'Open their story, read it aloud at bedtime, and watch their face when they hear their name.', color: '#FFB703' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: '16px', border: '1.5px solid #F0E4D0', background: '#FFFAF5' }}>
                <div style={{ width: '52px', height: '52px', background: step.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: `0 4px 14px ${step.color}50` }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>{step.num}</span>
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
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Simple pricing</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.75rem' }}>Start free. Stay as long as you love it.</h2>
          </div>
          <div className="two-col">
            <div style={{ border: '2px solid #F0E4D0', borderRadius: '16px', padding: '2rem', background: 'white' }}>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0D183D' }}>Monthly</h3>
              <p style={{ color: '#5E6A7A', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Flexible, cancel anytime</p>
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
              <p style={{ opacity: 0.85, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>2 months free</p>
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
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/hero-illustration.png')", backgroundSize: '160%', backgroundPosition: '50% 5%', opacity: 0.1 }} />
        <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Tonight&apos;s story is waiting.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
            2 minutes to set up. 2 free stories. The look on their face — priceless.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1.1rem 2.75rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
            Read their story tonight →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 500 }}>No credit card. Cancel anytime. 2 stories free.</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#080E22', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/talepop-logo-light.png" alt="TalePop" style={{ height: '56px', width: 'auto' }} />
          </Link>
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
