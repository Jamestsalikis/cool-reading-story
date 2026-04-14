'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Users, BookOpen, Mail, Star, Check } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: '#FAF7F0', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#FAF7F0',
          borderBottom: '1px solid #E8E0D0',
          padding: '1.25rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#741515' }}>
            Cool Reading Story
          </div>

          {/* Desktop Nav */}
          <div
            style={{
              display: 'none',
              gap: '3rem',
              '@media (min-width: 768px)': { display: 'flex' },
            }}
            className="hidden md:flex gap-12"
          >
            <Link href="#how-it-works" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
              How it works
            </Link>
            <Link href="#pricing" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
              Pricing
            </Link>
            <Link href="#sample" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
              Sample Story
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="hidden md:flex">
            <Link
              href="/login"
              style={{
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                color: '#741515',
                textDecoration: 'none',
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
            <Link href="/signup" className="btn-brand" style={{ textDecoration: 'none' }}>
              Start free trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={24} color="#741515" />
            ) : (
              <Menu size={24} color="#741515" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E8E0D0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="#how-it-works" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem' }}>
                How it works
              </Link>
              <Link href="#pricing" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem' }}>
                Pricing
              </Link>
              <Link href="#sample" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem' }}>
                Sample Story
              </Link>
              <Link href="/login" style={{ color: '#1A1209', textDecoration: 'none', fontSize: '0.9375rem' }}>
                Sign in
              </Link>
              <Link href="/signup" className="btn-brand" style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
        }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        <div>
          <h1
            className="font-serif"
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              lineHeight: '1.2',
              color: '#1A1209',
              marginBottom: '1.5rem',
            }}
          >
            A bedtime story written just for your child, every single month.
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: '#6B5E4E',
              lineHeight: '1.6',
              marginBottom: '2rem',
            }}
          >
            Personalised, beautifully illustrated stories where your child is the hero. Delivered as a gorgeous PDF straight to your inbox.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-brand" style={{ textDecoration: 'none' }}>
              Start your story
            </Link>
            <button className="btn-outline" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              See a sample story
            </button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Star size={18} color="#2D7A3A" fill="#2D7A3A" />
              <span style={{ fontSize: '0.875rem', color: '#1A1209', fontWeight: 500 }}>Loved by 2,000+ parents</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Check size={18} color="#2D7A3A" />
              <span style={{ fontSize: '0.875rem', color: '#1A1209', fontWeight: 500 }}>30-day free trial</span>
            </div>
          </div>
        </div>

        {/* Storybook Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #2d2e5f 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: '400px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦊</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <Star size={20} fill="white" color="white" />
            <Star size={20} fill="white" color="white" />
            <Star size={20} fill="white" color="white" />
            <Star size={20} fill="white" color="white" />
            <Star size={20} fill="white" color="white" />
          </div>
          <h3
            className="font-serif"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              lineHeight: '1.3',
            }}
          >
            The Secret Starry Forest
          </h3>
          <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', opacity: 0.9 }}>
            Once upon a time, in a forest where the trees whispered ancient secrets, a clever fox named Sage discovered a path lit by stars...
          </p>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section
        style={{
          background: '#741515',
          color: 'white',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: '1.25rem',
              fontStyle: 'italic',
              lineHeight: '1.8',
              marginBottom: '1rem',
            }}
          >
            "My daughter asks for her story every single bedtime. She loves seeing herself as the hero. It's become our favourite tradition."
          </p>
          <p style={{ fontSize: '0.9375rem', opacity: 0.9 }}>— Sarah M., parent of Emma, age 6</p>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '5rem 2rem',
          background: 'white',
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#1A1209',
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '2rem',
          }}
          className="grid grid-cols-1 md:grid-cols-3"
        >
          {[
            { icon: Users, title: 'Build profile', desc: "Tell us about your child's interests, favourite colours, and personality traits." },
            { icon: BookOpen, title: 'We write story', desc: 'Our AI crafts a unique, age-appropriate story featuring your child as the main character.' },
            { icon: Mail, title: 'PDF by email', desc: 'Receive a beautifully illustrated PDF story delivered to your inbox every month.' },
          ].map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    background: '#FAF7F0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <IconComponent size={32} color="#741515" />
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: '#1A1209',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#6B5E4E', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sample Story Teaser */}
      <section
        id="sample"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '5rem 2rem',
          background: '#F0EBE0',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          <div>
            <h3
              className="font-serif"
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#1A1209',
              }}
            >
              Zara and the Triassic Tide Pool
            </h3>
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#6B5E4E',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
              }}
            >
              Zara loved exploring, so when she found a mysterious tide pool behind her grandmother's beach house, she couldn't resist diving in. Little did she know, this wasn't just any tide pool—it was a portal to a prehistoric world where ancient creatures still roamed...
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['Adventure', 'Dinosaurs', 'Ocean', 'Mystery'].map((tag) => (
                <span
                  key={tag}
                  className="chip"
                  style={{
                    background: '#FAF7F0',
                    border: '1.5px solid #E8E0D0',
                    borderRadius: '999px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              fontSize: '5rem',
              textAlign: 'center',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            🏖️
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '5rem 2rem',
          background: 'white',
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#1A1209',
          }}
        >
          Flexible pricing for every family
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {/* Digital Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              border: '2px solid #E8E0D0',
            }}
          >
            <h3
              className="font-serif"
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#1A1209',
              }}
            >
              Digital
            </h3>
            <p style={{ color: '#6B5E4E', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>PDF stories delivered to your inbox</p>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#741515',
                marginBottom: '2rem',
              }}
            >
              $14.99<span style={{ fontSize: '1rem', color: '#6B5E4E', fontWeight: 500 }}>/month</span>
            </div>
            <button
              className="btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginBottom: '2rem',
                cursor: 'pointer',
              }}
            >
              Get started
            </button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'One story per month',
                'Personalised to your child',
                'Beautiful PDF illustrations',
                'Email delivery',
                'Cancel anytime',
              ].map((feature) => (
                <li
                  key={feature}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.9375rem',
                    color: '#1A1209',
                  }}
                >
                  <Check size={20} color="#2D7A3A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Heirloom Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#741515',
              color: 'white',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '2rem',
                background: '#2D7A3A',
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              MOST POPULAR
            </div>
            <h3
              className="font-serif"
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Heirloom
            </h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9375rem', opacity: 0.9 }}>Everything in Digital, plus printed books</p>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                marginBottom: '2rem',
              }}
            >
              $35<span style={{ fontSize: '1rem', opacity: 0.85, fontWeight: 500 }}>/month</span>
            </div>
            <button
              className="btn-brand"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginBottom: '2rem',
                background: 'white',
                color: '#741515',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#F0EBE0';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'white';
              }}
            >
              Get started
            </button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Two stories per month',
                'Personalised to your child',
                'Hardcover printed book annually',
                'Premium illustrations',
                'Priority email delivery',
                'Access to story archive',
                'Cancel anytime',
              ].map((feature) => (
                <li
                  key={feature}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.9375rem',
                  }}
                >
                  <Check size={20} color="#2D7A3A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '5rem 2rem',
          background: '#FAF7F0',
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#1A1209',
          }}
        >
          Parents love it
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '2rem',
          }}
          className="grid grid-cols-1 md:grid-cols-3"
        >
          {[
            {
              quote: 'My son has anxiety around bedtime, but his personalised story makes him feel calm and special.',
              author: 'Michael T.',
              role: 'Father of Leo, 5',
            },
            {
              quote: 'As a busy parent, this is such a thoughtful way to spend quality time with my daughter each month.',
              author: 'Jennifer L.',
              role: 'Mother of Sophie, 7',
            },
            {
              quote: 'The illustrations are absolutely stunning. We frame the stories and display them in his room.',
              author: 'Marcus D.',
              role: 'Parent of James, 6',
            },
          ].map((testimonial, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  marginBottom: '1rem',
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#2D7A3A" color="#2D7A3A" />
                ))}
              </div>
              <p style={{ fontSize: '0.9375rem', color: '#1A1209', lineHeight: '1.7', marginBottom: '1.5rem', flex: 1 }}>
                "{testimonial.quote}"
              </p>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{testimonial.author}</p>
                <p style={{ fontSize: '0.875rem', color: '#6B5E4E' }}>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: '#741515',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}
          >
            Their first story is waiting.
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.7',
              marginBottom: '2rem',
              opacity: 0.95,
            }}
          >
            Start with a 30-day free trial. No credit card required. Cancel anytime.
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              color: '#741515',
              padding: '0.875rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#F0EBE0';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'white';
            }}
          >
            Start free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: '#1A1209',
          color: '#B0A090',
          padding: '3rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Security'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers'],
            },
            {
              title: 'Legal',
              links: ['Privacy', 'Terms', 'Contact'],
            },
            {
              title: 'Follow',
              links: ['Twitter', 'Instagram', 'Facebook'],
            },
          ].map((column) => (
            <div key={column.title}>
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'white', fontSize: '0.9375rem' }}>{column.title}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {column.links.map((link) => (
                  <li key={link} style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#B0A090', textDecoration: 'none', fontSize: '0.875rem' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #3A3229', paddingTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p>&copy; 2024 Cool Reading Story. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
