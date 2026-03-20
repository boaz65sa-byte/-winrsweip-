'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';

const FILTERS = ['הכל', 'pending', 'active', 'sold', 'rejected', 'expired'];
const STATUS_LABEL: Record<string, string> = {
  pending: 'ממתין', active: 'פעיל', sold: 'נמכר', rejected: 'נדחה', expired: 'פג'
};
const STATUS_COLOR: Record<string, string> = {
  pending: '#FFB347', active: '#4CAF50', sold: '#378ADD', rejected: '#666', expired: '#555'
};

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchListings(); }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    let q = supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (filter !== 'הכל') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setListings(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    await supabase.from('listings').update({ status }).eq('id', id);
    await fetchListings();
    setActionLoading(null);
  };

  const deleteListing = async (id: string) => {
    if (!confirm('למחוק את המכרז לצמיתות?')) return;
    setActionLoading(id + 'delete');
    await supabase.from('listings').delete().eq('id', id);
    await fetchListings();
    setActionLoading(null);
  };

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.category?.includes(search)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Sidebar />
      <main style={{ flex: 1, marginRight: 220, padding: '32px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>ניהול מכרזים</h1>
            <p style={{ color: '#666', fontSize: 12, margin: '3px 0 0' }}>{filtered.length} תוצאות</p>
          </div>
          <input
            placeholder="חיפוש..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10,
              padding: '10px 14px', color: '#fff', fontSize: 13, width: 200,
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              backgroundColor: filter === f ? '#FF4D1C' : '#1A1A1A',
              color: filter === f ? '#fff' : '#666',
              border: `1px solid ${filter === f ? '#FF4D1C' : '#2A2A2A'}`,
              transition: 'all 0.15s',
            }}>
              {f === 'הכל' ? 'הכל' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>טוען...</div>
        ) : (
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 16, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['תמונה', 'כותרת', 'קטגוריה', 'מחיר', 'סטטוס', 'תאריך', 'פעולות'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'right', fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1E1E1E' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛍️</div>
                      }
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, maxWidth: 200 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{item.id.slice(0, 8)}...</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#FF4D1C' }}>
                      ₪{item.current_bid || item.starting_price}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        backgroundColor: (STATUS_COLOR[item.status] || '#666') + '22',
                        color: STATUS_COLOR[item.status] || '#666',
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#555' }}>
                      {new Date(item.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(item.id, 'active')}
                            disabled={actionLoading === item.id + 'active'}
                            style={{ backgroundColor: '#4CAF50', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                          >
                            ✓ אשר
                          </button>
                        )}
                        {item.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(item.id, 'rejected')}
                            disabled={actionLoading === item.id + 'rejected'}
                            style={{ backgroundColor: '#2A2A2A', color: '#666', padding: '6px 12px', borderRadius: 8, fontSize: 12, border: '1px solid #333' }}
                          >
                            ✕ דחה
                          </button>
                        )}
                        {item.status === 'active' && (
                          <button
                            onClick={() => updateStatus(item.id, 'rejected')}
                            disabled={actionLoading === item.id + 'rejected'}
                            style={{ backgroundColor: '#2A2A2A', color: '#888', padding: '6px 12px', borderRadius: 8, fontSize: 12, border: '1px solid #333' }}
                          >
                            השהה
                          </button>
                        )}
                        <button
                          onClick={() => deleteListing(item.id)}
                          disabled={actionLoading === item.id + 'delete'}
                          style={{ backgroundColor: '#2A0A0A', color: '#FF4D1C', padding: '6px 12px', borderRadius: 8, fontSize: 12, border: '1px solid #3A1010' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
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
