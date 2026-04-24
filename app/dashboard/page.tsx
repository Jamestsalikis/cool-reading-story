'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Settings, CreditCard, Plus, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const bookColors = [
  { cover: '#741515', spine: '#4a0d0d' },
  { cover: '#1a3a5a', spine: '#0d2035' },
  { cover: '#2a4a1a', spine: '#162810' },
  { cover: '#4a1a5a', spine: '#2d0f38' },
  { cover: '#7a4a10', spine: '#4a2c08' },
  { cover: '#1a4a4a', spine: '#0d2d2d' },
];

function BookCard({ story, index }: { story: Story; index: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const c = bookColors[index % bookColors.length];

  return (
    <div
      style={{ perspective: '900px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => router.push(`/stories/${story.id}`)}
    >
      {/* Book body */}
      <div style={{ position: 'relative', width: '140px', height: '190px', transformStyle: 'preserve-3d' }}>

        {/* Spine */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '18px', height: '100%',
          background: `linear-gradient(90deg, ${c.spine} 0%, ${c.cover} 100%)`,
          borderRadius: '3px 0 0 3px', zIndex: 3,
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.25)',
        }} />

        {/* Pages stack (depth illusion) */}
        {[4, 2, 0].map((offset) => (
          <div key={offset} style={{
            position: 'absolute', left: `${18 + offset}px`, top: `${offset * 0.5}px`,
            width: `calc(100% - ${18 + offset}px)`, height: `calc(100% - ${offset}px)`,
            background: '#F5F0E8', borderRadius: '0 4px 4px 0',
            boxShadow: '1px 0 3px rgba(0,0,0,0.08)',
          }} />
        ))}

        {/* Interior (visible when open) */}
        <div style={{
          position: 'absolute', left: '18px', top: 0,
          width: 'calc(100% - 18px)', height: '100%',
          background: '#FFFEF9', borderRadius: '0 6px 6px 0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '14px 12px', gap: '8px',
          boxShadow: 'inset 6px 0 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '2.4rem' }}>{story.theme || '📖'}</div>
          <p style={{
            fontSize: '0.72rem', fontFamily: 'Georgia, serif',
            textAlign: 'center', color: '#2C1A0E', lineHeight: 1.4, fontWeight: '600',
          }}>{story.title}</p>
          <p style={{ fontSize: '0.65rem', color: '#9B8B7A' }}>{story.children?.name}</p>
          <div style={{
            marginTop: '6px', fontSize: '0.68rem', fontWeight: '700',
            color: '#741515', opacity: open ? 1 : 0, transition: 'opacity 0.2s',
          }}>
            Open book →
          </div>
        </div>

        {/* Cover — flips open on hover */}
        <div style={{
          position: 'absolute', left: '18px', top: 0,
          width: 'calc(100% - 18px)', height: '100%',
          background: `linear-gradient(160deg, ${c.cover} 0%, ${c.spine} 100%)`,
          borderRadius: '0 6px 6px 0',
          transformOrigin: 'left center',
          transform: open ? 'rotateY(-162deg)' : 'rotateY(0deg)',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          backfaceVisibility: 'hidden',
          zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '14px 12px', gap: '8px',
          boxShadow: open
            ? '-10px 6px 24px rgba(0,0,0,0.35)'
            : '3px 3px 10px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: '2.8rem' }}>{story.theme || '📖'}</div>
          <p style={{
            fontSize: '0.75rem', fontFamily: 'Georgia, serif',
            textAlign: 'center', color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.4, fontWeight: '600',
          }}>{story.title}</p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
            {story.children?.name} · {story.word_count ? `${story.word_count} words` : ''}
          </p>
          {/* Decorative lines */}
          <div style={{ position: 'absolute', bottom: '14px', left: '12px', right: '12px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '12px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      {/* Label below */}
      <p style={{
        fontSize: '0.72rem', color: '#6B5E4E', textAlign: 'center',
        maxWidth: '130px', lineHeight: 1.3, fontFamily: 'Georgia, serif',
      }}>
        {new Date(story.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

const generatingStyles = `
  @keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-120px) scale(0.4); opacity: 0; }
  }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  .spark { position: absolute; font-size: 1.4rem; animation: floatUp 2.4s ease-in infinite; }
  .spark:nth-child(1) { left: 15%; animation-delay: 0s; }
  .spark:nth-child(2) { left: 30%; animation-delay: 0.4s; }
  .spark:nth-child(3) { left: 50%; animation-delay: 0.8s; }
  .spark:nth-child(4) { left: 68%; animation-delay: 0.2s; }
  .spark:nth-child(5) { left: 82%; animation-delay: 1.1s; }
  .spark:nth-child(6) { left: 42%; animation-delay: 1.6s; }
`;

type Child = { id: string; name: string; age: number; interests: string[] };

type Story = {
  id: string;
  title: string;
  theme: string;
  created_at: string;
  word_count: number;
  is_favourite: boolean;
  series_id: string | null;
  series_title: string | null;
  volume_number: number | null;
  children: { name: string; age: number };
};

type SeriesGroup = {
  series_id: string;
  series_title: string;
  child_name: string;
  volumes: Story[];
  is_complete: boolean;
};


export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('stories');
  const [storyTab, setStoryTab] = useState<'singles' | 'series'>('singles');
  const [isMobile, setIsMobile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingChildName, setGeneratingChildName] = useState('');
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
      .select('id, title, theme, created_at, word_count, is_favourite, series_id, series_title, volume_number, children(name, age)')
      .order('created_at', { ascending: false });

    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateStory = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    setGeneratingChildName(child?.name || '');
    setGenerating(`new-${childId}`);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      });
      const data = await res.json();
      if (res.ok) { await fetchData(); setStoryTab('singles'); }
      else setGenerateError(data.message || 'Failed to generate story. Please try again.');
    } finally { setGenerating(null); }
  };

  const handleGenerateSequel = async (storyId: string, childName: string) => {
    setGeneratingChildName(childName);
    setGenerating(`sequel-${storyId}`);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-sequel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId }),
      });
      const data = await res.json();
      if (res.ok) { await fetchData(); setStoryTab('series'); }
      else setGenerateError(data.error || 'Failed to generate sequel.');
    } finally { setGenerating(null); }
  };

  // Get each child's latest story (for sequel button)
  const latestStoryByChild = (childId: string): Story | null => {
    const child = children.find(c => c.id === childId);
    if (!child) return null;
    return stories.find(s => s.children?.name === child.name) || null;
  };

  const isSeriesComplete = (story: Story | null): boolean => {
    if (!story) return false;
    if (story.series_id) {
      const seriesVolumes = stories.filter(s => s.series_id === story.series_id);
      return seriesVolumes.some(s => s.volume_number === 4);
    }
    return false;
  };

  // Group stories into series
  const seriesGroups: SeriesGroup[] = [];
  const seriesMap = new Map<string, Story[]>();
  stories.forEach(s => {
    if (s.series_id) {
      if (!seriesMap.has(s.series_id)) seriesMap.set(s.series_id, []);
      seriesMap.get(s.series_id)!.push(s);
    }
  });
  seriesMap.forEach((vols, sid) => {
    const sorted = [...vols].sort((a, b) => (a.volume_number ?? 1) - (b.volume_number ?? 1));
    seriesGroups.push({
      series_id: sid,
      series_title: sorted[0].series_title || sorted[0].title,
      child_name: sorted[0].children?.name || '',
      volumes: sorted,
      is_complete: sorted.some(v => v.volume_number === 4),
    });
  });

  const singleStories = stories.filter(s => !s.series_id);

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const storyTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.875rem', border: 'none',
    background: active ? '#741515' : 'transparent',
    color: active ? '#fff' : '#6B5E4E', transition: 'all 0.2s',
  });

  // BookCard is defined above the component

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{generatingStyles}</style>

      {/* Generating overlay */}
      {generating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,18,9,0.88)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ position: 'relative', width: '280px', height: '80px', marginBottom: '8px' }}>
            {['✨','⭐','🌟','✨','⭐','✨'].map((s, i) => <span key={i} className="spark">{s}</span>)}
          </div>
          <div style={{ fontSize: '5rem', animation: 'pulse 1.6s ease-in-out infinite', marginBottom: '28px' }}>📖</div>
          <p style={{ color: 'white', fontSize: '1.4rem', fontFamily: 'Georgia, serif', marginBottom: '12px', textAlign: 'center', padding: '0 24px' }}>
            {generating.startsWith('sequel') ? `Writing the next chapter for ${generatingChildName}…` : `Writing ${generatingChildName}'s story…`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', animation: 'shimmer 2s ease infinite', textAlign: 'center' }}>
            Usually takes about 30–45 seconds
          </p>
        </div>
      )}

      {/* Sidebar — Desktop */}
      {!isMobile && (
        <div style={{ width: '220px', backgroundColor: '#741515', color: 'white', padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, overflowY: 'auto' }}>
          <h1 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'white' }}>Cool Reading Story</h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeNav === id;
              return (
                <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: isActive ? 'white' : 'transparent', color: isActive ? '#741515' : 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s' }}>
                  <Icon size={20} />{label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '220px', padding: isMobile ? '24px 16px 100px' : '40px', marginBottom: isMobile ? '80px' : 0 }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '6px', color: '#1A1209' }}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h2>
          <p style={{ color: '#6B5E4E', fontSize: '0.95rem' }}>
            {stories.length > 0 ? `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} in your library` : 'Your story library is ready'}
          </p>
        </div>

        {/* ── Stories tab ── */}
        {activeNav === 'stories' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B5E4E' }}>Loading your stories...</div>
            ) : children.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1A1209' }}>Add your first child</h3>
                <p style={{ color: '#6B5E4E', marginBottom: '24px' }}>Complete the onboarding to create a profile and generate their first personalised story.</p>
                <Link href="/onboarding" className="btn-brand" style={{ display: 'inline-flex' }}>Get started</Link>
              </div>
            ) : (
              <>
                {generateError && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#991B1B' }}>{generateError}</div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '6px', background: '#F0EDE8', padding: '4px', borderRadius: '10px', width: 'fit-content', marginBottom: '28px' }}>
                  <button style={storyTabStyle(storyTab === 'singles')} onClick={() => setStoryTab('singles')}>
                    Single stories ({singleStories.length})
                  </button>
                  <button style={storyTabStyle(storyTab === 'series')} onClick={() => setStoryTab('series')}>
                    Series ({seriesGroups.length})
                  </button>
                </div>

                {/* ── Singles tab ── */}
                {storyTab === 'singles' && (
                  <div>
                    {/* Buttons — New story stays here, Continue story moves to Series */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                      {children.map((child) => {
                        const latest = latestStoryByChild(child.id);
                        const seriesComplete = isSeriesComplete(latest);
                        const canContinue = !!latest && !seriesComplete;
                        return (
                          <div key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#6B5E4E', minWidth: '60px' }}>{child.name}</span>
                            <button
                              onClick={() => handleGenerateStory(child.id)}
                              disabled={!!generating}
                              style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1.5px solid #E8E0D0', background: '#fff', color: '#1A1209', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem', opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Plus size={14} /> New story
                            </button>
                            {canContinue && (
                              <button
                                onClick={() => handleGenerateSequel(latest!.id, child.name)}
                                disabled={!!generating}
                                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: '#741515', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem', opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                📖 Continue story → Series
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {singleStories.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#9B8B7A' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                        <p>No standalone stories yet — generate your first one above.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 20px', alignItems: 'flex-start' }}>
                        {singleStories.map((story, i) => <BookCard key={story.id} story={story} index={i} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Series tab ── */}
                {storyTab === 'series' && (
                  <div>
                    {/* Buttons — Continue series stays here, New story moves to Singles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                      {children.map((child) => {
                        const latest = latestStoryByChild(child.id);
                        const seriesComplete = isSeriesComplete(latest);
                        const canContinue = !!latest && !seriesComplete;
                        return (
                          <div key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#6B5E4E', minWidth: '60px' }}>{child.name}</span>
                            {canContinue ? (
                              <button
                                onClick={() => handleGenerateSequel(latest!.id, child.name)}
                                disabled={!!generating}
                                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: '#741515', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem', opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                📖 Continue series
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#9B8B7A' }}>Series complete</span>
                            )}
                            <button
                              onClick={() => handleGenerateStory(child.id)}
                              disabled={!!generating}
                              style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1.5px solid #E8E0D0', background: '#fff', color: '#1A1209', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem', opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Plus size={14} /> New story → Singles
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {seriesGroups.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#9B8B7A' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📖</div>
                        <p>No series yet — click "Continue story" on the Singles tab to start one.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {seriesGroups.map((group) => (
                          <div key={group.series_id} style={{ background: '#fff', border: '1.5px solid #E8E0D0', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: '600', color: '#1A1209', marginBottom: '2px' }}>{group.series_title}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#9B8B7A' }}>{group.child_name} · {group.volumes.length} of 4 volumes</p>
                              </div>
                              {group.is_complete && (
                                <span style={{ background: '#E6F4EC', color: '#1a7a4a', fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>COMPLETE</span>
                              )}
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px 20px', alignItems: 'flex-start' }}>
                              {group.volumes.map((vol, i) => (
                                <BookCard key={vol.id} story={{ ...vol, theme: group.volumes[0].theme }} index={i} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {stories.length === 0 && (
                  <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✨</div>
                    <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#1A1209' }}>Your first story is being written</h3>
                    <p style={{ color: '#6B5E4E', marginBottom: '20px' }}>Claude is crafting a personalised story right now. Refresh in a moment.</p>
                    <button onClick={fetchData} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} /> Check for stories
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Children tab ── */}
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
                        {child.interests.map((i) => <span key={i} className="chip" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{i}</span>)}
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

      {/* Bottom nav — Mobile */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px', backgroundColor: '#741515', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingTop: '8px' }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeNav === id;
            return (
              <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', color: isActive ? 'white' : 'rgba(255,255,255,0.6)', padding: '8px 12px' }}>
                <Icon size={24} />
                <span style={{ fontSize: '0.65rem', fontWeight: '500' }}>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
