const HE = [
  { title: '1. מבוא', body: 'WinrSwipe ("אנחנו", "השירות") מחויבת להגנת פרטיות המשתמשים. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו, ואיך ניתן לשלוט בו.' },
  { title: '2. מידע שאנו אוספים', body: 'א. מידע שאתה מספק:\n• שם מלא, כתובת אימייל, מספר טלפון\n• כתובת מגורים ועיר\n• תמונות ווידאו של פריטים למכירה\n• מידע תשלום (מועבר ישירות ל-Stripe — לא נשמר אצלנו)\n\nב. מידע שנאסף אוטומטית:\n• מיקום GPS (רק בהסכמתך)\n• נתוני שימוש: מסכים שביקרת, חיפושים, הצעות\n• מזהה מכשיר ו-Push Token להתראות' },
  { title: '3. כיצד אנו משתמשים במידע', body: '• הפעלת שירות המכרזים וחיבור קונים ומוכרים\n• שליחת התראות Push על הצעות, זכיות ועדכונים\n• אימות זהות ומניעת הונאות\n• שיפור השירות וניתוח שימוש\n• עמידה בדרישות חוק ורגולציה ישראלית' },
  { title: '4. שיתוף מידע עם צדדים שלישיים', body: 'אנו לא מוכרים את המידע שלך. אנו משתפים מידע רק עם:\n• Stripe — לעיבוד תשלומים מאובטח\n• Supabase — לאחסון מידע בשרתים מאובטחים\n• Expo — לשליחת התראות Push\n• רשויות חוק — בהתאם לצו שיפוטי בלבד' },
  { title: '5. אחסון ואבטחת מידע', body: '• המידע שלך מאוחסן בשרתי Supabase באירופה (EU-West)\n• כל ההעברות מוצפנות באמצעות TLS 1.3\n• גישה למידע מוגבלת לצוות מורשה בלבד\n• מידע תשלום מאובטח בתקן PCI DSS Level 1 (Stripe)' },
  { title: '6. שמירת מידע', body: '• מידע חשבון נשמר כל עוד החשבון פעיל\n• לאחר מחיקת חשבון — המידע נמחק תוך 30 יום\n• מידע עסקאות נשמר 7 שנים לצרכי ביקורת חשבונאית\n• לוגים טכניים נמחקים לאחר 90 יום' },
  { title: '7. זכויותיך', body: 'בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR:\n• זכות עיון — לקבל עותק של המידע שנאסף\n• זכות תיקון — לעדכן מידע שגוי\n• זכות מחיקה — לדרוש מחיקת חשבונך\n• זכות התנגדות — לבקש הפסקת שימוש במידע לצרכי שיווק\n\nלמימוש הזכויות: boaz65sa@gmail.com' },
  { title: '8. עוגיות ומעקב', body: 'האפליקציה אינה משתמשת בעוגיות. אנו משתמשים ב-Analytics בסיסי (מספר שימושים, ביצועים) ללא זיהוי אישי.' },
  { title: '9. פרטיות ילדים', body: 'השירות אינו מיועד לאנשים מתחת לגיל 18. אנו לא אוספים מידע מילדים במתכוון.' },
  { title: '10. שינויים במדיניות', body: 'אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יגרמו לשליחת התראה באפליקציה.' },
  { title: '11. יצירת קשר', body: 'לכל שאלה בנוגע לפרטיות:\nאימייל: boaz65sa@gmail.com\nאתר: bs-simple.com' },
];

const EN = [
  { title: '1. Introduction', body: 'WinrSwipe ("we", "the service") is committed to protecting user privacy. This policy explains what information we collect, how we use it, and how you can control it.' },
  { title: '2. Information We Collect', body: 'A. Information you provide:\n• Full name, email address, phone number\n• Residential address and city\n• Photos and videos of items for sale\n• Payment information (passed directly to Stripe — not stored by us)\n\nB. Automatically collected information:\n• GPS location (only with your consent)\n• Usage data: screens visited, searches, bids\n• Device identifier and Push Token for notifications' },
  { title: '3. How We Use Your Information', body: '• Operating the auction service and connecting buyers and sellers\n• Sending Push notifications about bids, wins, and updates\n• Identity verification and fraud prevention\n• Improving the service and usage analytics\n• Complying with Israeli law and regulatory requirements' },
  { title: '4. Sharing Information with Third Parties', body: 'We do not sell your data. We share information only with:\n• Stripe — for secure payment processing\n• Supabase — for data storage on secure servers\n• Expo — for sending Push notifications\n• Law enforcement — only pursuant to a court order' },
  { title: '5. Data Storage & Security', body: '• Your data is stored on Supabase servers in Europe (EU-West)\n• All transfers are encrypted using TLS 1.3\n• Data access is restricted to authorized staff only\n• Payment data is secured to PCI DSS Level 1 standards (Stripe)' },
  { title: '6. Data Retention', body: '• Account information is retained as long as the account is active\n• After account deletion — data is deleted within 30 days\n• Transaction data is retained for 7 years for accounting audit purposes\n• Technical logs are deleted after 90 days' },
  { title: '7. Your Rights', body: 'Under Israeli Privacy Protection Law and GDPR:\n• Right of access — to receive a copy of collected data\n• Right to rectification — to correct inaccurate data\n• Right to erasure — to request deletion of your account\n• Right to object — to request cessation of data use for marketing\n\nTo exercise your rights: boaz65sa@gmail.com' },
  { title: '8. Cookies & Tracking', body: 'The app does not use cookies. We use basic Analytics (usage count, performance) without personal identification.' },
  { title: '9. Children\'s Privacy', body: 'The service is not intended for persons under the age of 18. We do not knowingly collect information from children.' },
  { title: '10. Policy Changes', body: 'We may update this policy from time to time. Material changes will result in an in-app notification.' },
  { title: '11. Contact', body: 'For any privacy-related questions:\nEmail: boaz65sa@gmail.com\nWebsite: bs-simple.com' },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            Winr<span style={{ color: '#FF4D1C' }}>Swipe</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '16px 0 4px' }}>מדיניות פרטיות / Privacy Policy</h1>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>עודכן: מרץ 2026 · Last updated: March 2026</p>
        </div>

        {/* Hebrew Section */}
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

        {/* English Section */}
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
