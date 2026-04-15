'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Settings, CreditCard, Download, Plus, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Child = {
  id: string;
  name: string;
  age: number;
  interests: string[];
};

type Story = {
  id: string;
  title: string;
  theme: string;
  created_at: string;
  word_count: number;
  is_favourite: boolean;
  children: { name: string; age: number };
};

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('stories');
  const [isMobile, setIsMobile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null); // child_id being generated for
  const [generateError, setGenerateError] = useState('');
  const [userName, setUserName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there');
    }

    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: storiesData } = await supabase
      .from('stories')
      .select('*, children(name, age)')
      .order('created_at', { ascending: false });

    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateStory = async (childId: string) => {
    setGenerating(childId);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData();
      } else {
        setGenerateError(data.message || 'Failed to generate story. Please try again.');
      }
    } finally {
      setGenerating(null);
    }
  };

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const gradients = [
    'linear-gradient(135deg, #1a3a3a 0%, #2d6a5c 100%)',
    'linear-gradient(135deg, #0a2540 0%, #1a5a7a 100%)',
    'linear-gradient(135deg, #2a1a3a 0%, #5a3a6a 100%)',
    'linear-gradient(135deg, #3a1a1a 0%, #741515 100%)',
    'linear-gradient(135deg, #1a2a3a 0%, #2a5a7a 100%)',
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
        {/* Greeting */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#1A1209' }}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h2>
          <p style={{ color: '#6B5E4E', fontSize: '0.95rem' }}>
            {stories.length > 0
              ? `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} in your library`
              : 'Your story library is ready — generate your first story below'}
          </p>
        </div>

        {/* Stories Tab */}
        {activeNav === 'stories' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B5E4E' }}>
                Loading your stories...
              </div>
            ) : children.length === 0 ? (
              /* No children yet */
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1A1209' }}>
                  Add your first child
                </h3>
                <p style={{ color: '#6B5E4E', marginBottom: '24px' }}>
                  Complete the onboarding to create a child profile and generate their first personalised story.
                </p>
                <Link href="/onboarding" className="btn-brand" style={{ display: 'inline-flex' }}>
                  Get started
                </Link>
              </div>
            ) : (
              <>
                {/* Generation error */}
                {generateError && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#991B1B' }}>
                    {generateError}
                  </div>
                )}

                {/* Generate story buttons per child */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleGenerateStory(child.id)}
                      disabled={generating === child.id}
                      className="btn-brand"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: generating === child.id ? 0.7 : 1,
                        cursor: generating === child.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {generating === child.id ? (
                        <><RefreshCw size={16} /> Generating for {child.name}...</>
                      ) : (
                        <><Plus size={16} /> New story for {child.name}</>
                      )}
                    </button>
                  ))}
                </div>

                {/* Story grid */}
                {stories.length === 0 ? (
                  <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
                    <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1A1209' }}>
                      Your first story is being written
                    </h3>
                    <p style={{ color: '#6B5E4E', marginBottom: '24px' }}>
                      Claude is crafting a personalised story right now. Refresh in a moment.
                    </p>
                    <button onClick={fetchData} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} /> Check for stories
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '24px',
                    }}
                  >
                    {stories.map((story, index) => (
                      <div key={story.id} className="card" style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            background: gradients[index % gradients.length],
                            height: '180px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{story.theme || '📖'}</div>
                            <h4 className="font-serif" style={{ color: 'white', fontSize: '1rem', maxWidth: '80%', margin: '0 auto', lineHeight: 1.3 }}>
                              {story.title}
                            </h4>
                          </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                          <h4 className="font-serif" style={{ fontSize: '1rem', marginBottom: '4px', color: '#1A1209' }}>
                            {story.title}
                          </h4>
                          <p style={{ color: '#6B5E4E', fontSize: '0.85rem', marginBottom: '16px' }}>
                            {story.children?.name} • {story.word_count ? `${story.word_count} words` : ''} • {new Date(story.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href={`/stories/${story.id}`} className="btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                              Read
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeNav === 'children' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209' }}>Children</h3>
              <Link href="/onboarding" className="btn-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <Plus size={16} /> Add child
              </Link>
            </div>
            {children.length === 0 ? (
              <p style={{ color: '#6B5E4E' }}>No children added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {children.map((child) => (
                  <div key={child.id} className="card" style={{ padding: '20px' }}>
                    <h4 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#1A1209' }}>{child.name}</h4>
                    <p style={{ color: '#6B5E4E', fontSize: '0.875rem', marginBottom: '8px' }}>Age {child.age}</p>
                    {child.interests?.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {child.interests.map((interest) => (
                          <span key={interest} className="chip" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{interest}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav === 'account' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209', marginBottom: '8px' }}>Account Settings</h3>
            <p style={{ color: '#6B5E4E' }}>Manage your account preferences</p>
          </div>
        )}

        {activeNav === 'subscription' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#1A1209', marginBottom: '8px' }}>Subscription</h3>
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
