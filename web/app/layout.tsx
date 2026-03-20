import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WinrSwipe Admin',
  description: 'WinrSwipe Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: '#0D0D0D', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
