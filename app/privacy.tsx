import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from './_layout';

export default function PrivacyScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>מדיניות פרטיות</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.body}>

          <Text style={[s.updated, { color: theme.sub }]}>עודכן לאחרונה: מרץ 2026</Text>

          <Section theme={theme} title="1. מבוא">
            {`SwipeBid ("אנחנו", "השירות") מחויבת להגנת פרטיות המשתמשים. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו, ואיך ניתן לשלוט בו.`}
          </Section>

          <Section theme={theme} title="2. מידע שאנו אוספים">
            {`א. מידע שאתה מספק:\n• שם מלא, כתובת אימייל, מספר טלפון\n• כתובת מגורים ועיר\n• תמונות ווידאו של פריטים למכירה\n• מידע תשלום (מועבר ישירות ל-Stripe — לא נשמר אצלנו)\n\nב. מידע שנאסף אוטומטית:\n• מיקום GPS (רק בהסכמתך)\n• נתוני שימוש: מסכים שביקרת, חיפושים, הצעות\n• מזהה מכשיר ו-Push Token להתראות`}
          </Section>

          <Section theme={theme} title="3. כיצד אנו משתמשים במידע">
            {`• הפעלת שירות המכרזים וחיבור קונים ומוכרים\n• שליחת התראות Push על הצעות, זכיות ועדכונים\n• אימות זהות ומניעת הונאות\n• שיפור השירות וניתוח שימוש\n• עמידה בדרישות חוק ורגולציה ישראלית`}
          </Section>

          <Section theme={theme} title="4. שיתוף מידע עם צדדים שלישיים">
            {`אנו לא מוכרים את המידע שלך. אנו משתפים מידע רק עם:\n• Stripe — לעיבוד תשלומים מאובטח\n• Supabase — לאחסון מידע בשרתים מאובטחים\n• Expo — לשליחת התראות Push\n• רשויות חוק — בהתאם לצו שיפוטי בלבד`}
          </Section>

          <Section theme={theme} title="5. אחסון ואבטחת מידע">
            {`• המידע שלך מאוחסן בשרתי Supabase באירופה (EU-West)\n• כל ההעברות מוצפנות באמצעות TLS 1.3\n• גישה למידע מוגבלת לצוות מורשה בלבד\n• מידע תשלום מאובטח בתקן PCI DSS Level 1 (Stripe)`}
          </Section>

          <Section theme={theme} title="6. שמירת מידע">
            {`• מידע חשבון נשמר כל עוד החשבון פעיל\n• לאחר מחיקת חשבון — המידע נמחק תוך 30 יום\n• מידע עסקאות נשמר 7 שנים לצרכי ביקורת חשבונאית\n• לוגים טכניים נמחקים לאחר 90 יום`}
          </Section>

          <Section theme={theme} title="7. זכויותיך">
            {`בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR:\n• זכות עיון — לקבל עותק של המידע שנאסף\n• זכות תיקון — לעדכן מידע שגוי\n• זכות מחיקה — לדרוש מחיקת חשבונך\n• זכות התנגדות — לבקש הפסקת שימוש במידע לצרכי שיווק\n\nלמימוש הזכויות: support@swipebid.co.il`}
          </Section>

          <Section theme={theme} title="8. עוגיות ומעקב">
            {`האפליקציה אינה משתמשת בעוגיות. אנו משתמשים ב-Analytics בסיסי (מספר שימושים, ביצועים) ללא זיהוי אישי.`}
          </Section>

          <Section theme={theme} title="9. פרטיות ילדים">
            {`השירות אינו מיועד לאנשים מתחת לגיל 18. אנו לא אוספים מידע מילדים במתכוון. אם גילית שילד מתחת לגיל 18 הירשם, צור קשר לצורך מחיקת החשבון.`}
          </Section>

          <Section theme={theme} title="10. שינויים במדיניות">
            {`אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יגרמו לשליחת התראה באפליקציה. המשך שימוש לאחר ההודעה מהווה הסכמה לשינויים.`}
          </Section>

          <Section theme={theme} title="11. יצירת קשר">
            {`לכל שאלה בנוגע לפרטיות:\nאימייל: privacy@swipebid.co.il\nאתר: bs-simple.com\nכתובת: ישראל`}
          </Section>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ theme, title, children }: { theme: any; title: string; children: string }) {
  return (
    <View style={[sec.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[sec.title, { color: theme.text }]}>{title}</Text>
      <Text style={[sec.body, { color: theme.sub }]}>{children}</Text>
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1 },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  body: { fontSize: 13, lineHeight: 22 },
});

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  updated: { fontSize: 12, marginBottom: 14 },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
