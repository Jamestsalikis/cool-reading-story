'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Settings, CreditCard, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PaywallModal from '@/components/PaywallModal';
import Fable from '@/components/Fable';
import { updateChild } from '@/lib/supabase/child-actions';

const CHILD_PALETTES = [
  { cover: '#741515', spine: '#4d0e0e', light: '#FBF0F0' },
  { cover: '#1A3A5A', spine: '#0d2035', light: '#EEF3F8' },
  { cover: '#2D4A1E', spine: '#1a2d10', light: '#EFF5EB' },
  { cover: '#4A1E5A', spine: '#2d1038', light: '#F3EEF8' },
  { cover: '#5A3A0A', spine: '#352005', light: '#FAF3E8' },
];

// keyframes (spin, pulse) are now in globals.css — no runtime injection needed
const pageStyles = `
  .book-cover-panel {
    transition: transform 0.55s cubic-bezier(0.4,0,0.2,1), box-shadow 0.55s ease;
  }
  .book-wrap:hover .book-cover-panel {
    transform: rotateY(-162deg);
    box-shadow: -10px 6px 28px rgba(0,0,0,0.3);
  }
  .book-read-hint { opacity:0; transition: opacity 0.2s ease 0.3s; }
  .book-wrap:hover .book-read-hint { opacity:1; }
`;

type Child = { id: string; name: string; age: number; interests: string[] };
type Story = {
  id: string; title: string; created_at: string; word_count: number;
  series_id: string | null; series_title: string | null; volume_number: number | null;
  children: { name: string; age: number };
};
type Palette = typeof CHILD_PALETTES[0];

