'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('שגיאה בעדכון הסיסמה. נסה שנית.');
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/'), 2000);
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>
            Winr<span style={{ color: '#FF4D1C' }}>Swipe</span>
          </div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Admin Dashboard</div>
        </div>

        {!done ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>סיסמה חדשה</h2>
            <p style={{ color: '#555', fontSize: 13, margin: '0 0 24px' }}>בחר סיסמה חדשה לחשבונך</p>

            {error && (
              <div style={{
                backgroundColor: '#2A0A0A', border: '1px solid #3A1010',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                color: '#FF4D1C', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>סיסמה חדשה</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="לפחות 6 תווים"
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid #2A2A2A',
                    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>אימות סיסמה</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="חזור על הסיסמה"
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
                {loading ? 'מעדכן...' : 'עדכן סיסמה'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>הסיסמה עודכנה!</h2>
            <p style={{ color: '#555', fontSize: 13 }}>מועבר לדשבורד...</p>
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
