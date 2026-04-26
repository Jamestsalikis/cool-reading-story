'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Settings, CreditCard, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// One palette per child — all their books share the same colour
const CHILD_PALETTES = [
  { cover: '#741515', spine: '#4d0e0e', light: '#FBF0F0' },
  { cover: '#1A3A5A', spine: '#0d2035', light: '#EEF3F8' },
  { cover: '#2D4A1E', spine: '#1a2d10', light: '#EFF5EB' },
  { cover: '#4A1E5A', spine: '#2d1038', light: '#F3EEF8' },
  { cover: '#5A3A0A', spine: '#352005', light: '#FAF3E8' },
];

const pageStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .book-cover-panel {
    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.55s ease;
  }
  .book-wrap:hover .book-cover-panel {
    transform: rotateY(-162deg);
    box-shadow: -10px 6px 28px rgba(0,0,0,0.3);
  }
  .book-read-hint {
    opacity: 0;
    transition: opacity 0.2s ease 0.3s;
  }
  .book-wrap:hover .book-read-hint {
    opacity: 1;
  }
`;

type Child = { id: string; name: string; age: number; interests: string[] };

type Story = {
  id: string;
  title: string;
  created_at: string;
  word_count: number;
  series_id: string | null;
  series_title: string | null;
  volume_number: number | null;
  children: { name: string; age: number };
};

function BookCard({ story, palette, index }: { story: Story; palette: typeof CHILD_PALETTES[0]; index: number }) {
  const router = useRouter();
  const volNum = story.volume_number;
  const isSequel = volNum && volNum > 1;

  // Decorative cover pattern — SVG encoded inline
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div
      className="book-wrap"
      onClick={() => router.push(`/stories/${story.id}`)}
      style={{ perspective: '900px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
    >
      <div style={{ position: 'relative', width: '140px', height: '196px', transformStyle: 'preserve-3d' }}>

        {/* Spine */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '18px', height: '100%',
          background: `linear-gradient(90deg, ${palette.spine} 0%, ${palette.cover} 100%)`,
          borderRadius: '3px 0 0 3px', zIndex: 3,
          boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3)',
        }} />

        {/* Stacked pages */}
        {[4, 2].map((o) => (
          <div key={o} style={{
            position: 'absolute', left: `${18 + o}px`, top: `${o * 0.4}px`,
            width: `calc(100% - ${18 + o}px)`, height: `calc(100% - ${o * 0.8}px)`,
            background: '#F5F0E8', borderRadius: '0 3px 3px 0',
          }} />
        ))}

        {/* Interior */}
        <div style={{
          position: 'absolute', left: '18px', top: 0,
          width: 'calc(100% - 18px)', height: '100%',
          background: palette.light, borderRadius: '0 6px 6px 0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '16px 12px', gap: '10px',
          boxShadow: 'inset 6px 0 14px rgba(0,0,0,0.05)',
        }}>
          {/* Decorative rule */}
          <div style={{ width: '40px', height: '2px', background: palette.cover, borderRadius: '1px', opacity: 0.4 }} />
          <p style={{
            fontSize: '0.72rem', fontFamily: 'Georgia, serif', fontWeight: '600',
            textAlign: 'center', color: '#1C1614', lineHeight: 1.45,
          }}>{story.title}</p>
          <p style={{ fontSize: '0.62rem', color: '#9B8B7A', letterSpacing: '0.04em' }}>
            {story.children?.name}
          </p>
          <div className="book-read-hint" style={{
            fontSize: '0.68rem', fontWeight: '700', color: palette.cover,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Read
          </div>
        </div>

        {/* Cover */}
        <div
          className="book-cover-panel"
          style={{
            position: 'absolute', left: '18px', top: 0,
            width: 'calc(100% - 18px)', height: '100%',
            background: palette.cover,
            backgroundImage: pattern,
            borderRadius: '0 6px 6px 0',
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden',
            zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px 12px', gap: '8px',
            boxShadow: '3px 3px 12px rgba(0,0,0,0.2)',
          }}
        >
          {/* Vol badge */}
          {isSequel && (
            <div style={{
              position: 'absolute', top: '10px', right: '8px',
              background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)',
              fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.08em',
              padding: '2px 7px', borderRadius: '10px',
            }}>
              VOL {volNum}
            </div>
          )}

          {/* Decorative diamond */}
          <div style={{
            width: '28px', height: '28px',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '3px', transform: 'rotate(45deg)',
            marginBottom: '4px',
          }} />

          <p style={{
            fontSize: '0.75rem', fontFamily: 'Georgia, serif', fontWeight: '600',
            textAlign: 'center', color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.4,
          }}>{story.title}</p>

          <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />

          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {story.children?.name}
          </p>
        </div>
      </div>

      {/* Date label */}
      <p style={{ fontSize: '0.68rem', color: '#9B8B7A', letterSpacing: '0.02em' }}>
        {new Date(story.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('stories');
  const [isMobile, setIsMobile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingName, setGeneratingName] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [userName, setUserName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserName(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there');

    const { data: childrenData } = await supabase.from('children').select('*').order('created_at', { ascending: true });
    const { data: storiesData } = await supabase
      .from('stories')
      .select('id, title, created_at, word_count, series_id, series_title, volume_number, children(name, age)')
      .order('created_at', { ascending: false });

    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateStory = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    setGeneratingName(child?.name || '');
    setGenerating(`new-${childId}`);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      });
      const data = await res.json();
      if (res.ok) await fetchData();
      else setGenerateError(data.message || 'Something went wrong. Please try again.');
    } finally { setGenerating(null); }
  };

  const latestStoryByChild = (childId: string): Story | null => {
    const child = children.find(c => c.id === childId);
    if (!child) return null;
    return stories.find(s => s.children?.name === child.name) || null;
  };

  const isSeriesComplete = (story: Story | null): boolean => {
    if (!story?.series_id) return false;
    return stories.filter(s => s.series_id === story.series_id).some(s => s.volume_number === 4);
  };

  const handleContinueStory = async (childId: string) => {
    const latest = latestStoryByChild(childId);
    const child = children.find(c => c.id === childId);
    if (!latest) return;
    setGeneratingName(child?.name || '');
    setGenerating(`sequel-${latest.id}`);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-sequel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: latest.id }),
      });
      const data = await res.json();
      if (res.ok) await fetchData();
      else setGenerateError(data.error || 'Something went wrong. Please try again.');
    } finally { setGenerating(null); }
  };

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const storiesByChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return [];
    return stories.filter(s => s.children?.name === child.name);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{pageStyles}</style>

      {/* Generating overlay — clean, no emojis */}
      {generating && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(28, 22, 20, 0.85)',
          zIndex: 100, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '24px',
          animation: 'fadeUp 0.3s ease',
        }}>
          {/* Spinner */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.15)',
            borderTopColor: '#C4784A',
            animation: 'spin 1s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '1.35rem', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
              Writing {generatingName}&apos;s story
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', animation: 'pulse 2s ease infinite' }}>
              Usually takes about 30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Sidebar — Desktop */}
      {!isMobile && (
        <div style={{
          width: '210px', background: '#1C1614', padding: '32px 20px',
          display: 'flex', flexDirection: 'column', position: 'fixed',
          height: '100vh', left: 0, top: 0, overflowY: 'auto',
        }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', marginBottom: '40px', color: '#E8DDD0', lineHeight: 1.3 }}>
            Cool Reading<br />Story
          </h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button key={id} onClick={() => setActiveNav(id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px', borderRadius: '8px', border: 'none',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: active ? '600' : '400',
                  transition: 'all 0.15s', textAlign: 'left',
                }}>
                  <Icon size={17} />{label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main */}
      <div style={{
        flex: 1, marginLeft: isMobile ? 0 : '210px',
        padding: isMobile ? '28px 16px 100px' : '48px 48px 60px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#1C1614', marginBottom: '6px', fontWeight: '400' }}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h2>
          <p style={{ color: '#9B8B7A', fontSize: '0.9rem' }}>
            {stories.length > 0 ? `${stories.length} ${stories.length === 1 ? 'book' : 'books'} in your library` : 'Your library is ready'}
          </p>
        </div>

        {/* Stories */}
        {activeNav === 'stories' && (
          <>
            {generateError && (
              <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.875rem', color: '#991B1B' }}>{generateError}</div>
            )}

            {loading ? (
              <p style={{ color: '#9B8B7A', animation: 'pulse 2s ease infinite' }}>Loading your library...</p>
            ) : children.length === 0 ? (
              <div style={{ maxWidth: '440px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', marginBottom: '12px' }}>
                  Your library is empty
                </div>
                <p style={{ color: '#6B5E4E', marginBottom: '28px', lineHeight: 1.6 }}>
                  Add a child profile to start generating personalised bedtime stories.
                </p>
                <Link href="/onboarding" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: '#1C1614', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                  Get started
                </Link>
              </div>
            ) : (
              // One shelf per child
              <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                {children.map((child, childIndex) => {
                  const palette = CHILD_PALETTES[childIndex % CHILD_PALETTES.length];
                  const childStories = storiesByChild(child.id);
                  const latest = latestStoryByChild(child.id);
                  const seriesComplete = isSeriesComplete(latest);
                  const canContinue = !!latest && !seriesComplete;

                  return (
                    <div key={child.id}>
                      {/* Child header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Colour dot */}
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.cover, flexShrink: 0 }} />
                          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', color: '#1C1614', fontWeight: '400' }}>
                            {child.name}&apos;s books
                          </h3>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {canContinue && (
                            <button
                              onClick={() => handleContinueStory(child.id)}
                              disabled={!!generating}
                              style={{
                                padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none',
                                background: palette.cover, color: '#fff',
                                cursor: generating ? 'not-allowed' : 'pointer',
                                fontWeight: '600', fontSize: '0.8rem',
                                opacity: generating ? 0.6 : 1, letterSpacing: '0.02em',
                              }}
                            >
                              Continue the story
                            </button>
                          )}
                          <button
                            onClick={() => handleGenerateStory(child.id)}
                            disabled={!!generating}
                            style={{
                              padding: '0.55rem 1.1rem', borderRadius: '8px',
                              border: `1.5px solid ${palette.cover}`,
                              background: 'transparent', color: palette.cover,
                              cursor: generating ? 'not-allowed' : 'pointer',
                              fontWeight: '600', fontSize: '0.8rem',
                              opacity: generating ? 0.6 : 1, letterSpacing: '0.02em',
                              display: 'flex', alignItems: 'center', gap: '5px',
                            }}
                          >
                            <Plus size={14} /> New story
                          </button>
                        </div>
                      </div>

                      {/* Divider in child's colour */}
                      <div style={{ height: '2px', background: `linear-gradient(90deg, ${palette.cover}40, transparent)`, marginBottom: '28px', borderRadius: '1px' }} />

                      {/* Book shelf */}
                      {childStories.length === 0 ? (
                        <p style={{ color: '#9B8B7A', fontSize: '0.875rem', fontStyle: 'italic' }}>
                          No stories yet — generate the first one above.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px 20px', alignItems: 'flex-start' }}>
                          {childStories.map((story, i) => (
                            <BookCard key={story.id} story={story} palette={palette} index={i} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Children */}
        {activeNav === 'children' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400' }}>Children</h3>
              <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', background: '#1C1614', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add child
              </Link>
            </div>
            {children.length === 0 ? (
              <p style={{ color: '#9B8B7A' }}>No children added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children.map((child, i) => {
                  const palette = CHILD_PALETTES[i % CHILD_PALETTES.length];
                  return (
                    <div key={child.id} style={{ background: '#fff', border: '1px solid #E8E3DC', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${palette.cover}` }}>
                      <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: '600', color: '#1C1614', marginBottom: '4px' }}>{child.name}</h4>
                      <p style={{ color: '#9B8B7A', fontSize: '0.875rem', marginBottom: child.interests?.length ? '12px' : 0 }}>Age {child.age}</p>
                      {child.interests?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {child.interests.slice(0, 6).map((interest) => (
                            <span key={interest} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: palette.light, color: palette.cover, fontWeight: '500' }}>
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeNav === 'account' && (
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400', marginBottom: '8px' }}>Account</h3>
            <p style={{ color: '#9B8B7A' }}>Manage your account preferences</p>
          </div>
        )}

        {activeNav === 'subscription' && (
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400', marginBottom: '8px' }}>Subscription</h3>
            <p style={{ color: '#9B8B7A' }}>Manage your subscription plan</p>
          </div>
        )}
      </div>

      {/* Bottom nav — Mobile */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px', background: '#1C1614', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', border: 'none', background: 'none', cursor: 'pointer', color: active ? '#fff' : 'rgba(255,255,255,0.4)', padding: '8px 12px' }}>
                <Icon size={22} />
                <span style={{ fontSize: '0.6rem', fontWeight: '500', letterSpacing: '0.04em' }}>{label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
