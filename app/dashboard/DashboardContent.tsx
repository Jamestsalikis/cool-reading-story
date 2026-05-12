'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Settings, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PaywallModal from '@/components/PaywallModal';
import { updateChild } from '@/lib/supabase/child-actions';

const CHILD_PALETTES = [
  { cover: '#FF6B35', spine: '#CC4B1A', light: '#FFF0E6', emoji: '🦁' },
  { cover: '#8E7BFF', spine: '#5c48e0', light: '#F0EEFF', emoji: '🦊' },
  { cover: '#1496A6', spine: '#0c6a77', light: '#E6F6F8', emoji: '🐬' },
  { cover: '#E8A020', spine: '#b87a10', light: '#FFF6E0', emoji: '🦋' },
  { cover: '#6CC06C', spine: '#4a9a4a', light: '#EEF8EE', emoji: '🐸' },
];

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
  .top-nav-tab { transition: all 0.15s ease; border-radius: 999px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 18px; font-weight: 600; font-size: 0.875rem; }
  .top-nav-tab:hover { background: rgba(13,24,61,0.08) !important; }
  .continue-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .continue-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.18) !important; }
  @keyframes confetti-fall {
    0%   { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
  }
  @keyframes writing-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(1.08); }
  }
`;

type Child = { id: string; name: string; age: number; interests: string[] };
type Story = {
  id: string; title: string; created_at: string; word_count: number;
  series_id: string | null; series_title: string | null; volume_number: number | null;
  pages: Array<{ page_number: number; image_url?: string }> | null;
  children: { name: string; age: number };
};
type Palette = typeof CHILD_PALETTES[0];

function getBookTilt(id: string): number {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ((hash % 5) - 2) * 0.5;
}

function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  const dots = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${3 + (i * 1.6) % 94}%`,
    color: ['#FF6B35','#FFB703','#1496A6','#8E7BFF','#6CC06C','#FF3366','#FFD700','#FF6B35'][i % 8],
    delay: `${((i * 0.051) % 0.85).toFixed(2)}s`,
    dur: `${(1.3 + (i * 0.031) % 1.3).toFixed(2)}s`,
    size: `${6 + (i % 7)}px`,
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0%',
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      {dots.map(d => (
        <div key={d.id} style={{ position: 'absolute', top: '-20px', left: d.left, width: d.size, height: d.size, background: d.color, borderRadius: d.shape, animation: `confetti-fall ${d.dur} ${d.delay} ease-in forwards` }} />
      ))}
    </div>
  );
}

