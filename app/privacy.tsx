import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from './_layout';

const HE = [
  { title: '1. מבוא', body: 'SwipeBid ("אנחנו", "השירות") מחויבת להגנת פרטיות המשתמשים. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו, ואיך ניתן לשלוט בו.' },
  { title: '2. מידע שאנו אוספים', body: 'א. מידע שאתה מספק:\n• שם מלא, כתובת אימייל, מספר טלפון\n• כתובת מגורים ועיר\n• תמונות ווידאו של פריטים למכירה\n• מידע תשלום (מועבר ישירות ל-Stripe — לא נשמר אצלנו)\n\nב. מידע שנאסף אוטומטית:\n• מיקום GPS (רק בהסכמתך)\n• נתוני שימוש: מסכים שביקרת, חיפושים, הצעות\n• מזהה מכשיר ו-Push Token להתראות' },
  { title: '3. כיצד אנו משתמשים במידע', body: '• הפעלת שירות המכרזים וחיבור קונים ומוכרים\n• שליחת התראות Push על הצעות, זכיות ועדכונים\n• אימות זהות ומניעת הונאות\n• שיפור השירות וניתוח שימוש\n• עמידה בדרישות חוק ורגולציה ישראלית' },
  { title: '4. שיתוף מידע עם צדדים שלישיים', body: 'אנו לא מוכרים את המידע שלך. אנו משתפים מידע רק עם:\n• Stripe — לעיבוד תשלומים מאובטח\n• Supabase — לאחסון מידע בשרתים מאובטחים\n• Expo — לשליחת התראות Push\n• רשויות חוק — בהתאם לצו שיפוטי בלבד' },
  { title: '5. אחסון ואבטחת מידע', body: '• המידע שלך מאוחסן בשרתי Supabase באירופה (EU-West)\n• כל ההעברות מוצפנות באמצעות TLS 1.3\n• גישה למידע מוגבלת לצוות מורשה בלבד\n• מידע תשלום מאובטח בתקן PCI DSS Level 1 (Stripe)' },
  { title: '6. שמירת מידע', body: '• מידע חשבון נשמר כל עוד החשבון פעיל\n• לאחר מחיקת חשבון — המידע נמחק תוך 30 יום\n• מידע עסקאות נשמר 7 שנים לצרכי ביקורת חשבונאית\n• לוגים טכניים נמחקים לאחר 90 יום' },
  { title: '7. זכויותיך', body: 'בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR:\n• זכות עיון — לקבל עותק של המידע שנאסף\n• זכות תיקון — לעדכן מידע שגוי\n• זכות מחיקה — לדרוש מחיקת חשבונך\n• זכות התנגדות — לבקש הפסקת שימוש במידע לצרכי שיווק\n\nלמימוש הזכויות: privacy@swipebid.co.il' },
  { title: '8. עוגיות ומעקב', body: 'האפליקציה אינה משתמשת בעוגיות. אנו משתמשים ב-Analytics בסיסי (מספר שימושים, ביצועים) ללא זיהוי אישי.' },
  { title: '9. פרטיות ילדים', body: 'השירות אינו מיועד לאנשים מתחת לגיל 18. אנו לא אוספים מידע מילדים במתכוון. אם גילית שילד מתחת לגיל 18 הירשם, צור קשר לצורך מחיקת החשבון.' },
  { title: '10. שינויים במדיניות', body: 'אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יגרמו לשליחת התראה באפליקציה. המשך שימוש לאחר ההודעה מהווה הסכמה לשינויים.' },
  { title: '11. יצירת קשר', body: 'לכל שאלה בנוגע לפרטיות:\nאימייל: privacy@swipebid.co.il\nאתר: bs-simple.com\nכתובת: ישראל' },
];

const EN = [
  { title: '1. Introduction', body: 'SwipeBid ("we", "the service") is committed to protecting user privacy. This policy explains what information we collect, how we use it, and how you can control it.' },
  { title: '2. Information We Collect', body: 'A. Information you provide:\n• Full name, email address, phone number\n• Residential address and city\n• Photos and videos of items for sale\n• Payment information (passed directly to Stripe — not stored by us)\n\nB. Automatically collected information:\n• GPS location (only with your consent)\n• Usage data: screens visited, searches, bids\n• Device identifier and Push Token for notifications' },
  { title: '3. How We Use Your Information', body: '• Operating the auction service and connecting buyers and sellers\n• Sending Push notifications about bids, wins, and updates\n• Identity verification and fraud prevention\n• Improving the service and usage analytics\n• Complying with Israeli law and regulatory requirements' },
  { title: '4. Sharing Information with Third Parties', body: 'We do not sell your data. We share information only with:\n• Stripe — for secure payment processing\n• Supabase — for data storage on secure servers\n• Expo — for sending Push notifications\n• Law enforcement — only pursuant to a court order' },
  { title: '5. Data Storage & Security', body: '• Your data is stored on Supabase servers in Europe (EU-West)\n• All transfers are encrypted using TLS 1.3\n• Data access is restricted to authorized staff only\n• Payment data is secured to PCI DSS Level 1 standards (Stripe)' },
  { title: '6. Data Retention', body: '• Account information is retained as long as the account is active\n• After account deletion — data is deleted within 30 days\n• Transaction data is retained for 7 years for accounting audit purposes\n• Technical logs are deleted after 90 days' },
  { title: '7. Your Rights', body: 'Under Israeli Privacy Protection Law and GDPR:\n• Right of access — to receive a copy of collected data\n• Right to rectification — to correct inaccurate data\n• Right to erasure — to request deletion of your account\n• Right to object — to request cessation of data use for marketing\n\nTo exercise your rights: privacy@swipebid.co.il' },
  { title: '8. Cookies & Tracking', body: 'The app does not use cookies. We use basic Analytics (usage count, performance) without personal identification.' },
  { title: '9. Children\'s Privacy', body: 'The service is not intended for persons under the age of 18. We do not knowingly collect information from children. If you discover that a child under 18 has registered, please contact us to delete the account.' },
  { title: '10. Policy Changes', body: 'We may update this policy from time to time. Material changes will result in an in-app notification. Continued use after the notification constitutes acceptance of the changes.' },
  { title: '11. Contact', body: 'For any privacy-related questions:\nEmail: privacy@swipebid.co.il\nWebsite: bs-simple.com\nAddress: Israel' },
];

export default function PrivacyScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const sections = lang === 'he' ? HE : EN;

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{lang === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}</Text>
        <TouchableOpacity onPress={() => setLang(l => l === 'he' ? 'en' : 'he')} style={[s.langBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>{lang === 'he' ? 'EN' : 'HE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.body}>
          <Text style={[s.updated, { color: theme.sub }]}>{lang === 'he' ? 'עודכן לאחרונה: מרץ 2026' : 'Last updated: March 2026'}</Text>
          {sections.map((sec) => (
            <View key={sec.title} style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.secTitle, { color: theme.text }]}>{sec.title}</Text>
              <Text style={[s.secBody, { color: theme.sub }]}>{sec.body}</Text>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  langBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  updated: { fontSize: 12, marginBottom: 14 },
  section: { borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1 },
  secTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  secBody: { fontSize: 13, lineHeight: 22 },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
