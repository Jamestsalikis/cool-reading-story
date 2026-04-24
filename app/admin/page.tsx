'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type FeedbackRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type AdminEmail = {
  id: string;
  email: string;
  added_by: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [admins, setAdmins] = useState<AdminEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'admins'>('feedback');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Check admin access via service-level query
      const { data: adminRow } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', user.email)
        .single();

      if (!adminRow) { router.push('/dashboard'); return; }

      setAuthorized(true);
      await Promise.all([loadFeedback(), loadAdmins()]);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFeedback() {
    const { data } = await supabase
      .from('feedback')
      .select('id, rating, comment, created_at')
      .order('created_at', { ascending: false });
    setFeedback(data || []);
  }

  async function loadAdmins() {
    const { data } = await supabase
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: true });
    setAdmins(data || []);
  }

  async function addAdmin() {
    if (!newEmail.trim()) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_emails').insert({ email: newEmail.trim().toLowerCase(), added_by: user?.email });
    setNewEmail('');
    await loadAdmins();
    setAdding(false);
  }

  async function removeAdmin(id: string, email: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (email === user?.email) { alert("You can't remove yourself."); return; }
    await supabase.from('admin_emails').delete().eq('id', id);
    await loadAdmins();
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F0' }}>
      <p style={{ color: '#6B5E4E', fontFamily: 'Georgia, serif' }}>Loading...</p>
    </div>
  );

  if (!authorized) return null;

  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : '—';

  const ratingCounts = [1, 2, 3, 4, 5].map(r => ({
    r,
    count: feedback.filter(f => f.rating === r).length,
  }));

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', border: '1px solid #E8E0D0', padding: '20px',
  };

  const tab = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500',
    fontSize: '0.875rem', border: 'none',
    background: active ? '#741515' : 'transparent',
    color: active ? '#fff' : '#6B5E4E',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F0', padding: '32px 20px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#1A1209', marginBottom: '4px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6B5E4E', fontSize: '0.875rem' }}>Cool Reading Story · Internal use only</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Total responses</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1A1209' }}>{feedback.length}</p>
          </div>
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Average rating</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#741515' }}>{avgRating} ⭐</p>
          </div>
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>5-star responses</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1a7a4a' }}>
              {feedback.length > 0 ? Math.round((ratingCounts[4].count / feedback.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Rating breakdown */}
        <div style={{ ...card, marginBottom: '24px' }}>
          <p style={{ fontWeight: '600', fontSize: '0.875rem', color: '#555', marginBottom: '14px' }}>RATING BREAKDOWN</p>
          {ratingCounts.reverse().map(({ r, count }) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: '#555', width: '24px' }}>{r}⭐</span>
              <div style={{ flex: 1, height: '8px', background: '#F0EDE8', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: feedback.length > 0 ? `${(count / feedback.length) * 100}%` : '0%', height: '100%', background: '#741515', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#888', width: '32px', textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#F0EDE8', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          <button style={tab(activeTab === 'feedback')} onClick={() => setActiveTab('feedback')}>Feedback ({feedback.length})</button>
          <button style={tab(activeTab === 'admins')} onClick={() => setActiveTab('admins')}>Admins ({admins.length})</button>
        </div>

        {/* Feedback list */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {feedback.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: '#9B8B7A', padding: '40px' }}>No feedback yet.</div>
            )}
            {feedback.map((f) => (
              <div key={f.id} style={{ ...card, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{'⭐'.repeat(f.rating)}</div>
                <div style={{ flex: 1 }}>
                  {f.comment && <p style={{ fontSize: '0.9rem', color: '#1A1209', marginBottom: '4px' }}>{f.comment}</p>}
                  <p style={{ fontSize: '0.75rem', color: '#9B8B7A' }}>
                    {new Date(f.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin management */}
        {activeTab === 'admins' && (
          <div>
            <div style={{ ...card, marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', color: '#555', marginBottom: '14px' }}>ADD ADMIN</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAdmin()}
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E8E0D0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
                <button
                  onClick={addAdmin}
                  disabled={adding || !newEmail.trim()}
                  style={{ padding: '10px 20px', background: '#741515', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', opacity: adding ? 0.7 : 1 }}
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {admins.map((a) => (
                <div key={a.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1A1209' }}>{a.email}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9B8B7A' }}>Added by {a.added_by} · {new Date(a.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <button
                    onClick={() => removeAdmin(a.id, a.email)}
                    style={{ background: 'none', border: '1.5px solid #E8E0D0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: '#9B8B7A', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