function BookCard({ story, palette, onContinue }: { story: Story; palette: Palette; onContinue?: () => void }) {
  const router = useRouter();
  const coverImage = story.pages?.[0]?.image_url;
  const tilt = getBookTilt(story.id);
  const vol = story.volume_number;
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;

  return (
    <div style={{ transform: `rotate(${tilt}deg)`, transition: 'transform 0.2s ease', transformOrigin: 'bottom center' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${tilt}deg) scale(1)`)}>
      <div className="book-wrap" onClick={() => router.push(`/stories/${story.id}`)}
        style={{ perspective: '900px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '140px', height: '196px', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '18px', height: '100%', background: `linear-gradient(90deg, ${palette.spine} 0%, ${palette.cover} 100%)`, borderRadius: '3px 0 0 3px', zIndex: 3, boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3)' }} />
          {[4, 2].map(o => <div key={o} style={{ position: 'absolute', left: `${18+o}px`, top: `${o*.4}px`, width: `calc(100% - ${18+o}px)`, height: `calc(100% - ${o*.8}px)`, background: '#FFF0E6', borderRadius: '0 3px 3px 0' }} />)}
          <div style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', borderRadius: '0 6px 6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px', overflow: 'hidden', background: '#FFF8F0' }}>
            {coverImage && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />}
            <div style={{ position: 'relative', zIndex: 1, width: '40px', height: '2px', background: palette.cover, borderRadius: '1px', opacity: 0.4 }} />
            <p style={{ position: 'relative', zIndex: 1, fontSize: '0.72rem', fontFamily: 'Fredoka, cursive', textAlign: 'center', color: '#0D183D', lineHeight: 1.45 }}>{story.title}</p>
            <div className="book-read-hint" style={{ position: 'relative', zIndex: 1, fontSize: '0.68rem', fontWeight: '700', color: palette.cover, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Read</div>
          </div>
          <div className="book-cover-panel" style={{ position: 'absolute', left: '18px', top: 0, width: 'calc(100% - 18px)', height: '100%', background: palette.cover, borderRadius: '0 6px 6px 0', transformOrigin: 'left center', backfaceVisibility: 'hidden', zIndex: 2, overflow: 'hidden', boxShadow: '3px 3px 14px rgba(0,0,0,0.22)' }}>
            {coverImage ? (
              <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)' }} />
                {vol && vol > 1 && <div style={{ position: 'absolute', top: '8px', right: '7px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.58rem', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', zIndex: 1 }}>VOL {vol}</div>}
                <p style={{ position: 'absolute', bottom: '22px', left: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Fredoka, cursive', color: '#fff', lineHeight: 1.35, textShadow: '0 1px 4px rgba(0,0,0,0.7)', zIndex: 1 }}>{story.title}</p>
                <p style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', fontSize: '0.55rem', color: 'rgba(255,255,255,0.65)', zIndex: 1, letterSpacing: '0.03em' }}>{new Date(story.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern }} />
                {vol && vol > 1 && <div style={{ position: 'absolute', top: '10px', right: '8px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.6rem', fontWeight: '800', padding: '2px 7px', borderRadius: '10px' }}>VOL {vol}</div>}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '3px', transform: 'rotate(45deg)' }} />
                  <p style={{ fontSize: '0.75rem', fontFamily: 'Fredoka, cursive', textAlign: 'center', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4 }}>{story.title}</p>
                  <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{new Date(story.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {onContinue && (
        <button onClick={e => { e.stopPropagation(); onContinue(); }}
          style={{ marginTop: '6px', padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,53,0.35)' }}>
          Next chapter →
        </button>
      )}
    </div>
  );
}

function SeriesFan({ volumes, palette, onContinue }: { volumes: Story[]; palette: Palette; onContinue?: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();
  const n = volumes.length;
  const spread = n === 1 ? 0 : n === 2 ? 20 : n === 3 ? 28 : 34;
  const angles = volumes.map((_, i) => n === 1 ? 0 : -spread / 2 + (spread / (n - 1)) * i);
  const containerW = 140 + (n - 1) * 22 + 40;
  const pattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40Z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;
  const seriesTitle = volumes[0].series_title || 'Series';
  const seriesTitleDisplay = seriesTitle.length > 30 ? seriesTitle.slice(0, 28) + '…' : seriesTitle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: `${containerW}px`, height: '196px' }}>
        {volumes.map((vol, i) => {
          const isHovered = hoveredId === vol.id;
          const coverImage = vol.pages?.[0]?.image_url;
          return (
            <div key={vol.id} onClick={() => router.push(`/stories/${vol.id}`)} onMouseEnter={() => setHoveredId(vol.id)} onMouseLeave={() => setHoveredId(null)}
              style={{ position: 'absolute', bottom: 0, left: '50%', width: '120px', height: '168px', cursor: 'pointer', transformOrigin: 'center bottom', transform: `translateX(-50%) rotate(${angles[i]}deg) translateY(${isHovered ? -20 : 0}px)`, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', zIndex: isHovered ? 50 : i + 1, borderRadius: '3px 6px 6px 3px', overflow: 'hidden', boxShadow: isHovered ? '0 16px 36px rgba(0,0,0,0.35)' : '2px 4px 10px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '13px', height: '100%', background: palette.spine, zIndex: 1, boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.25)' }} />
              <div style={{ position: 'absolute', left: '13px', top: 0, width: 'calc(100% - 13px)', height: '100%', background: palette.cover, overflow: 'hidden' }}>
                {coverImage ? (
                  <>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
                  </>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern }} />
                )}
                <div style={{ position: 'absolute', top: '6px', right: '5px', background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '0.5rem', fontWeight: '800', padding: '1px 5px', borderRadius: '6px', zIndex: 2 }}>VOL {vol.volume_number}</div>
                {!coverImage && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px' }}>
                    <p style={{ fontSize: '0.56rem', fontFamily: 'Fredoka, cursive', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.3 }}>{vol.title.length > 36 ? vol.title.slice(0, 34) + '…' : vol.title}</p>
                  </div>
                )}
                {isHovered && (
                  <p style={{ position: 'absolute', bottom: '8px', left: '5px', right: '5px', fontSize: '0.52rem', fontFamily: 'Fredoka, cursive', color: '#fff', textAlign: 'center', zIndex: 2, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{vol.title.length > 30 ? vol.title.slice(0, 28) + '…' : vol.title}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.68rem', color: '#5E6A7A', textAlign: 'center', maxWidth: `${containerW}px` }}>{seriesTitleDisplay} · {n} {n === 1 ? 'vol' : 'vols'}</p>
      {onContinue && n < 4 && (
        <button onClick={e => { e.stopPropagation(); onContinue(); }}
          style={{ marginTop: '6px', padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,53,0.35)' }}>
          Next chapter →
        </button>
      )}
    </div>
  );
}

type ShelfItem = { type: 'single'; story: Story } | { type: 'series'; seriesId: string; volumes: Story[] };

function buildShelf(stories: Story[], childName: string): ShelfItem[] {
  // Only include stories that have a generated cover image
  const mine = stories.filter(s => s.children?.name === childName && s.pages?.[0]?.image_url?.includes('supabase'));
  const seriesMap = new Map<string, Story[]>();
  const singles: Story[] = [];
  mine.forEach(s => {
    if (s.series_id) {
      if (!seriesMap.has(s.series_id)) seriesMap.set(s.series_id, []);
      seriesMap.get(s.series_id)!.push(s);
    } else singles.push(s);
  });
  const items: ShelfItem[] = [];
  singles.forEach(story => items.push({ type: 'single', story }));
  seriesMap.forEach((vols, seriesId) => {
    items.push({ type: 'series', seriesId, volumes: [...vols].sort((a, b) => (a.volume_number ?? 1) - (b.volume_number ?? 1)) });
  });
  items.sort((a, b) => {
    const aDate = a.type === 'single' ? new Date(a.story.created_at).getTime() : Math.max(...a.volumes.map(v => new Date(v.created_at).getTime()));
    const bDate = b.type === 'single' ? new Date(b.story.created_at).getTime() : Math.max(...b.volumes.map(v => new Date(v.created_at).getTime()));
    return bDate - aDate;
  });
  return items;
}

const INTERESTS = ['Superheroes','Fantasy','Fairies','Unicorns','Princesses','Pirates','Magic','Aliens','Dinosaurs','Animals','Ocean','Nature','Space','Robots','Science','Gaming','Soccer','Football','Gymnastics','Dancing','Karate','Swimming','Art','Music','Cooking','Dolls','Cars & Trucks'];

type ChildRecord = { id: string; name: string; age: number; gender: string | null; interests: string[]; reading_level: string; appearance: Record<string, unknown> };

function EditChildModal({ child, palette, onClose, onSaved }: { child: ChildRecord; palette: typeof CHILD_PALETTES[0]; onClose: () => void; onSaved: () => void }) {
  const app = child.appearance || {};
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [gender, setGender] = useState(child.gender || 'Skip');
  const [interests, setInterests] = useState<string[]>(child.interests || []);
  const [skinColour, setSkinColour] = useState((app.skinColour as string) || '');
  const [hairColour, setHairColour] = useState((app.hairColour as string) || '');
  const [eyeColour, setEyeColour] = useState((app.eyeColour as string) || '');
  const [city, setCity] = useState((app.city as string) || '');
  const [country, setCountry] = useState((app.country as string) || '');
  const [readingLevel, setReadingLevel] = useState(() => { const m: Record<string,string> = { beginner:'simple', intermediate:'medium', advanced:'imaginative' }; return m[child.reading_level] || 'medium'; });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toggleInterest = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : prev.length >= 5 ? prev : [...prev, i]);
  const [customInterestVal, setCustomInterestVal] = useState('');
  const handleAddCustom = () => {
    const val = customInterestVal.trim();
    if (val && interests.length < 5 && !interests.includes(val)) {
      setInterests(prev => [...prev, val]);
      setCustomInterestVal('');
    }
  };
  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    const result = await updateChild(child.id, { name, age, gender, interests, skinColour, hairColour, eyeColour, city, country, readingLevel });
    if (result.error) { setError(result.error); setSaving(false); return; }
    onSaved(); onClose();
  };
  const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff' };
  const chip = (active: boolean): React.CSSProperties => ({ cursor: 'pointer', borderRadius: '8px', fontWeight: '500', fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: `1.5px solid ${active ? palette.cover : '#F0E4D0'}`, background: active ? palette.cover : '#fff', color: active ? '#fff' : '#0D183D' });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFEF9', borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.3rem', color: '#0D183D' }}>Edit {child.name}&apos;s profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6A7A' }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '0.85rem', color: '#991B1B' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Name</label><input style={inp} value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Age</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setAge(a => Math.max(3, a - 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>-</button>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{age}</span>
              <button onClick={() => setAge(a => Math.min(12, a + 1))} style={{ width: '36px', height: '36px', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
            </div>
          </div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Gender</label><div style={{ display: 'flex', gap: '8px' }}>{['Boy','Girl','Skip'].map(g => <button key={g} onClick={() => setGender(g)} style={chip(gender === g)}>{g}</button>)}</div></div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '4px' }}>Interests</label>
            <p style={{ fontSize: '0.75rem', color: interests.length >= 5 ? '#FF6B35' : '#9CA3AF', marginBottom: '8px' }}>{interests.length}/5 selected{interests.length >= 5 ? ' — remove one to add another' : ''}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} style={chip(interests.includes(i))} disabled={!interests.includes(i) && interests.length >= 5}>{i}</button>)}
              {interests.filter(i => !INTERESTS.includes(i)).map(i => (
                <button key={i} onClick={() => toggleInterest(i)} style={{ ...chip(true), display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i} <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>×</span>
                </button>
              ))}
            </div>
            {interests.length < 5 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Add a custom interest..."
                  value={customInterestVal}
                  onChange={e => setCustomInterestVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
                />
                {customInterestVal.trim() && (
                  <button onClick={handleAddCustom} style={{ padding: '0.6rem 1rem', background: palette.cover, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Skin colour</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([{ label: 'White', hex: '#F5D5B5' }, { label: 'Tanned', hex: '#C8956C' }, { label: 'Semi Brown', hex: '#8D5524' }, { label: 'Brown', hex: '#4A2512' }] as {label:string;hex:string}[]).map(({ label, hex }) => (
                  <button key={label} type="button" title={label}
                    onClick={() => setSkinColour(skinColour === label ? '' : label)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: hex, border: skinColour === label ? '3px solid #FF6B35' : '3px solid transparent', outline: skinColour === label ? '2px solid #FF6B35' : '2px solid #E0CDB8', outlineOffset: '2px', cursor: 'pointer', flexShrink: 0 }}
                  />
                ))}
              </div>
            </div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Hair colour</label><input style={inp} value={hairColour} onChange={e => setHairColour(e.target.value)} placeholder="e.g. Brown" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Eye colour</label><input style={inp} value={eyeColour} onChange={e => setEyeColour(e.target.value)} placeholder="e.g. Blue" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>City</label><input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Sydney" /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '6px' }}>Country</label><input style={inp} value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Australia" /></div>
          </div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', display: 'block', marginBottom: '8px' }}>Reading level</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{id:'simple',label:'Simple',sub:'3-5'},{id:'medium',label:'Medium',sub:'6-8'},{id:'imaginative',label:'Imaginative',sub:'9-12'}].map(o => (
                <button key={o.id} onClick={() => setReadingLevel(o.id)} style={{ ...chip(readingLevel === o.id), display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 14px' }}><span>{o.label}</span><span style={{ fontSize: '0.68rem', opacity: 0.75 }}>{o.sub}</span></button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #F0E4D0', borderRadius: '8px', background: '#fff', color: '#5E6A7A', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.7rem', border: 'none', borderRadius: '8px', background: palette.cover, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
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
  const generatingLock = useRef(false);
  const [generatingName, setGeneratingName] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [paywallReason, setPaywallReason] = useState<'free_exhausted' | 'monthly_limit' | 'no_subscription' | 'daily_limit' | null>(null);
  const [editingChild, setEditingChild] = useState<ChildRecord | null>(null);
  const [sub, setSub] = useState<{ status: string; free_stories_remaining: number; stories_this_month: number; stories_today: number; extra_books_today: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [accountSection, setAccountSection] = useState<null | 'email' | 'password'>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { setUserEmail(user.email ?? ''); setUserId(user.id); }
    const { data: childrenData } = await supabase.from('children').select('*').order('created_at', { ascending: true });
    const { data: storiesData } = await supabase.from('stories').select('id, title, created_at, word_count, series_id, series_title, volume_number, pages, children(name, age)').order('created_at', { ascending: false });
    const { data: subData } = await supabase.from('user_subscriptions').select('status, free_stories_remaining, stories_this_month, stories_today, extra_books_today').eq('user_id', user?.id ?? '').single();
    setSub(subData);
    setChildren(childrenData || []);
    setStories(storiesData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('extra_book=true')) {
      fetchData(); window.history.replaceState({}, '', '/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);
  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const onFocus = () => fetchData(); window.addEventListener('focus', onFocus); return () => window.removeEventListener('focus', onFocus); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const booksRemainingToday = sub?.status === 'subscribed' ? Math.max(0, 1 + (sub.extra_books_today ?? 0) - (sub.stories_today ?? 0)) : 0;
  let booksRemainingThisMonth = 0;
  if (sub?.status === 'subscribed') {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    booksRemainingThisMonth = (lastDay - now.getDate() + 1) - ((sub.stories_today ?? 0) > 0 ? 1 : 0);
  }

  const storiesByChild = (childId: string) => { const child = children.find(c => c.id === childId); if (!child) return []; return stories.filter(s => s.children?.name === child.name); };
  const isSeriesComplete = (childId: string) => { const latest = storiesByChild(childId)[0]; if (!latest?.series_id) return false; return stories.filter(s => s.series_id === latest.series_id).some(s => s.volume_number === 4); };

  const handleGenerateStory = async (childId: string) => {
    if (generatingLock.current) return;
    generatingLock.current = true;
    const child = children.find(c => c.id === childId);
    setGeneratingName(child?.name || '');
    setGenerating(`new-${childId}`); setGenerateError('');
    try {
      const res = await fetch('/api/generate-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ child_id: childId }) });
      const data = await res.json();
      if (res.status === 402) { setPaywallReason(data.reason); return; }
      if (!res.ok) { setGenerateError(data.error || data.message || 'Something went wrong. Please try again.'); return; }
      const storyId = data.story?.id;
      if (!storyId) { await fetchData(); return; }
      setGenerating(`painting-${childId}`);
      try {
        const imgRes = await fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: storyId, page_number: 1 }) });
        const imgData = await imgRes.json();
        const pollUrl = imgData.poll_url;
        if (pollUrl) {
          for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const pollRes = await fetch('/api/poll-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: storyId, page_number: 1, poll_url: pollUrl }) });
            const pollData = await pollRes.json();
            if (pollData.status === 'succeeded' || pollData.status === 'failed') break;
          }
        }
      } catch { /* image pre-gen failed gracefully */ }
      setShowConfetti(true);
      router.push(`/stories/${storyId}`);
    } finally { setGenerating(null); generatingLock.current = false; }
  };

  const handleContinueStory = async (storyId: string) => {
    const storyRef = stories.find(s => s.id === storyId);
    if (!storyRef) return;
    const childName = storyRef.children?.name || '';
    setGeneratingName(childName);
    setGenerating(`sequel-${storyId}`); setGenerateError('');
    try {
      const res = await fetch('/api/generate-sequel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story_id: storyId }) });
      const data = await res.json();
      if (res.status === 402) setPaywallReason(data.reason);
      else if (!res.ok) setGenerateError(data.error || 'Something went wrong.');
      else { await fetchData(); }
    } finally { setGenerating(null); }
  };

  const navItems = [
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'account', label: 'Account', icon: Settings },
  ];

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstChild = children[0];
  const mostRecentStory = stories[0];
  const mostRecentCover = mostRecentStory?.pages?.[0]?.image_url;
  const mostRecentChildIndex = mostRecentStory ? children.findIndex(c => c.name === mostRecentStory.children?.name) : 0;
  const mostRecentPalette = CHILD_PALETTES[Math.max(0, mostRecentChildIndex) % CHILD_PALETTES.length];

  return (
    <div style={{ minHeight: '100vh', background: '#FFF4E6' }}>
      <style>{pageStyles}</style>

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      {paywallReason && <PaywallModal reason={paywallReason} onClose={() => setPaywallReason(null)} />}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          palette={CHILD_PALETTES[children.findIndex(c => c.id === editingChild.id) % CHILD_PALETTES.length]}
          onClose={() => setEditingChild(null)}
          onSaved={fetchData}
        />
      )}

      {generating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,8,0.93)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ fontSize: '4rem', animation: 'writing-pulse 1.4s ease-in-out infinite' }}>
            {generating.startsWith('painting') ? '🎨' : '✨'}
          </div>
          <p style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', color: '#FFB703', textAlign: 'center', lineHeight: 1.3 }}>
            {generating.startsWith('painting') ? 'Painting the illustrations...' : generating.startsWith('sequel') ? `Writing the next adventure for ${generatingName}!` : `Writing ${generatingName}'s story...`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', animation: 'writing-pulse 2s ease infinite' }}>Usually takes about 30 seconds</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB703', animation: `writing-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {/* Top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFF4E6', borderBottom: '2px solid #F0E4D0', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', gap: '12px' }}>
        <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src="/mood-3.png" alt="TalePop" style={{ height: '52px', width: 'auto' }} />
        </a>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(13,24,61,0.06)', borderRadius: '999px', padding: '4px' }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button key={id} className="top-nav-tab" onClick={() => setActiveNav(id)} style={{ background: active ? '#0D183D' : 'transparent', color: active ? '#fff' : '#5E6A7A' }}>
                  <Icon size={15} />{label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {sub && !isMobile && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', background: sub.status === 'subscribed' ? '#E6F4EC' : '#FFF0E6', color: sub.status === 'subscribed' ? '#1a7a4a' : '#FF6B35' }}>
              {sub.status === 'subscribed' ? (booksRemainingToday > 0 ? '✨ Story ready tonight!' : '🌙 New story tomorrow') : `${sub.free_stories_remaining} free stories left`}
            </span>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} style={{ fontSize: '0.8rem', fontWeight: '600', color: '#5E6A7A', background: 'white', border: '1.5px solid #F0E4D0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ padding: isMobile ? '24px 16px 100px' : '40px 48px 60px', maxWidth: '1400px', margin: '0 auto' }}>

        {!loading && children.length > 0 && activeNav === 'stories' && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#0D183D', fontWeight: '400', marginBottom: '6px' }}>
              {timeGreeting}, {firstChild?.name}! {hour >= 18 ? '🌙' : hour >= 12 ? '☀️' : '🌟'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <p style={{ color: '#5E6A7A', fontSize: '0.95rem' }}>
                {stories.length === 0 ? 'Your library is waiting for its first story.' : `${stories.length} ${stories.length === 1 ? 'book' : 'books'} in the library`}
              </p>
              {sub && sub.status === 'subscribed' && (
                <>
                  <span style={{ color: '#D1D5DB', fontSize: '0.8rem' }}>·</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: booksRemainingToday > 0 ? '#F0FDF4' : '#FFF7ED', color: booksRemainingToday > 0 ? '#15803D' : '#C2410C', border: `1px solid ${booksRemainingToday > 0 ? '#BBF7D0' : '#FED7AA'}` }}>
                    {booksRemainingToday > 0 ? `${booksRemainingToday} tonight` : 'New story tomorrow'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                    {booksRemainingThisMonth} this month
                  </span>
                </>
              )}
              {sub && sub.status !== 'subscribed' && sub.free_stories_remaining > 0 && (
                <>
                  <span style={{ color: '#D1D5DB', fontSize: '0.8rem' }}>·</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
                    {sub.free_stories_remaining} free {sub.free_stories_remaining === 1 ? 'story' : 'stories'} left
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {activeNav === 'stories' && (
          <>
            {generateError && <div style={{ background: '#FEE2E2', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.875rem', color: '#991B1B' }}>{generateError}</div>}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '80px 0' }}>
                <div style={{ fontSize: '3rem', animation: 'writing-pulse 1.2s ease-in-out infinite' }}>📚</div>
                <p style={{ color: '#5E6A7A', fontFamily: 'Fredoka, cursive', fontSize: '1.1rem' }}>Loading your library...</p>
              </div>
            ) : children.length === 0 ? (
              <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '60px auto 0' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px', animation: 'writing-pulse 2s ease-in-out infinite' }}>📖</div>
                <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.6rem', color: '#0D183D', marginBottom: '8px' }}>Your library is empty!</h3>
                <p style={{ color: '#5E6A7A', marginBottom: '24px', lineHeight: 1.6 }}>Let&apos;s create a child&apos;s profile and write their very first story.</p>
                <Link href="/onboarding" style={{ display: 'inline-block', padding: '0.85rem 2rem', background: '#FF6B35', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 16px rgba(255,107,53,0.35)' }}>Let&apos;s get started!</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                {/* Continue reading hero */}
                {mostRecentStory && (
                  <div className="continue-card" onClick={() => router.push(`/stories/${mostRecentStory.id}`)}
                    style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', height: isMobile ? '180px' : '220px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backgroundImage: 'url(/continue-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {/* Story cover image blended into right side when available */}
                    {mostRecentCover && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mostRecentCover})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.35 }} />}
                    {/* Left-to-right gradient keeps text readable over any background */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(30,10,0,0.82) 0%, rgba(20,6,0,0.55) 45%, rgba(0,0,0,0.08) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '24px', left: '28px' }}>
                      <p style={{ color: 'rgba(255,210,140,0.85)', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.12em', marginBottom: '6px', textTransform: 'uppercase' }}>
                        ▶ Continue reading · {mostRecentStory.children?.name}
                      </p>
                      <p style={{ fontFamily: 'Fredoka, cursive', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: '#fff', marginBottom: '14px', lineHeight: 1.2, maxWidth: '400px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {mostRecentStory.title}
                      </p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FF6B35', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.875rem', boxShadow: '0 2px 12px rgba(255,107,53,0.5)' }}>
                        Keep reading →
                      </span>
                    </div>
                  </div>
                )}

                {/* Child shelves */}
                {children.map((child, childIndex) => {
                  const palette = CHILD_PALETTES[childIndex % CHILD_PALETTES.length];
                  const shelf = buildShelf(stories, child.name);
                  const canContinue = storiesByChild(child.id).length > 0 && !isSeriesComplete(child.id);
                  const latestStory = storiesByChild(child.id)[0];
                  const seriesStoriesForChild = latestStory?.series_id ? storiesByChild(child.id).filter(s => s.series_id === latestStory.series_id) : [];
                  const nextVolForChild = latestStory?.series_id ? (seriesStoriesForChild.length + 1) : 2;

                  return (
                    <div key={child.id}>
                      <div style={{ background: palette.light, borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{palette.emoji}</span>
                          <div>
                            <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.3rem', color: '#0D183D', fontWeight: '400', marginBottom: '2px' }}>{child.name}&apos;s Library</h3>
                            <p style={{ fontSize: '0.78rem', color: '#5E6A7A' }}>{storiesByChild(child.id).length} {storiesByChild(child.id).length === 1 ? 'story' : 'stories'}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button onClick={() => handleGenerateStory(child.id)} disabled={!!generating}
                            style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `2px solid ${palette.cover}`, background: 'white', color: palette.cover, cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={14} /> New story
                          </button>
                        </div>
                      </div>

                      {shelf.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA8B4', fontSize: '0.9rem' }}>
                          No stories yet. Hit &quot;New story&quot; to write the first one!
                        </div>
                      ) : (
                        <div style={{ background: `linear-gradient(to bottom, ${palette.light}88, ${palette.light}22)`, borderRadius: '16px 16px 0 0', padding: '24px 24px 0' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 20px', alignItems: 'flex-end', paddingBottom: '20px' }}>
                            {shelf.map(item =>
                              item.type === 'single'
                                ? <BookCard key={item.story.id} story={item.story} palette={palette} onContinue={!generating ? () => handleContinueStory(item.story.id) : undefined} />
                                : <SeriesFan key={item.seriesId} volumes={item.volumes} palette={palette} onContinue={item.volumes.length < 4 && !generating ? () => handleContinueStory(item.volumes[item.volumes.length - 1].id) : undefined} />
                            )}
                          </div>
                          <div style={{ height: '14px', background: 'linear-gradient(to bottom, #D4974E 0%, #A87240 50%, #8B5E30 100%)', borderRadius: '0 0 4px 4px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.12), 0 5px 12px rgba(0,0,0,0.2)' }} />
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
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400' }}>Children</h3>
              <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', background: '#0D183D', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add child
              </Link>
            </div>
            {children.length === 0 ? <p style={{ color: '#5E6A7A' }}>No children added yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children.map((child, i) => {
                  const palette = CHILD_PALETTES[i % CHILD_PALETTES.length];
                  return (
                    <div key={child.id} style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${palette.cover}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{palette.emoji}</span>
                          <h4 style={{ fontFamily: 'Fredoka, cursive', fontWeight: '600', color: '#0D183D' }}>{child.name}</h4>
                        </div>
                        <button onClick={() => setEditingChild(child as ChildRecord)} style={{ fontSize: '0.75rem', fontWeight: '600', color: palette.cover, background: palette.light, border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                      </div>
                      <p style={{ color: '#5E6A7A', fontSize: '0.875rem', marginBottom: child.interests?.length ? '12px' : 0, paddingLeft: '34px' }}>Age {child.age}</p>
                      {child.interests?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: '34px' }}>
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
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Account info ── */}
            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '16px' }}>Account</h3>
              <div style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.72rem', color: '#5E6A7A', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Signed in as</p>
                <p style={{ fontWeight: '600', color: '#0D183D', fontSize: '0.95rem' }}>{userEmail || (firstChild?.name ? `${firstChild.name}'s family` : 'Your account')}</p>
              </div>
              {/* Change email / password toggles */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button onClick={() => { setAccountSection(accountSection === 'email' ? null : 'email'); setAccountMsg(null); }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: accountSection === 'email' ? '#FFF0E6' : '#fff', color: '#0D183D', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                  Change email
                </button>
                <button onClick={() => { setAccountSection(accountSection === 'password' ? null : 'password'); setAccountMsg(null); }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: accountSection === 'password' ? '#FFF0E6' : '#fff', color: '#0D183D', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                  Change password
                </button>
              </div>
              {/* Inline form */}
              {accountSection && (
                <div style={{ background: '#FFF8F3', border: '1.5px solid #F0E4D0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  {accountSection === 'email' ? (
                    <>
                      <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '10px' }}>Enter a new email address. We'll send a confirmation link.</p>
                      <input type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                      <button disabled={accountLoading || !newEmail} onClick={async () => {
                        setAccountLoading(true); setAccountMsg(null);
                        const { error } = await supabase.auth.updateUser({ email: newEmail });
                        setAccountLoading(false);
                        setAccountMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Confirmation sent — check your new inbox.' });
                        if (!error) setNewEmail('');
                      }} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', opacity: accountLoading || !newEmail ? 0.5 : 1 }}>
                        {accountLoading ? 'Sending…' : 'Send confirmation'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '10px' }}>Choose a new password (minimum 8 characters).</p>
                      <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
                      <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                      <button disabled={accountLoading || newPassword.length < 8 || newPassword !== confirmPassword} onClick={async () => {
                        setAccountLoading(true); setAccountMsg(null);
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        setAccountLoading(false);
                        setAccountMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Password updated successfully.' });
                        if (!error) { setNewPassword(''); setConfirmPassword(''); setAccountSection(null); }
                      }} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', opacity: (accountLoading || newPassword.length < 8 || newPassword !== confirmPassword) ? 0.5 : 1 }}>
                        {accountLoading ? 'Updating…' : 'Update password'}
                      </button>
                    </>
                  )}
                  {accountMsg && (
                    <p style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: '600', color: accountMsg.ok ? '#1a7a4a' : '#cc2200' }}>{accountMsg.text}</p>
                  )}
                </div>
              )}
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #F0E4D0', background: '#fff', color: '#FF6B35', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                Sign out
              </button>
            </div>

            {/* ── Subscription ── */}
            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '16px' }}>Subscription</h3>
              <div style={{ background: '#fff', border: '1px solid #F0E4D0', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontWeight: '600', color: '#0D183D', fontSize: '0.95rem' }}>Current plan</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: sub?.status === 'subscribed' ? '#E6F4EC' : '#FFF0E6', color: sub?.status === 'subscribed' ? '#1a7a4a' : '#FF6B35' }}>
                    {sub?.status === 'subscribed' ? 'Active' : 'Free'}
                  </span>
                </div>
                {sub?.status === 'subscribed' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#5E6A7A', fontSize: '0.875rem' }}>Stories available today</p>
                      <span style={{ fontWeight: '700', color: booksRemainingToday > 0 ? '#1a7a4a' : '#FF6B35' }}>{booksRemainingToday}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#5E6A7A', fontSize: '0.875rem' }}>Stories remaining this month</p>
                      <span style={{ fontWeight: '700', color: '#0D183D' }}>{booksRemainingThisMonth}</span>
                    </div>
                    {booksRemainingToday === 0 && (
                      <button onClick={() => setPaywallReason('daily_limit')}
                        style={{ marginTop: '4px', padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', background: '#FF6B35', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                        Add a story tonight - A$0.99
                      </button>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#5E6A7A', fontSize: '0.875rem' }}>
                    {sub?.free_stories_remaining ?? 0} free {(sub?.free_stories_remaining ?? 0) === 1 ? 'story' : 'stories'} remaining. Subscribe for a new story every night.
                  </p>
                )}
              </div>
              {sub?.status === 'subscribed' ? (
                <button onClick={async () => { const res = await fetch('/api/stripe/portal', { method: 'POST' }); const d = await res.json(); if (d.url) window.location.href = d.url; }}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #FF6B35', background: '#fff', color: '#FF6B35', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                  Manage billing
                </button>
              ) : (
                <button onClick={() => setPaywallReason('free_exhausted')}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none', background: '#FF6B35', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                  Subscribe - from A$9.99/month
                </button>
              )}
            </div>

            {/* ── Referral code ── */}
            <div>
              <h3 style={{ fontFamily: 'Fredoka, cursive', fontSize: '1.4rem', color: '#0D183D', fontWeight: '400', marginBottom: '8px' }}>Refer a friend 🎁</h3>
              <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '12px' }}>Share your code — your friend gets <strong>10% off</strong> their first month.</p>
              <div style={{ background: '#fff', border: '1.5px solid #F0E4D0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '0.12em', color: '#FF6B35' }}>
                  {userId ? `TALE-${userId.replace(/-/g,'').slice(0,8).toUpperCase()}` : '—'}
                </span>
                <button onClick={() => {
                  const code = `TALE-${userId.replace(/-/g,'').slice(0,8).toUpperCase()}`;
                  navigator.clipboard.writeText(code).then(() => { setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); });
                }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: referralCopied ? '#1a7a4a' : '#FF6B35', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                  {referralCopied ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #cc2200', background: '#fff', color: '#cc2200', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                  Delete my account
                </button>
              ) : (
                <div style={{ background: '#FFF5F5', border: '1.5px solid #cc2200', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#cc2200', fontWeight: '600', marginBottom: '8px' }}>This will permanently delete your account, all children, and all stories. This cannot be undone.</p>
                  <p style={{ fontSize: '0.82rem', color: '#5E6A7A', marginBottom: '10px' }}>Type <strong>DELETE</strong> to confirm:</p>
                  <input type="text" placeholder="DELETE" value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cc2200', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #F0E4D0', background: '#fff', color: '#5E6A7A', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                      Cancel
                    </button>
                    <button disabled={deleteInput !== 'DELETE'} onClick={async () => {
                      const res = await fetch('/api/account/delete', { method: 'DELETE' });
                      if (res.ok) { await supabase.auth.signOut(); window.location.href = '/'; }
                      else { setAccountMsg({ ok: false, text: 'Could not delete account. Please contact support.' }); setShowDeleteConfirm(false); }
                    }} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: deleteInput === 'DELETE' ? '#cc2200' : '#e8a0a0', color: '#fff', cursor: deleteInput === 'DELETE' ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.82rem' }}>
                      Delete forever
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px', background: '#fff', borderTop: '2px solid #F0E4D0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 40 }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} onClick={() => setActiveNav(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', border: 'none', background: 'none', cursor: 'pointer', color: active ? '#FF6B35' : '#9CA8B4', padding: '8px 12px', flex: 1 }}>
                <I