// ── Individual book card (3D flip on hover) ──────────────────────────────────
function BookCard({ story, palette }: { story: Story; palette: Palette }) {
  const router = useRouter();
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;
  const vol = story.volume_number;

  return (
    <div className="book-wrap" onClick={() => router.push(`/stories/${story.id}`)}
      style={{ perspective: '900px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: '140px', height: '196px', transformStyle: 'preserve-3d' }}>
        {/* Spine */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '18px', height: '100%', background: `linear-gradient(90deg, ${palette.spine} 0%, ${palette.cover} 100%)`, borderRadius: '3px 0 0 3px', zIndex: 3, boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3)' }} />
        {/* Pages */}
        {[4, 2].map(o => <div key={o} style={{ position: 'absolute', left: `${18+o}px`, top: `${o*.4}px`, width: `calc(100% - ${18+o}px)`, height: `calc(100% - ${o*.8}px)`, background: '#F5F0E8', borderRadius: '0 3px 3px 0' }} />)}
        {/* Interior */}
        <div style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', background: palette.light, borderRadius: '0 6px 6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px', boxShadow: 'inset 6px 0 14px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '40px', height: '2px', background: palette.cover, borderRadius: '1px', opacity: 0.4 }} />
          <p style={{ fontSize: '0.72rem', fontFamily: 'Georgia, serif', fontWeight: '600', textAlign: 'center', color: '#1C1614', lineHeight: 1.45 }}>{story.title}</p>
          <div className="book-read-hint" style={{ fontSize: '0.68rem', fontWeight: '700', color: palette.cover, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Read</div>
        </div>
        {/* Cover */}
        <div className="book-cover-panel" style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', background: palette.cover, backgroundImage: pattern, borderRadius: '0 6px 6px 0', transformOrigin: 'left center', backfaceVisibility: 'hidden', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px', boxShadow: '3px 3px 12px rgba(0,0,0,0.2)' }}>
          {vol && vol > 1 && <div style={{ position: 'absolute', top: '10px', right: '8px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '10px' }}>VOL {vol}</div>}
          <div style={{ width: '28px', height: '28px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '3px', transform: 'rotate(45deg)', marginBottom: '4px' }} />
          <p style={{ fontSize: '0.75rem', fontFamily: 'Georgia, serif', fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4 }}>{story.title}</p>
          <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>{new Date(story.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

// ── Series fan — volumes fanned like playing cards ────────────────────────────
function SeriesFan({ volumes, palette }: { volumes: Story[]; palette: Palette }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();
  const n = volumes.length;
  const spread = n === 1 ? 0 : n === 2 ? 20 : n === 3 ? 28 : 34;
  const angles = volumes.map((_, i) =>
    n === 1 ? 0 : -spread / 2 + (spread / (n - 1)) * i
  );
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;

  // Container must be wide enough to hold the fanned books
  const containerW = 140 + (n - 1) * 22 + 40;
  const containerH = 196; // matches BookCard height so tops align with flex-start

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: `${containerW}px`, height: `${containerH}px` }}>
        {volumes.map((vol, i) => {
          const isHovered = hoveredId === vol.id;
          const angle = angles[i];
          return (
            <div
              key={vol.id}
              onClick={() => router.push(`/stories/${vol.id}`)}
              onMouseEnter={() => setHoveredId(vol.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'absolute',
                bottom: '0px',
                left: '50%',
                width: '120px',
                height: '168px',
                cursor: 'pointer',
                transformOrigin: 'center bottom',
                transform: `translateX(-50%) rotate(${angle}deg) translateY(${isHovered ? -20 : 0}px)`,
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                zIndex: isHovered ? 50 : i + 1,
                borderRadius: '3px 6px 6px 3px',
                boxShadow: isHovered
                  ? '0 16px 36px rgba(0,0,0,0.35)'
                  : '2px 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              {/* Spine */}
              <div style={{ position: 'absolute', left: 0, top: 0, width: '13px', height: '100%', background: palette.spine, borderRadius: '3px 0 0 3px', boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.25)' }} />
              {/* Cover */}
              <div style={{ position: 'absolute', left: '13px', top: 0, width: 'calc(100% - 13px)', height: '100%', background: palette.cover, backgroundImage: pattern, borderRadius: '0 6px 6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 8px', gap: '5px' }}>
                {/* Vol badge */}
                <div style={{ position: 'absolute', top: '7px', right: '6px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.52rem', fontWeight: '800', letterSpacing: '0.08em', padding: '1px 5px', borderRadius: '8px' }}>
                  VOL {vol.volume_number}
                </div>
                <div style={{ width: '16px', height: '16px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '2px', transform: 'rotate(45deg)' }} />
                <p style={{ fontSize: '0.58rem', fontFamily: 'Georgia, serif', fontWeight: '600', color: 'rgba(255,255,255,0.95)', textAlign: 'center', lineHeight: 1.3 }}>
                  {vol.title.length > 36 ? vol.title.slice(0, 34) + '…' : vol.title}
                </p>
                {isHovered && (
                  <p style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Read</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.68rem', color: '#9B8B7A', letterSpacing: '0.02em', textAlign: 'center', maxWidth: `${containerW}px` }}>
        {(() => { const t = volumes[0].series_title || 'Series'; return t.length > 30 ? t.slice(0, 28) + '…' : t; })()} · {n} {n === 1 ? 'vol' : 'vols'}
      </p>
      <p style={{ fontSize: '0.65rem', color: '#C8BEAA', letterSpacing: '0.02em', textAlign: 'center' }}>
        {new Date(volumes[volumes.length - 1].created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

// ── Shelf items: group series into fans, keep singles as BookCards ─────────────
type ShelfItem =
  | { type: 'single'; story: Story }
  | { type: 'series'; seriesId: string; volumes: Story[] };

function buildShelf(stories: Story[], childName: string): ShelfItem[] {
  const mine = stories.filter(s => s.children?.name === childName);
  const seriesMap = new Map<string, Story[]>();
  const singles: Story[] = [];

  mine.forEach(s => {
    if (s.series_id) {
      if (!seriesMap.has(s.series_id)) seriesMap.set(s.series_id, []);
      seriesMap.get(s.series_id)!.push(s);
    } else {
      singles.push(s);
    }
  });

  const items: ShelfItem[] = [];
  singles.forEach(story => items.push({ type: 'single', story }));
  seriesMap.forEach((vols, seriesId) => {
    const sorted = [...vols].sort((a, b) => (a.volume_number ?? 1) - (b.volume_number ?? 1));
    items.push({ type: 'series', seriesId, volumes: sorted });
  });

  items.sort((a, b) => {
    const aDate = a.type === 'single'
      ? new Date(a.story.created_at).getTime()
      : Math.max(...a.volumes.map(v => new Date(v.created_at).getTime()));
    const bDate = b.type === 'single'
      ? new Date(b.story.created_at).getTime()
      : Math.max(...b.volumes.map(v => new Date(v.created_at).getTime()));
    return bDate - aDate;
  });

  return items;
}

// ── Edit Child Modal ──────────────────────────────────────────────────────────
const INTERESTS = [
  'Superheroes','Fantasy','Fairies','Unicorns','Princesses','Pirates','Magic','Aliens',
  'Dinosaurs','Animals','Ocean','Nature','Space','Robots','Science','Gaming',
  'Soccer','Football','Gymnastics','Dancing','Karate','Swimming',
  'Art','Music','Cooking','Dolls','Cars & Trucks',
];

type ChildRecord = { id: string; name: string; age: number; gender: string | null; interests: string[]; reading_level: string; appearance: Record<string, unknown> };

function EditChildModal({ child, palette, onClose, onSaved }: {
  child: ChildRecord;
  palette: typeof CHILD_PALETTES[0];
  onClose: () => void;
  onSaved: () => void;
}) {
  const app = child.appearance || {};
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [gender, setGender] = useState(child.gender || 'Skip');
  const [interests, setInterests] = useState<string[]>(child.interests || []);
  const [hairColour, setHairColour] = useState((app.hairColour as string) || '');
  const [eyeColour, setEyeColour] = useState((app.eyeColour as string) || '');
  const [city, setCity] = useState((app.city as string) || '');
  const [country, setCountry] = useState((app.country as string) || '');
  const [readingLevel, setReadingLevel] = useState(() => {
    const m: Record<string, string> = { beginner: 'simple', intermediate: 'medium', advanced: 'imaginative' };
    return m[child.reading_level] || 'medium';
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (i: string) => setInterests(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  );

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    const result = await updateChild(child.id, { name, age, gender, interests, hairColour, eyeColour, city, country, readingLevel });
    if (result.error) { setError(result.error); setSaving(false); return; }
    onSaved();
    onClose();
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E8E0D0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff' };
  const chip = (active: boolean): React.CSSProperties => ({ cursor: 'pointer', borderRadius: '8px', fontWeight: '500', fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: `1.5px solid ${active ? palette.cover : '#E8E0D0'}`, background: active ? palette.cover : '#fff', color: active ? '#fff' : '#1C1614' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFEF9', borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#1C1614' }}>Edit {child.name}&apos;s profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B8B7A' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '0.85rem', color: '#991B1B' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Name</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Age</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setAge(a => Math.max(3, a - 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #E8E0D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{age}</span>
              <button onClick={() => setAge(a => Math.min(12, a + 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #E8E0D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Boy', 'Girl', 'Skip'].map(g => <button key={g} onClick={() => setGender(g)} style={chip(gender === g)}>{g}</button>)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '8px' }}>Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} style={chip(interests.includes(i))}>{i}</button>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Hair colour</label><input style={inp} value={hairColour} onChange={e => setHairColour(e.target.value)} placeholder="e.g. Brown" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Eye colour</label><input style={inp} value={eyeColour} onChange={e => setEyeColour(e.target.value)} placeholder="e.g. Blue" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>City</label><input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Sydney" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '6px' }}>Country</label><input style={inp} value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Australia" /></div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B5E4E', display: 'block', marginBottom: '8px' }}>Reading level</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ id: 'simple', label: 'Simple', sub: '3–5' }, { id: 'medium', label: 'Medium', sub: '6–8' }, { id: 'imaginative', label: 'Imaginative', sub: '9–12' }].map(o => (
                <button key={o.id} onClick={() => setReadingLevel(o.id)} style={{ ...chip(readingLevel === o.id), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', padding: '8px 14px' }}>
                  <span>{o.label}</span><span style={{ fontSize: '0.68rem', opacity: 0.75 }}>{o.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #E8E0D0', borderRadius: '8px', background: '#fff', color: '#6B5E4E', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.7rem', border: 'none', borderRadius: '8px', background: palette.cover, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
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
  const [paywallReason, setPaywallReason] = useState<'free_exhausted' | 'monthly_limit' | 'no_subscription' | null>(null);
  const [editingChild, setEditingChild] = useState<ChildRecord | null>(null);
  const [sub, setSub] = useState<{ status: string; free_stories_remaining: number; stories_this_month: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
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
    const { data: subData } = await supabase.from('user_subscriptions').select('status, free_stories_remaining, stories_this_month').eq('user_id', user?.id ?? '').single();
    setSub(subData);
    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const storiesByChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return [];
    return stories.filter(s => s.children?.name === child.name);
  };

  const isSeriesComplete = (childId: string) => {
    const latest = storiesByChild(childId)[0];
    if (!latest?.series_id) return false;
    return stories.filter(s => s.series_id === latest.series_id).some(s => s.volume_number === 4);
  };

  const handleGenerateStory = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    setGeneratingName(child?.name || '');
    setGenerating(`new-${childId}`);
    setGenerateError('');
    try {
      // Phase 1: Generate story text
      const res = await fetch('/api/generate-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ child_id: childId }) });
      const data = await res.json();
      if (res.status === 402) { setPaywallReason(data.reason); return; }
      if (!res.ok) { setGenerateError(data.message || 'Something went wrong.'); return; }

      const storyId = data.story?.id;
      if (!storyId) { await fetchData(); return; }

      // Phase 2: Start image generation for page 1 immediately, Fable paints while we wait
      setGenerating(`painting-${childId}`);
      try {
        const imgRes = await fetch('/api/generate-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_id: storyId, page_number: 1 }),
        });
        const imgData = await imgRes.json();
        const pollUrl = imgData.poll_url;
        if (pollUrl) {
          // Poll up to 15s for page 1 image
          for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const pollRes = await fetch('/api/poll-image', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ story_id: storyId, page_number: 1, poll_url: pollUrl }),
            });
            const pollData = await pollRes.json();
            if (pollData.status === 'succeeded') break;
            if (pollData.status === 'failed') break;
          }
        }
      } catch { /* Image pre-gen failed gracefully — story still navigates */ }

      // Navigate to story — images 2-5 continue generating on the story page
      router.push(`/stories/${storyId}`);
    } finally { setGenerating(null); }
  };

  const handleContinueStory = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    const latest = storiesByChild(childId)[0];
    if (!latest) return;
    setGeneratingName(child?.name || '');
    setGenerating(`sequel-${latest.id}`);
    setGenerateError('');
    try {
      const res = await fetch('/api/generate-sequel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: latest.id }) });
      const data = await res.json();
      if (res.status === 402) { setPaywallReason(data.reason); }
      else if (!res.ok) setGenerateError(data.error || 'Something went wrong.');
      else await fetchData();
    } finally { setGenerating(null); }
  };

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{pageStyles}</style>

      {paywallReason && (
        <PaywallModal reason={paywallReason} onClose={() => setPaywallReason(null)} />
      )}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          palette={CHILD_PALETTES[children.findIndex(c => c.id === editingChild.id) % CHILD_PALETTES.length]}
          onClose={() => setEditingChild(null)}
          onSaved={fetchData}
        />
      )}

      {generating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,22,20,0.92)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Fable
            pose={generating.startsWith('painting') ? 'painting' : 'writing'}
            dialogue={
              generating.startsWith('painting') ? `Almost ready! Painting the first illustration...` :
              generating.startsWith('sequel') ? `Writing the next chapter for ${generatingName}...` :
              `Writing ${generatingName}'s story...`
            }
            size={180}
            darkBackground
          />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '8px', animation: 'pulse 2s ease infinite' }}>
            Usually takes about 30 seconds
          </p>
        </div>
      )}

      {!isMobile && (
        <div style={{ width: '210px', background: '#741515', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, overflowY: 'auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', marginBottom: '40px', color: '#E8DDD0', lineHeight: 1.3 }}>Cool Reading<br />Story</h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '8px', border: 'none', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: active ? '600' : '400', transition: 'all 0.15s', textAlign: 'left' }}>
                  <Icon size={17} />{label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '210px', padding: isMobile ? '28px 16px 100px' : '48px 48px 60px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#1C1614', marginBottom: '6px', fontWeight: '400' }}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <p style={{ color: '#9B8B7A', fontSize: '0.9rem' }}>
              {stories.length > 0 ? `${stories.length} ${stories.length === 1 ? 'book' : 'books'} in your library` : 'Your library is ready'}
            </p>
            {sub && (
              sub.status === 'subscribed' ? (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1a7a4a', background: '#E6F4EC', padding: '3px 10px', borderRadius: '20px' }}>
                  {15 - sub.stories_this_month} of 15 stories left this month
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#741515', background: '#FBF0F0', padding: '3px 10px', borderRadius: '20px' }}>
                  {sub.free_stories_remaining} free {sub.free_stories_remaining === 1 ? 'story' : 'stories'} remaining
                </span>
              )
            )}
          </div>
        </div>

        {activeNav === 'stories' && (
          <>
            {generateError && <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.875rem', color: '#991B1B' }}>{generateError}</div>}

            {loading ? (
              <p style={{ color: '#9B8B7A', animation: 'pulse 2s ease infinite' }}>Loading your library...</p>
            ) : children.length === 0 ? (
              <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Fable pose="welcome" dialogue="Your library is empty — shall we write the first story?" size={150} />
                <div style={{ marginTop: '16px' }}>
                  <Link href="/onboarding" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: '#741515', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Get started</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                {children.map((child, childIndex) => {
                  const palette = CHILD_PALETTES[childIndex % CHILD_PALETTES.length];
                  const shelf = buildShelf(stories, child.name);
                  const canContinue = storiesByChild(child.id).length > 0 && !isSeriesComplete(child.id);

                  return (
                    <div key={child.id}>
                      {/* Child header + actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.cover }} />
                          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#1C1614', fontWeight: '400' }}>
                            {child.name}&apos;s books
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: '#C8BEAA' }}>
                            {storiesByChild(child.id).length} {storiesByChild(child.id).length === 1 ? 'book' : 'books'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {canContinue && (() => {
                            const latest = storiesByChild(child.id)[0];
                            const seriesName = latest?.series_title || latest?.title || 'the story';
                            // Find how many volumes exist in this series
                            const seriesStories = storiesByChild(child.id).filter(s => s.series_id && s.series_id === latest?.series_id);
                            const nextVol = latest?.series_id ? (seriesStories.length + 1) : null;
                            const shortName = seriesName.length > 22 ? seriesName.slice(0, 20) + '…' : seriesName;
                            return (
                              <button onClick={() => handleContinueStory(child.id)} disabled={!!generating}
                                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: palette.cover, color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.8rem', opacity: generating ? 0.6 : 1 }}>
                                {nextVol ? `Continue: ${shortName} · Vol ${nextVol}` : `Continue: ${shortName}`}
                              </button>
                            );
                          })()}
                          <button onClick={() => handleGenerateStory(child.id)} disabled={!!generating}
                            style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: `1.5px solid ${palette.cover}`, background: 'transparent', color: palette.cover, cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.8rem', opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Plus size={14} /> New story
                          </button>
                        </div>
                      </div>

                      <div style={{ height: '2px', background: `linear-gradient(90deg, ${palette.cover}50, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

                      {/* Shelf: singles as BookCards, series as SeriesFan */}
                      {shelf.length === 0 ? (
                        <p style={{ color: '#9B8B7A', fontSize: '0.875rem', fontStyle: 'italic' }}>No stories yet — generate the first one above.</p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 24px', alignItems: 'flex-start' }}>
                          {shelf.map(item =>
                            item.type === 'single' ? (
                              <BookCard key={item.story.id} story={item.story} palette={palette} />
                            ) : (
                              <SeriesFan key={item.seriesId} volumes={item.volumes} palette={palette} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeNav === 'children' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400' }}>Children</h3>
              <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', background: '#1C1614', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add child
              </Link>
            </div>
            {children.length === 0 ? <p style={{ color: '#9B8B7A' }}>No children added yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children.map((child, i) => {
                  const palette = CHILD_PALETTES[i % CHILD_PALETTES.length];
                  return (
                    <div key={child.id} style={{ background: '#fff', border: '1px solid #E8E3DC', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${palette.cover}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: '600', color: '#1C1614' }}>{child.name}</h4>
                        <button onClick={() => setEditingChild(child as ChildRecord)} style={{ fontSize: '0.75rem', fontWeight: '600', color: palette.cover, background: palette.light, border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                      </div>
                      <p style={{ color: '#9B8B7A', fontSize: '0.875rem', marginBottom: child.interests?.length ? '12px' : 0 }}>Age {child.age}</p>
                      {child.interests?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {child.interests.slice(0, 6).map(interest => (
                            <span key={interest} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: palette.light, color: palette.cover, fontWeight: '500' }}>{interest}</span>
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
          <div style={{ maxWidth: '480px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400', marginBottom: '28px' }}>Account</h3>
            <div style={{ background: '#fff', border: '1px solid #E8E3DC', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '0.75rem', color: '#9B8B7A', marginBottom: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Signed in as</p>
              <p style={{ fontWeight: '600', color: '#1C1614', fontSize: '0.95rem' }}>{userName}</p>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #E8E3DC', background: '#fff', color: '#741515', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}
            >
              Sign out
            </button>
          </div>
        )}

        {activeNav === 'subscription' && (
          <div style={{ maxWidth: '480px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', fontWeight: '400', marginBottom: '28px' }}>Subscription</h3>
            <div style={{ background: '#fff', border: '1px solid #E8E3DC', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontWeight: '600', color: '#1C1614', fontSize: '0.95rem' }}>Current plan</p>
                <span style={{
                  fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                  background: sub?.status === 'subscribed' ? '#E6F4EC' : '#FBF0F0',
                  color: sub?.status === 'subscribed' ? '#1a7a4a' : '#741515',
                }}>
                  {sub?.status === 'subscribed' ? 'Active' : 'Free'}
                </span>
              </div>
              {sub?.status === 'subscribed' ? (
                <p style={{ color: '#6B5E4E', fontSize: '0.875rem' }}>
                  {15 - (sub?.stories_this_month ?? 0)} of 15 stories remaining this month.
                </p>
              ) : (
                <p style={{ color: '#6B5E4E', fontSize: '0.875rem' }}>
                  {sub?.free_stories_remaining ?? 0} free {(sub?.free_stories_remaining ?? 0) === 1 ? 'story' : 'stories'} remaining. Subscribe for unlimited access.
                </p>
              )}
            </div>
            {sub?.status === 'subscribed' ? (
              <button
                onClick={async () => {
                  const res = await fetch('/api/stripe/portal', { method: 'POST' });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #741515', background: '#fff', color: '#741515', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
              >
                Manage billing
              </button>
            ) : (
              <button
                onClick={() => setPaywallReason('free_exhausted')}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#741515', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
              >
                Subscribe — from A$9.99/month
              </button>
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px', background: '#741515', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', border: 'none', background: 'none', cursor: 'pointer', color: active ? '#fff' : 'rgba(255,255,255,0.35)', padding: '8px 12px' }}>
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
