'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Settings, CreditCard, ArrowRight, Download } from 'lucide-react';

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('stories');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const storyCards = [
    {
      id: 1,
      title: 'The Secret of the Whispering Woods',
      theme: '🌲',
      gradient: 'linear-gradient(135deg, #1a3a3a 0%, #2d6a5c 100%)',
      child: 'Leo',
      month: 'March 2026',
    },
    {
      id: 2,
      title: "Leo's Journey to the Glass Ocean",
      theme: '🐋',
      gradient: 'linear-gradient(135deg, #0a2540 0%, #1a5a7a 100%)',
      child: 'Leo',
      month: 'March 2026',
    },
    {
      id: 3,
      title: 'The Clockwork Dragon',
      theme: '🐉',
      gradient: 'linear-gradient(135deg, #2a1a3a 0%, #5a3a6a 100%)',
      child: 'Leo',
      month: 'February 2026',
      locked: true,
    },
    {
      id: 4,
      title: 'Coming next',
      theme: '✨',
      gradient: 'linear-gradient(135deg, #5a4a3a 0%, #8a6a5a 100%)',
      child: 'Leo',
      month: 'Your next chapter begins soon...',
      placeholder: true,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <div
          style={{
            width: '220px',
            backgroundColor: '#741515',
            color: 'white',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            overflowY: 'auto',
          }}
        >
          <h1 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'white' }}>
            Cool Reading Story
          </h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'white' : 'transparent',
                    color: isActive ? '#741515' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : '220px',
          padding: isMobile ? '24px 16px 100px' : '40px',
          marginBottom: isMobile ? '80px' : 0,
        }}
      >
        {/* Greeting Section */}
        <div style={{ marginBottom: '48px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#1A1209' }}>
            Welcome back, Sarah
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '600px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#6B5E4E', marginBottom: '8px', fontSize: '0.95rem' }}>
                Next story for Leo: 14 days away
              </p>
              <div
                style={{
                  height: '6px',
                  backgroundColor: '#E8E0D0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '65%',
                    backgroundColor: '#D4A574',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stories Library */}
        {activeNav === 'stories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209' }}>
                Leo's Story Library
              </h3>
              <Link
                href="#"
                style={{
                  color: '#741515',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                View all stories <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              {storyCards.map((card) => (
                <div key={card.id} className="card" style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      background: card.gradient,
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{card.theme}</div>
                      {!card.placeholder && !card.locked && (
                        <h4 className="font-serif" style={{ color: 'white', fontSize: '1.1rem', maxWidth: '80%', margin: '0 auto' }}>
                          {card.title}
                        </h4>
                      )}
                      {card.locked && (
                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>Coming soon</div>
                      )}
                      {card.placeholder && (
                        <div style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>Coming next...</div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h4 className="font-serif" style={{ fontSize: '1.05rem', marginBottom: '4px', color: '#1A1209' }}>
                      {card.title}
                    </h4>
                    <p style={{ color: '#6B5E4E', fontSize: '0.85rem', marginBottom: '16px' }}>
                      {card.child} • {card.month}
                    </p>
                    {!card.locked && !card.placeholder && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/stories/${card.id}`} className="btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                          Preview
                        </Link>
                        <button
                          style={{
                            padding: '0.75rem',
                            border: '2px solid #741515',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Download size={18} color="#741515" />
                        </button>
                      </div>
                    )}
                    {(card.locked || card.placeholder) && (
                      <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6B5E4E', fontSize: '0.9rem' }}>
                        {card.locked ? 'Upcoming' : 'Check back soon'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subscription Card */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFF8F0' }}>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#1A1209' }}>
                Heirloom Membership
              </h3>
              <p style={{ color: '#6B5E4E', marginBottom: '4px', fontSize: '0.95rem' }}>
                Your premium plan for unlimited personalized stories
              </p>
              <p style={{ color: '#6B5E4E', fontSize: '0.85rem', marginBottom: '20px' }}>
                Active since April 2026
              </p>
              <button className="btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
                Manage Plan
              </button>
            </div>
          </div>
        )}

        {/* Other nav content placeholders */}
        {activeNav === 'children' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209' }}>
              Children
            </h3>
            <p style={{ color: '#6B5E4E' }}>Manage your children's profiles</p>
          </div>
        )}

        {activeNav === 'account' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209' }}>
              Account Settings
            </h3>
            <p style={{ color: '#6B5E4E' }}>Manage your account preferences</p>
          </div>
        )}

        {activeNav === 'subscription' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209' }}>
              Subscription
            </h3>
            <p style={{ color: '#6B5E4E' }}>Manage your subscription plan</p>
          </div>
        )}
      </div>

      {/* Bottom Nav - Mobile */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            backgroundColor: '#741515',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTop: '1px solid #E8E0D0',
            paddingTop: '8px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                  padding: '8px 12px',
                  transition: 'color 0.2s',
                }}
              >
                <Icon size={24} />
                <span style={{ fontSize: '0.65rem', fontWeight: '500' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
