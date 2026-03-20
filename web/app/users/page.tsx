'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    setActionLoading(id + 'block');
    await supabase.from('users').update({ blocked: !blocked }).eq('id', id);
    await fetchUsers();
    setActionLoading(null);
  };

  const toggleVerify = async (id: string, verified: boolean) => {
    setActionLoading(id + 'verify');
    await supabase.from('users').update({ verified: !verified }).eq('id', id);
    await fetchUsers();
    setActionLoading(null);
  };

  const saveNote = async (id: string) => {
    await supabase.from('users').update({ admin_note: note }).eq('id', id);
    setNoteId(null);
    setNote('');
    fetchUsers();
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Sidebar />
      <main style={{ flex: 1, marginRight: 220, padding: '32px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>ניהול משתמשים</h1>
            <p style={{ color: '#666', fontSize: 12, margin: '3px 0 0' }}>{filtered.length} משתמשים</p>
          </div>
          <input
            placeholder="חיפוש שם / אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, width: 220,
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>טוען...</div>
        ) : (
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 16, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['משתמש', 'אימייל', 'טלפון', 'עיר', 'סטטוס', 'הצטרף', 'פעולות'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'right', fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <>
                    <tr key={user.id} style={{ borderBottom: noteId === user.id ? 'none' : '1px solid #1E1E1E' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            backgroundColor: '#FF4D1C',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 900, color: '#fff',
                          }}>
                            {(user.full_name || user.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name || '—'}</div>
                            {user.admin_note && <div style={{ fontSize: 10, color: '#FFB347', marginTop: 1 }}>📝 {user.admin_note}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{user.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{user.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{user.city || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {user.verified && (
                            <span style={{ backgroundColor: '#0A2A0A', color: '#4CAF50', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, width: 'fit-content' }}>✓ מאומת</span>
                          )}
                          {user.blocked && (
                            <span style={{ backgroundColor: '#2A0A0A', color: '#FF4D1C', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, width: 'fit-content' }}>🚫 חסום</span>
                          )}
                          {!user.verified && !user.blocked && (
                            <span style={{ color: '#444', fontSize: 11 }}>רגיל</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#555' }}>
                        {new Date(user.created_at).toLocaleDateString('he-IL')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => toggleVerify(user.id, user.verified)}
                            disabled={actionLoading === user.id + 'verify'}
                            style={{
                              backgroundColor: user.verified ? '#1A2A1A' : '#0A2A0A',
                              color: '#4CAF50',
                              padding: '5px 10px', borderRadius: 7, fontSize: 11,
                              border: '1px solid #1A5A1A',
                            }}
                          >
                            {user.verified ? 'בטל אימות' : '✓ אמת'}
                          </button>
                          <button
                            onClick={() => toggleBlock(user.id, user.blocked)}
                            disabled={actionLoading === user.id + 'block'}
                            style={{
                              backgroundColor: '#2A0A0A',
                              color: user.blocked ? '#4CAF50' : '#FF4D1C',
                              padding: '5px 10px', borderRadius: 7, fontSize: 11,
                              border: '1px solid #3A1010',
                            }}
                          >
                            {user.blocked ? 'בטל חסימה' : '🚫 חסום'}
                          </button>
                          <button
                            onClick={() => { setNoteId(noteId === user.id ? null : user.id); setNote(user.admin_note || ''); }}
                            style={{
                              backgroundColor: '#1A1500', color: '#FFB347',
                              padding: '5px 10px', borderRadius: 7, fontSize: 11,
                              border: '1px solid #2A2500',
                            }}
                          >
                            📝
                          </button>
                        </div>
                      </td>
                    </tr>
                    {noteId === user.id && (
                      <tr key={user.id + '-note'} style={{ borderBottom: '1px solid #1E1E1E', backgroundColor: '#111' }}>
                        <td colSpan={7} style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              value={note}
                              onChange={e => setNote(e.target.value)}
                              placeholder="הוסף הערה על המשתמש..."
                              style={{
                                flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
                                borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13,
                              }}
                            />
                            <button onClick={() => saveNote(user.id)} style={{ backgroundColor: '#FF4D1C', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>שמור</button>
                            <button onClick={() => setNoteId(null)} style={{ backgroundColor: '#2A2A2A', color: '#666', padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>ביטול</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>אין תוצאות</div>
            )}
          </div>
        )}

        <div style={{ color: '#222', fontSize: 11, marginTop: 32, textAlign: 'center' }}>
          bs-simple.com | בועז סעדה - פתרונות יצירתיים
        </div>
      </main>
    </div>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
