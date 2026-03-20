import { supabaseAdmin } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

async function getStats() {
  const [listings, users, escrow, pending, bids] = await Promise.all([
    supabaseAdmin.from('listings').select('id, status', { count: 'exact' }),
    supabaseAdmin.from('users').select('id', { count: 'exact' }),
    supabaseAdmin.from('escrow_transactions').select('amount, status'),
    supabaseAdmin.from('listings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabaseAdmin.from('bids').select('id', { count: 'exact' }),
  ]);

  const totalRevenue = (escrow.data || [])
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount * 0.10), 0);

  const holdingAmount = (escrow.data || [])
    .filter(t => t.status === 'holding')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalListings: listings.count || 0,
    activeListings: (listings.data || []).filter(l => l.status === 'active').length,
    pendingListings: pending.count || 0,
    totalUsers: users.count || 0,
    totalBids: bids.count || 0,
    totalRevenue: Math.round(totalRevenue),
    holdingAmount: Math.round(holdingAmount),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'מכרזים פעילים', value: stats.activeListings, icon: '⚡', color: '#FF4D1C' },
    { label: 'ממתינים לאישור', value: stats.pendingListings, icon: '⏳', color: '#FFB347', alert: stats.pendingListings > 0 },
    { label: 'סה"כ משתמשים', value: stats.totalUsers, icon: '👥', color: '#378ADD' },
    { label: 'סה"כ הצעות', value: stats.totalBids, icon: '💬', color: '#9B59B6' },
    { label: 'הכנסות פלטפורמה', value: `₪${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: '#4CAF50' },
    { label: 'כסף בנאמנות', value: `₪${stats.holdingAmount.toLocaleString()}`, icon: '🔒', color: '#26C6DA' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Sidebar />

      <main style={{ flex: 1, marginRight: 220, padding: '32px 28px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>דשבורד</h1>
          <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {statCards.map(({ label, value, icon, color, alert }) => (
            <div key={label} style={{
              backgroundColor: '#1A1A1A',
              border: `1px solid ${alert ? color : '#2A2A2A'}`,
              borderRadius: 16,
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {alert && (
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}`,
                }} />
              )}
              <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {stats.pendingListings > 0 && (
          <div style={{
            backgroundColor: '#1A0800',
            border: '1px solid #FF4D1C',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                ⚠️ יש {stats.pendingListings} מכרזים ממתינים לאישור
              </div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>בדוק ואשר כדי שיפורסמו לקהל</div>
            </div>
            <a href="/listings?filter=pending" style={{
              backgroundColor: '#FF4D1C',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
            }}>
              לאישור ←
            </a>
          </div>
        )}

        {/* Footer */}
        <div style={{ color: '#222', fontSize: 11, marginTop: 40, textAlign: 'center' }}>
          bs-simple.com | בועז סעדה - פתרונות יצירתיים
        </div>
      </main>
    </div>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
