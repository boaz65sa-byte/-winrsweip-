import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from './_layout';

const HE = [
  { title: '1. מבוא', body: 'WinrSwipe ("אנחנו", "השירות") מחויבת להגנת פרטיות המשתמשים. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו, ואיך ניתן לשלוט בו.' },
  { title: '2. מידע שאנו אוספים', body: 'א. מידע שאתה מספק:\n• שם מלא וכתובת אימייל\n• מספר טלפון — לא חובה\n• עיר, אם בחרת להוסיף\n• תמונות ווידאו של פריטים למכירה\n\nב. מידע שנאסף אוטומטית:\n• מיקום, רק אם ביקשת סינון לפי קרבה\n• נתוני שימוש: מסכים, חיפושים, הצעות\n• מזהה מכשיר ו-Push Token להתראות' },
  { title: '3. כיצד אנו משתמשים במידע', body: '• הפעלת שירות המכרזים וחיבור קונים ומוכרים\n• שליחת התראות Push על הצעות, זכיות ועדכונים\n• אימות זהות ומניעת הונאות\n• שיפור השירות וניתוח שימוש\n• עמידה בדרישות חוק ורגולציה ישראלית' },
  { title: '4. שיתוף מידע עם צדדים שלישיים', body: 'אנו לא מוכרים את המידע שלך. אנו משתפים מידע רק עם:\n• Supabase — לאחסון מידע בשרתים מאובטחים\n• Expo — לשליחת התראות Push\n• רשויות חוק — בהתאם לצו שיפוטי בלבד' },
  { title: '5. אחסון ואבטחת מידע', body: '• המידע שלך מאוחסן בשרתי Supabase\n• כל ההעברות מוצפנות\n• גישה למידע מוגבלת לצוות מורשה בלבד' },
  { title: '6. שמירת מידע', body: '• מידע חשבון נשמר כל עוד החשבון פעיל\n• מחיקה ממסך הפרופיל מוחקת את החשבון, המודעות, ההצעות וההודעות\n• לוגים טכניים נמחקים לאחר 90 יום' },
  { title: '7. זכויותיך', body: 'בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR:\n• זכות עיון — לקבל עותק של המידע שנאסף\n• זכות תיקון — לעדכן מידע שגוי\n• זכות מחיקה — במסך הפרופיל, מחק חשבון\n• זכות התנגדות — לבקש הפסקת שימוש במידע לצרכי שיווק\n\nלמימוש הזכויות: boaz65sa@gmail.com' },
  { title: '8. עוגיות ומעקב', body: 'האפליקציה אינה משתמשת בעוגיות. אנו משתמשים ב-Analytics בסיסי (מספר שימושים, ביצועים) ללא זיהוי אישי.' },
  { title: '9. פרטיות ילדים', body: 'השירות אינו מיועד לאנשים מתחת לגיל 18. אנו לא אוספים מידע מילדים במתכוון. אם גילית שילד מתחת לגיל 18 הירשם, צור קשר לצורך מחיקת החשבון.' },
  { title: '10. שינויים במדיניות', body: 'אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יגרמו לשליחת התראה באפליקציה. המשך שימוש לאחר ההודעה מהווה הסכמה לשינויים.' },
  { title: '11. יצירת קשר', body: 'לכל שאלה בנוגע לפרטיות:\nאימייל: boaz65sa@gmail.com\nמדיניות: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/privacy' },
];

const EN = [
  { title: '1. Introduction', body: 'WinrSwipe ("we", "the service") is committed to protecting user privacy. This policy explains what information we collect, how we use it, and how you can control it.' },
  { title: '2. Information We Collect', body: 'A. Information you provide:\n• Full name and email address\n• Phone number — optional\n• City, if you choose to add one\n• Photos and videos of items for sale\n\nB. Automatically collected information:\n• Location, only if you ask to filter by distance\n• Usage data: screens visited, searches, bids\n• Device identifier and Push Token for notifications' },
  { title: '3. How We Use Your Information', body: '• Operating the auction service and connecting buyers and sellers\n• Sending Push notifications about bids, wins, and updates\n• Identity verification and fraud prevention\n• Improving the service and usage analytics\n• Complying with Israeli law and regulatory requirements' },
  { title: '4. Sharing Information with Third Parties', body: 'We do not sell your data. We share information only with:\n• Supabase — for data storage on secure servers\n• Expo — for sending Push notifications\n• Law enforcement — only pursuant to a court order' },
  { title: '5. Data Storage & Security', body: '• Your data is stored on Supabase servers\n• Transfers are encrypted\n• Data access is restricted to authorized staff only' },
  { title: '6. Data Retention', body: '• Account information is retained while the account is active\n• Delete account on the profile screen removes the account, listings, bids, and messages\n• Technical logs are deleted after 90 days' },
  { title: '7. Your Rights', body: 'Under Israeli Privacy Protection Law and GDPR:\n• Right of access — to receive a copy of collected data\n• Right to rectification — to correct inaccurate data\n• Right to erasure — Profile → Delete account\n• Right to object — to request we stop using data for marketing\n\nTo exercise your rights: boaz65sa@gmail.com' },
  { title: '8. Cookies & Tracking', body: 'The app does not use cookies. We use basic Analytics (usage count, performance) without personal identification.' },
  { title: '9. Children\'s Privacy', body: 'The service is not intended for persons under the age of 18. We do not knowingly collect information from children. If you discover that a child under 18 has registered, please contact us to delete the account.' },
  { title: '10. Policy Changes', body: 'We may update this policy from time to time. Material changes will result in an in-app notification. Continued use after the notification constitutes acceptance of the changes.' },
  { title: '11. Contact', body: 'For any privacy-related questions:\nEmail: boaz65sa@gmail.com\nPrivacy: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/privacy' },
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
