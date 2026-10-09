const HE = [
  {
    title: 'יצירת קשר',
    body: 'לכל שאלה, בעיה טכנית, או בקשת עזרה בנוגע לאפליקציית WinrSwipe:\n\nאימייל: boaz65sa@gmail.com\n\nאנו משתדלים להשיב תוך יום עסקים אחד.',
  },
  {
    title: 'שאלות נפוצות',
    body: 'איך יוצרים חשבון?\nניתן להירשם עם אימייל וסיסמה, עם חשבון Google, או עם Apple. מספר טלפון אינו חובה.\n\nאיך קונים או מוכרים?\nגוללים בין מודעות, מגישים הצעה, ומתאמים את המסירה עם הצד השני בצ\'אט שבאפליקציה.\n\nאיך מוחקים חשבון?\nבמסך הפרופיל לוחצים על "מחק חשבון" ומאשרים. החשבון, המודעות, ההצעות וההודעות נמחקים.',
  },
  {
    title: 'דיווח על תוכן פוגעני',
    body: 'אם נתקלת במודעה, משתמש, או תוכן שמפר את תנאי השימוש — דווח לנו באימייל למעלה עם קישור/פרטים למודעה או למשתמש, ונטפל בכך בהקדם.',
  },
];

const EN = [
  {
    title: 'Contact Us',
    body: 'For any question, technical issue, or help request regarding the WinrSwipe app:\n\nEmail: boaz65sa@gmail.com\n\nWe aim to respond within one business day.',
  },
  {
    title: 'Frequently Asked Questions',
    body: 'How do I create an account?\nSign up with email and password, Google, or Apple. A phone number is not required.\n\nHow do I buy or sell?\nSwipe through listings, place a bid, and arrange the handoff with the other person in the in-app chat.\n\nHow do I delete my account?\nOn the profile screen, tap Delete account and confirm. The account, listings, bids, and messages are deleted.',
  },
  {
    title: 'Reporting Abusive Content',
    body: 'If you come across a listing, user, or content that violates our terms, report it to the email above with a link/details, and we will address it promptly.',
  },
];

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            Winr<span style={{ color: '#FF4D1C' }}>Swipe</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '16px 0 4px' }}>תמיכה / Support</h1>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>boaz65sa@gmail.com</p>
        </div>

        <div style={{ marginBottom: 48, direction: 'rtl' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FF4D1C', marginBottom: 20 }}>עברית</h2>
          {HE.map((sec) => (
            <div key={sec.title} style={{
              backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: 14, padding: '18px 20px', marginBottom: 10,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{sec.title}</div>
              <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{sec.body}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FF4D1C', marginBottom: 20 }}>English</h2>
          {EN.map((sec) => (
            <div key={sec.title} style={{
              backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: 14, padding: '18px 20px', marginBottom: 10,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{sec.title}</div>
              <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{sec.body}</div>
            </div>
          ))}
        </div>

        <div style={{ color: '#333', fontSize: 11, textAlign: 'center', borderTop: '1px solid #1E1E1E', paddingTop: 20 }}>
          bs-simple.com | בועז סעדה - פתרונות יצירתיים
        </div>
      </div>
    </div>
  );
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
