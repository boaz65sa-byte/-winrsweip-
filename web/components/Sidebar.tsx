'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const NAV = [
  { href: '/', icon: '📊', label: 'דשבורד' },
  { href: '/listings', icon: '🏷️', label: 'מכרזים' },
  { href: '/users', icon: '👥', label: 'משתמשים' },
  { href: '/escrow', icon: '🔒', label: 'עסקאות Escrow' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      backgroundColor: '#111',
      borderLeft: '1px solid #1E1E1E',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
          Winr<span style={{ color: '#FF4D1C' }}>Swipe</span>
        </div>
        <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>Admin Dashboard</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: active ? 700 : 400,
              color: active ? '#fff' : '#666',
              backgroundColor: active ? '#1A1A1A' : 'transparent',
              borderRight: active ? '2px solid #FF4D1C' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #1E1E1E' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: 13,
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          <span>🚪</span>
          יציאה
        </button>
        <div style={{ fontSize: 11, color: '#333', marginTop: 8 }}>bs-simple.com</div>
        <div style={{ fontSize: 11, color: '#222', marginTop: 2 }}>בועז סעדה</div>
      </div>
    </aside>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
