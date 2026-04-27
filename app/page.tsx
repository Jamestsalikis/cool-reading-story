'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, BookOpen, Users, Sparkles, Check } from 'lucide-react';

const landingStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
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
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }}>
      <style>{landingStyles}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FAF9F6', borderBottom: '1px solid #E8E3DC', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600, color: '#741515' }}>
            Cool Reading Story
          </div>

          <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>How it works</a>
            <a href="#pricing" style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Pricing</a>
            <Link href="/login" style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.6rem 1.25rem', background: '#741515', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
              Get started
            </Link>
          </div>

          <button
            className="nav-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={24} color="#741515" /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#741515" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E8E3DC', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.95rem' }}>How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.95rem' }}>Pricing</a>
            <Link href="/login" style={{ color: '#1C1614', textDecoration: 'none', fontSize: '0.95rem' }}>Sign in</Link>
            <Link href="/signup" style={{ padding: '0.75rem 1.25rem', background: '#741515', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
              Get started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div className="hero-grid">
          <div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.15, color: '#1C1614', marginBottom: '1.5rem' }}>
              Bedtime stories written just for your child.
            </h1>
            <p style={{ fontSize: '1.0625rem', color: '#6B5E4E', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px' }}>
              Personalised, beautifully illustrated stories where your child is the hero — ready to read in seconds. Unlimited stories from A$9.99/month.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Link href="/signup" style={{ padding: '0.85rem 1.75rem', background: '#741515', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem' }}>
                Start your first story
              </Link>
              <a href="#how-it-works" style={{ padding: '0.85rem 1.5rem', border: '1.5px solid #C8BEAA', color: '#1C1614', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>
                See how it works
              </a>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {['No credit card required', 'Unlimited stories', 'Cancel anytime'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={15} color="#2D7A3A" />
                  <span style={{ fontSize: '0.85rem', color: '#6B5E4E', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Book preview card */}
          <div style={{ background: 'linear-gradient(160deg, #1a1f3a 0%, #2d2e5f 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.25 }}>
              The Secret Starry Forest
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85 }}>
              Once upon a time, in a forest where the trees whispered ancient secrets, a clever child named Sage discovered a path lit by stars...
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial strip */}
      <section style={{ background: '#741515', color: 'white', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p className="font-serif" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontStyle: 'italic', lineHeight: 1.8, marginBottom: '1rem' }}>
            "My daughter asks for her story every single bedtime. She loves seeing herself as the hero. It's become our favourite tradition."
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>— Parent of Emma, age 6</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem', background: 'white' }}>
        <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', color: '#1C1614' }}>
          How it works
        </h2>
        <div className="three-col">
          {[
            { icon: Users, title: 'Build your child\'s profile', desc: "Tell us their name, age, interests and who they love. The more detail, the more personal the story." },
            { icon: Sparkles, title: 'We write the story', desc: 'Our AI writes a unique, age-appropriate adventure featuring your child as the main character — in seconds.' },
            { icon: BookOpen, title: 'Read together tonight', desc: 'Open any story from your library, read it aloud at bedtime, and watch their face light up.' },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#FAF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Icon size={28} color="#741515" />
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1C1614' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: '#6B5E4E', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sample story */}
      <section id="sample" style={{ background: '#F5F1EB', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
            <div className="sample-grid">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#741515', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sample story</p>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1rem', color: '#1C1614' }}>
                  Zara and the Triassic Tide Pool
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#6B5E4E', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Zara loved exploring, so when she found a mysterious tide pool behind her grandmother's beach house, she couldn't resist diving in. Little did she know, this wasn't just any tide pool — it was a portal to a prehistoric world where ancient creatures still roamed...
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {['Adventure', 'Dinosaurs', 'Ocean', 'Mystery'].map(tag => (
                    <span key={tag} style={{ background: '#FAF0F0', border: '1px solid #E8D8D8', borderRadius: '20px', padding: '0.35rem 0.875rem', fontSize: '0.82rem', fontWeight: 500, color: '#741515' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #1a3a5a 0%, #2d6a8a 100%)', borderRadius: '12px', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', opacity: 0.8 }}>Beautifully illustrated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem', background: 'white' }}>
        <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', color: '#1C1614' }}>
          Simple, honest pricing
        </h2>
        <p style={{ textAlign: 'center', color: '#6B5E4E', marginBottom: '3rem', fontSize: '0.95rem' }}>
          One plan. Unlimited stories. Cancel anytime.
        </p>

        <div className="two-col">
          {/* Monthly */}
          <div style={{ border: '2px solid #E8E3DC', borderRadius: '16px', padding: '2rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1C1614' }}>Monthly</h3>
            <p style={{ color: '#9B8B7A', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Flexible, cancel anytime</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#741515' }}>A$9.99</span>
              <span style={{ color: '#9B8B7A', fontSize: '0.9rem' }}>/month</span>
            </div>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', border: '2px solid #741515', borderRadius: '8px', color: '#741515', textDecoration: 'none', fontWeight: '700', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              Get started
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Up to 15 stories per month', 'Multiple children profiles', 'Story series (up to 4 volumes)', 'Beautifully illustrated pages', 'Read on any device'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#1C1614', alignItems: 'flex-start' }}>
                  <Check size={17} color="#2D7A3A" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Annual — featured */}
          <div style={{ border: '2px solid #741515', borderRadius: '16px', padding: '2rem', background: '#741515', color: 'white', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C4784A', color: 'white', padding: '0.35rem 1.1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              SAVE 20%
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem' }}>Annual</h3>
            <p style={{ opacity: 0.8, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Best value — 2 months free</p>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>A$7.99</span>
              <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>/month</span>
            </div>
            <p style={{ opacity: 0.65, fontSize: '0.8rem', marginBottom: '1.5rem' }}>A$95.90 billed annually</p>
            <Link href="/signup?plan=annual" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: 'white', borderRadius: '8px', color: '#741515', textDecoration: 'none', fontWeight: '700', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              Get started
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Everything in Monthly', 'Priority story generation', 'Early access to new features', 'Save A$24 per year'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', alignItems: 'flex-start' }}>
                  <Check size={17} color="#90EE90" style={{ flexShrink: 0, marginTop: '2px' }} />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: '#FAF9F6', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', color: '#1C1614' }}>
            Parents love it
          </h2>
          <div className="three-col">
            {[
              { quote: 'My son has anxiety around bedtime, but his personalised story makes him feel calm and special.', author: 'Father of Leo, age 5' },
              { quote: 'The stories are so specific to my daughter — her interests, her friends, even her cat. She thinks it\'s magic.', author: 'Mother of Sophie, age 7' },
              { quote: 'We\'ve been doing a story series together. My kids are obsessed with what happens next in each volume.', author: 'Parent of twins, age 9' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.75rem', border: '1px solid #E8E3DC' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#741515"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p className="font-serif" style={{ fontSize: '0.9375rem', color: '#1C1614', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic' }}>"{t.quote}"</p>
                <p style={{ fontSize: '0.8rem', color: '#9B8B7A', fontWeight: 500 }}>— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#741515', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Tonight's bedtime story is waiting.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            Create your child's profile in 2 minutes and read their first personalised story tonight.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#741515', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem' }}>
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1C1614', color: 'rgba(255,255,255,0.5)', padding: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <span className="font-serif" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Cool Reading Story</span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} Cool Reading Story</span>
        </div>
      </footer>
    </div>
  );
}
