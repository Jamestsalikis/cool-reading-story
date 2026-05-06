'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, BookOpen, Users, Sparkles, Check } from 'lucide-react';

const landingStyles = `
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;
  }
  @media (min-width: 768px) {
    .hero-grid { grid-template-columns: 1fr 1fr; }
  }
  .three-col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) {
    .three-col { grid-template-columns: 1fr 1fr 1fr; }
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 760px;
    margin: 0 auto;
  }
  @media (min-width: 640px) {
    .two-col { grid-template-columns: 1fr 1fr; }
  }
  .sample-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
  }
  @media (min-width: 768px) {
    .sample-grid { grid-template-columns: 1fr 1fr; }
  }
  .nav-desktop { display: none; }
  @media (min-width: 768px) {
    .nav-desktop { display: flex; }
    .nav-mobile-btn { display: none !important; }
  }
`;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: '#FFF4E6', minHeight: '100vh' }}>
      <style>{landingStyles}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFF4E6', borderBottom: '1px solid #F0E4D0', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-serif" style={{ fontSize: '1.6rem', color: '#0D183D', letterSpacing: '-0.5px' }}>Tale</span>
            <span className="font-serif" style={{ fontSize: '1.6rem', color: '#FF6B35' }}>Pop</span>
            <span style={{ background: '#FFB703', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginLeft: '-4px', marginTop: '-12px' }} />
          </div>

          <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.6rem 1.4rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem' }}>
              Get started
            </Link>
          </div>

          <button
            className="nav-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={24} color="#FF6B35" /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F0E4D0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Pricing</a>
            <Link href="/login" style={{ color: '#0D183D', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.75rem 1.25rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>
              Get started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div className="hero-grid">
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFE8CC', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem' }}>✨</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF6B35', letterSpacing: '0.04em' }}>YOUR STORY MAKER</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.15, color: '#0D183D', marginBottom: '1.5rem' }}>
              Where your child<br />is the hero.
            </h1>
            <p style={{ fontSize: '1.0625rem', color: '#5E6A7A', lineHeight: 1.7, marginBottom: '0.75rem', maxWidth: '480px', fontWeight: 500 }}>
              Personalised, beautifully illustrated bedtime stories — AI-generated in seconds and tailored to your child&apos;s world.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#1496A6', fontWeight: 700, marginBottom: '2rem' }}>
              Imagine away. A new tale every day.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Link href="/signup" style={{ padding: '0.9rem 1.75rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1rem' }}>
                Start your story
              </Link>
              <a href="#how-it-works" style={{ padding: '0.9rem 1.5rem', border: '2px solid #F0E4D0', color: '#0D183D', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
                See how it works
              </a>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {['Up to 15 stories/month', 'Multiple children', 'Cancel anytime'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={15} color="#6CC06C" />
                  <span style={{ fontSize: '0.85rem', color: '#5E6A7A', fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Book preview card */}
          <div style={{ background: 'linear-gradient(160deg, #0D183D 0%, #1a2a5a 100%)', borderRadius: '20px', padding: '2.5rem', color: 'white', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 16px 48px rgba(13,24,61,0.2)', animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFB703"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <span style={{ background: '#FF6B35', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.06em' }}>NEW TALE</span>
            </div>
            <div>
              <div style={{ width: '40px', height: '3px', background: '#1496A6', borderRadius: '2px', marginBottom: '1rem' }} />
              <h3 className="font-serif" style={{ fontSize: '1.7rem', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                The Secret Starry Forest
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8, fontWeight: 500 }}>
                In a forest where trees whispered ancient secrets, a clever child named Sage discovered a path lit by stars...
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              {['Adventure', 'Magic', 'Nature'].map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial strip */}
      <section style={{ background: '#0D183D', color: 'white', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '1rem' }}>
            {[1,2,3,4,5].map(i => <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#FFB703"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
          </div>
          <p className="font-serif" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', lineHeight: 1.8, marginBottom: '1rem' }}>
            &ldquo;My daughter asks for her story every single bedtime. She loves seeing herself as the hero. It&apos;s become our favourite tradition.&rdquo;
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 600 }}>— Parent of Emma, age 6</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Simple as magic</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D' }}>
              How it works
            </h2>
          </div>
          <div className="three-col">
            {[
              { icon: Users, title: "Build your child's profile", desc: "Tell us their name, age, interests and who they love. The more detail, the more personal the story.", color: '#FF6B35' },
              { icon: Sparkles, title: 'We write the story', desc: 'Our AI writes a unique, age-appropriate adventure featuring your child as the main character — in seconds.', color: '#1496A6' },
              { icon: BookOpen, title: 'Read together tonight', desc: 'Open any story from your library, read it aloud at bedtime, and watch their face light up.', color: '#FFB703' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '68px', height: '68px', background: `${step.color}18`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Icon size={28} color={step.color} />
                  </div>
                  <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#0D183D' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.9375rem', color: '#5E6A7A', lineHeight: 1.7, fontWeight: 500 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample story */}
      <section id="sample" style={{ background: '#FFF4E6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 3rem)', boxShadow: '0 4px 24px rgba(13,24,61,0.06)' }}>
            <div className="sample-grid">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sample story</p>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1rem', color: '#0D183D' }}>
                  Zara and the Triassic Tide Pool
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#5E6A7A', lineHeight: 1.8, marginBottom: '1.5rem', fontWeight: 500 }}>
                  Zara loved exploring, so when she found a mysterious tide pool behind her grandmother&apos;s beach house, she couldn&apos;t resist diving in. Little did she know, this wasn&apos;t just any tide pool — it was a portal to a prehistoric world...
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {['Adventure', 'Dinosaurs', 'Ocean', 'Mystery'].map(tag => (
                    <span key={tag} style={{ background: '#FFF0E0', border: '1px solid #FFD4A8', borderRadius: '20px', padding: '0.35rem 0.875rem', fontSize: '0.82rem', fontWeight: 700, color: '#FF6B35' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #0D183D 0%, #1496A6 100%)', borderRadius: '16px', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', opacity: 0.85, fontWeight: 600 }}>Beautifully illustrated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Simple pricing</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#0D183D', marginBottom: '0.75rem' }}>
              One plan. Unlimited stories.
            </h2>
            <p style={{ color: '#5E6A7A', fontSize: '0.95rem', fontWeight: 500 }}>Cancel anytime.</p>
          </div>

          <div className="two-col">
            {/* Monthly */}
            <div style={{ border: '2px solid #F0E4D0', borderRadius: '16px', padding: '2rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0D183D' }}>Monthly</h3>
              <p style={{ color: '#5E6A7A', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Flexible, cancel anytime</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF6B35' }}>A$9.99</span>
                <span style={{ color: '#5E6A7A', fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', border: '2px solid #FF6B35', borderRadius: '10px', color: '#FF6B35', textDecoration: 'none', fontWeight: '700', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                Get started
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Up to 15 stories per month', 'Multiple children profiles', 'Story series (up to 4 volumes)', 'Beautifully illustrated pages', 'Read on any device'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#0D183D', alignItems: 'flex-start', fontWeight: 500 }}>
                    <Check size={17} color="#6CC06C" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Annual — featured */}
            <div style={{ border: '2px solid #FF6B35', borderRadius: '16px', padding: '2rem', background: '#FF6B35', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#FFB703', color: '#0D183D', padding: '0.35rem 1.1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                SAVE 20%
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Annual</h3>
              <p style={{ opacity: 0.85, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Best value — 2 months free</p>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>A$7.99</span>
                <span style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 500 }}>A$95.90 billed annually</p>
              <Link href="/signup?plan=annual" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: 'white', borderRadius: '10px', color: '#FF6B35', textDecoration: 'none', fontWeight: '800', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                Get started
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Everything in Monthly', 'Priority story generation', 'Early access to new features', 'Save A$24 per year'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', alignItems: 'flex-start', fontWeight: 500 }}>
                    <Check size={17} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: '#FFF4E6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', textAlign: 'center', marginBottom: '3rem', color: '#0D183D' }}>
            Parents love it
          </h2>
          <div className="three-col">
            {[
              { quote: 'My son has anxiety around bedtime, but his personalised story makes him feel calm and special.', author: 'Father of Leo, age 5' },
              { quote: 'The stories are so specific to my daughter — her interests, her friends, even her cat. She thinks it\'s magic.', author: 'Mother of Sophie, age 7' },
              { quote: 'We\'ve been doing a story series together. My kids are obsessed with what happens next in each volume.', author: 'Parent of twins, age 9' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #F0E4D0', boxShadow: '0 2px 12px rgba(13,24,61,0.05)' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#FFB703"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p className="font-serif" style={{ fontSize: '0.9375rem', color: '#0D183D', lineHeight: 1.7, marginBottom: '1rem' }}>"{t.quote}"</p>
                <p style={{ fontSize: '0.8rem', color: '#5E6A7A', fontWeight: 600 }}>— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0D183D', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1496A6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Dream it. Read it. Live it.</p>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Tonight&apos;s bedtime story is waiting.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
            Create your child&apos;s profile in 2 minutes and read their first personalised story tonight.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#FF6B35', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1rem' }}>
            Start for free
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 500 }}>3 free stories included. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#080E22', color: 'rgba(255,255,255,0.4)', padding: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="font-serif" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Tale</span>
            <span className="font-serif" style={{ color: '#FF6B35', fontSize: '1.1rem' }}>Pop</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} TalePop</span>
        </div>
      </footer>
    </div>
  );
}
