'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
      return;
    }

    if (data.user?.email !== 'boaz65sa@gmail.com') {
      await supabase.auth.signOut();
      setError('אין לך הרשאה לגשת לדשבורד זה');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      setError('שגיאה בשליחת המייל. נסה שוב.');
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D0D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid #2A2A2A',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        direction: 'rtl',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>
            Winr<span style={{ color: '#FF4D1C' }}>Swipe</span>
          </div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Admin Dashboard</div>
        </div>

        {mode === 'login' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px', color: '#fff' }}>כניסה למערכת</h2>

            {error && (
              <div style={{
                backgroundColor: '#2A0A0A', border: '1px solid #3A1010',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                color: '#FF4D1C', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="boaz65sa@gmail.com"
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid #2A2A2A',
                    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>סיסמה</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid #2A2A2A',
                    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', backgroundColor: '#FF4D1C', color: '#fff',
                  padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'מתחבר...' : 'כניסה'}
              </button>
            </form>

            <button
              onClick={() => { setMode('forgot'); setError(''); }}
              style={{
                background: 'none', border: 'none', color: '#555',
                fontSize: 13, marginTop: 18, cursor: 'pointer', width: '100%', textAlign: 'center',
              }}
            >
              שכחתי סיסמה
            </button>
          </>
        )}

        {mode === 'forgot' && !resetSent && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>שחזור סיסמה</h2>
            <p style={{ color: '#555', fontSize: 13, margin: '0 0 24px' }}>נשלח לך קישור לאיפוס הסיסמה</p>

            {error && (
              <div style={{
                backgroundColor: '#2A0A0A', border: '1px solid #3A1010',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                color: '#FF4D1C', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="boaz65sa@gmail.com"
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid #2A2A2A',
                    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', backgroundColor: '#FF4D1C', color: '#fff',
                  padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'שולח...' : 'שלח קישור'}
              </button>
            </form>

            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                background: 'none', border: 'none', color: '#555',
                fontSize: 13, marginTop: 18, cursor: 'pointer', width: '100%', textAlign: 'center',
              }}
            >
              ← חזרה לכניסה
            </button>
          </>
        )}

        {mode === 'forgot' && resetSent && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>המייל נשלח!</h2>
            <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>
              שלחנו קישור לאיפוס סיסמה ל-{email}
            </p>
            <button
              onClick={() => { setMode('login'); setResetSent(false); }}
              style={{
                background: 'none', border: 'none', color: '#FF4D1C',
                fontSize: 14, cursor: 'pointer', fontWeight: 600,
              }}
            >
              חזרה לכניסה
            </button>
          </div>
        )}

        <div style={{ color: '#222', fontSize: 11, marginTop: 32, textAlign: 'center' }}>
          bs-simple.com | בועז סעדה - פתרונות יצירתיים
        </div>
      </div>
    </div>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
