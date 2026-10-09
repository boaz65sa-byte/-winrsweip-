import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PAYMENTS_ENABLED } from '../lib/features';
import { ThemeContext } from './_layout';

const HE = [
  { title: '1. קבלת התנאים', body: 'ברוכים הבאים ל-WinrSwipe. השימוש באפליקציה מהווה הסכמה מלאה לתנאי שימוש אלו. אם אינך מסכים לתנאים, אנא הפסק את השימוש באפליקציה.' },
  { title: '2. השירות', body: 'WinrSwipe היא פלטפורמת מכרזים מקוונת המאפשרת למשתמשים לרכוש ולמכור פריטים באמצעות מכרז בסגנון Swipe. אנו משמשים כמתווכים בלבד ואיננו צד לעסקאות בין קונים למוכרים.' },
  { title: '3. רישום וחשבון', body: '• עליך להיות בן 18 ומעלה לשימוש בשירות.\n• עליך לספק מידע מדויק ועדכני בעת ההרשמה.\n• אחריות על שמירת סיסמאתך ואבטחת חשבונך מוטלת עליך בלבד.\n• אין להעביר את חשבונך לאחר.' },
  { title: '4. כללי התנהגות', body: 'המשתמש מתחייב:\n• לא לפרסם פריטים אסורים, מזויפים, או גנובים.\n• לא להגיש הצעות פיקטיביות (Shill Bidding).\n• לכבד את תוצאות המכרז ולהשלים עסקאות שזכה בהן.\n• לא לפגוע, להטריד או לאיים על משתמשים אחרים.' },
  { title: '5. תיאום בין הצדדים', body: 'WinrSwipe מחברת בין קונים למוכרים. אחרי הצעה או פנייה, מתאמים את המסירה בצ\'אט שבאפליקציה.' },
  { title: '6. השלמת עסקה', body: 'הצדדים מסכימים ביניהם איך ואיפה הפריט עובר. WinrSwipe אינה צד לעסקה.' },
  { title: '7. ביטולים והחזרות', body: '• מוכר רשאי לבטל מכרז לפני קבלת הצעה ראשונה בלבד.\n• לאחר זכייה, עסקה ניתנת לביטול רק בהסכמת שני הצדדים.\n• WinrSwipe אינה אחראית לאיכות הפריטים, מצבם, או התאמתם לתיאור.' },
  { title: '8. הגבלת אחריות', body: 'WinrSwipe לא תהיה אחראית לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע מ:\n• שימוש או אי-שימוש בשירות.\n• פריטים פגומים, חסרים, או שאינם תואמים לתיאור.\n• השבתה טכנית של השירות.' },
  { title: '9. קניין רוחני', body: 'כל תוכן באפליקציה — לוגו, עיצוב, קוד — הוא רכושה הבלעדי של WinrSwipe. המשתמש מעניק ל-WinrSwipe רישיון לשימוש בתמונות ותיאורים שפרסם לצורכי שיווק הפלטפורמה.' },
  { title: '10. סיום חשבון', body: 'אפשר למחוק את החשבון בכל עת ממסך הפרופיל → מחק חשבון. המחיקה מוחקת את המשתמש, המודעות, ההצעות וההודעות. WinrSwipe רשאית גם להשעות חשבון שהפר את התנאים.' },
  { title: '11. דין ושיפוט', body: 'תנאים אלו כפופים לדיני מדינת ישראל. כל מחלוקת תידון בבתי המשפט המוסמכים בתל אביב-יפו.' },
  { title: '12. יצירת קשר', body: 'לשאלות בנוגע לתנאי השימוש:\nאימייל: boaz65sa@gmail.com\nתמיכה: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/support' },
];

const EN = [
  { title: '1. Acceptance of Terms', body: 'Welcome to WinrSwipe. By using the app you fully agree to these Terms of Service. If you do not agree, please stop using the app.' },
  { title: '2. The Service', body: 'WinrSwipe is an online auction platform that allows users to buy and sell items through a Swipe-style auction. We act solely as an intermediary and are not a party to transactions between buyers and sellers.' },
  { title: '3. Registration & Account', body: '• You must be 18 years or older to use the service.\n• You must provide accurate and up-to-date information when registering.\n• You are solely responsible for maintaining the security of your password and account.\n• You may not transfer your account to another person.' },
  { title: '4. Code of Conduct', body: 'You agree not to:\n• List prohibited, counterfeit, or stolen items.\n• Submit fake bids (Shill Bidding).\n• Refuse to complete a transaction you have won.\n• Harm, harass, or threaten other users.' },
  { title: '5. Arranging a deal', body: 'WinrSwipe connects buyers and sellers. After a bid or a message, arrange the handoff in the in-app chat.' },
  { title: '6. Completing a deal', body: 'The two people agree how and where the item changes hands. WinrSwipe is not a party to the deal.' },
  { title: '7. Cancellations & Returns', body: '• A seller may cancel an auction only before the first bid is placed.\n• After a winning bid, a transaction may only be cancelled by mutual agreement.\n• WinrSwipe is not responsible for the quality, condition, or accuracy of item descriptions.' },
  { title: '8. Limitation of Liability', body: 'WinrSwipe shall not be liable for any direct, indirect, incidental, or consequential damage arising from:\n• Use or inability to use the service.\n• Damaged, missing, or misdescribed items.\n• Technical downtime of the service.' },
  { title: '9. Intellectual Property', body: 'All content in the app — logo, design, code — is the exclusive property of WinrSwipe. The user grants WinrSwipe a license to use published images and descriptions for platform marketing purposes.' },
  { title: '10. Account Termination', body: 'You can delete your account at any time from Profile → Delete account. That removes the user, their listings, bids, and messages. WinrSwipe may also suspend an account that violates these terms.' },
  { title: '11. Governing Law', body: 'These Terms are governed by the laws of the State of Israel. Any dispute shall be resolved in the competent courts of Tel Aviv-Jaffa.' },
  { title: '12. Contact', body: 'For questions regarding these Terms:\nEmail: boaz65sa@gmail.com\nSupport: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/support' },
];

export default function TermsScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const sections = (lang === 'he' ? HE : EN).map((sec) => {
    if (!PAYMENTS_ENABLED) return sec;
    if (lang === 'he' && sec.title.startsWith('5.')) {
      return { title: '5. עמלות', body: 'כשהחיוב בתוך האפליקציה פעיל: עמלת הגנה 2% ועמלת פלטפורמה 10%.' };
    }
    if (lang === 'en' && sec.title.startsWith('5.')) {
      return { title: '5. Fees', body: 'When in-app checkout is on: a 2% buyer protection fee and a 10% platform fee.' };
    }
    return sec;
  });

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{lang === 'he' ? 'תנאי שימוש' : 'Terms of Service'}</Text>
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
