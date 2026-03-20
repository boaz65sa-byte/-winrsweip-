'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';

const STATUS_LABEL: Record<string, string> = {
  holding: 'בנאמנות', shipped: 'נשלח', completed: 'הושלם', dispute: 'מחלוקת'
};
const STATUS_COLOR: Record<string, string> = {
  holding: '#FFB347', shipped: '#378ADD', completed: '#4CAF50', dispute: '#FF4D1C'
};

export default function EscrowPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('הכל');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchTransactions(); }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    let q = supabase
      .from('escrow_transactions')
      .select('*, listings(title, images), buyer:buyer_id(full_name, email), seller:seller_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (filter !== 'הכל') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setTransactions(data);
    setLoading(false);
  };

  const resolveDispute = async (id: string, winner: 'buyer' | 'seller') => {
    if (!confirm(`לשחרר את הכסף ל${winner === 'buyer' ? 'קונה' : 'מוכר'}?`)) return;
    setActionLoading(id + winner);
    const status = winner === 'seller' ? 'completed' : 'refunded';
    await supabase.from('escrow_transactions').update({ status }).eq('id', id);
    await fetchTransactions();
    setActionLoading(null);
  };

  const totalHolding = transactions
    .filter(t => t.status === 'holding' || t.status === 'shipped')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCompleted = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const disputes = transactions.filter(t => t.status === 'dispute').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Sidebar />
      <main style={{ flex: 1, marginRight: 220, padding: '32px 28px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>עסקאות Escrow</h1>
          <p style={{ color: '#666', fontSize: 12, margin: '3px 0 0' }}>ניהול כספי נאמנות</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#26C6DA' }}>₪{totalHolding.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#555' }}>כסף בנאמנות</div>
          </div>
          <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4CAF50' }}>₪{totalCompleted.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#555' }}>עסקאות שהושלמו</div>
          </div>
          <div style={{ backgroundColor: '#1A1A1A', border: `1px solid ${disputes > 0 ? '#FF4D1C' : '#2A2A2A'}`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>⚠️</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FF4D1C' }}>{disputes}</div>
            <div style={{ fontSize: 12, color: '#555' }}>מחלוקות פתוחות</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['הכל', ...Object.keys(STATUS_LABEL)].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              backgroundColor: filter === f ? '#FF4D1C' : '#1A1A1A',
              color: filter === f ? '#fff' : '#666',
              border: `1px solid ${filter === f ? '#FF4D1C' : '#2A2A2A'}`,
            }}>
              {f === 'הכל' ? 'הכל' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>טוען...</div>
        ) : (
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 16, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['פריט', 'קונה', 'מוכר', 'סכום', 'עמלה', 'סטטוס', 'תאריך', 'פעולות'].map(h => (
                    <th key={h} style={{ padding: '13px 14px', textAlign: 'right', fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #1E1E1E' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, maxWidth: 160 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.listings?.title || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#888' }}>
                      {t.buyer?.full_name || t.buyer?.email || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#888' }}>
                      {t.seller?.full_name || t.seller?.email || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#FF4D1C' }}>
                      ₪{t.amount}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#4CAF50' }}>
                      ₪{t.platform_fee || Math.round(t.amount * 0.10)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        backgroundColor: (STATUS_COLOR[t.status] || '#666') + '22',
                        color: STATUS_COLOR[t.status] || '#666',
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#555' }}>
                      {new Date(t.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {t.status === 'dispute' && (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button
                            onClick={() => resolveDispute(t.id, 'seller')}
                            disabled={!!actionLoading}
                            style={{ backgroundColor: '#0A2A0A', color: '#4CAF50', padding: '5px 10px', borderRadius: 7, fontSize: 11, border: '1px solid #1A5A1A' }}
                          >
                            למוכר
                          </button>
                          <button
                            onClick={() => resolveDispute(t.id, 'buyer')}
                            disabled={!!actionLoading}
                            style={{ backgroundColor: '#2A0A0A', color: '#FF4D1C', padding: '5px 10px', borderRadius: 7, fontSize: 11, border: '1px solid #3A1010' }}
                          >
                            לקונה
                          </button>
                        </div>
                      )}
                      {t.status !== 'dispute' && <span style={{ color: '#333', fontSize: 11 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>אין עסקאות</div>
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
