import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from './_layout';

export default function TermsScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>תנאי שימוש</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.body}>

          <Text style={[s.updated, { color: theme.sub }]}>עודכן לאחרונה: מרץ 2026</Text>

          <Section theme={theme} title="1. קבלת התנאים">
            {`ברוכים הבאים ל-SwipeBid. השימוש באפליקציה מהווה הסכמה מלאה לתנאי שימוש אלו. אם אינך מסכים לתנאים, אנא הפסק את השימוש באפליקציה.`}
          </Section>

          <Section theme={theme} title="2. השירות">
            {`SwipeBid היא פלטפורמת מכרזים מקוונת המאפשרת למשתמשים לרכוש ולמכור פריטים באמצעות מכרז בסגנון Swipe. אנו משמשים כמתווכים בלבד ואיננו צד לעסקאות בין קונים למוכרים.`}
          </Section>

          <Section theme={theme} title="3. רישום וחשבון">
            {`• עליך להיות בן 18 ומעלה לשימוש בשירות.\n• עליך לספק מידע מדויק ועדכני בעת ההרשמה.\n• אחריות על שמירת סיסמאתך ואבטחת חשבונך מוטלת עליך בלבד.\n• אין להעביר את חשבונך לאחר.`}
          </Section>

          <Section theme={theme} title="4. כללי התנהגות">
            {`המשתמש מתחייב:\n• לא לפרסם פריטים אסורים, מזויפים, או גנובים.\n• לא להגיש הצעות פיקטיביות (Shill Bidding).\n• לכבד את תוצאות המכרז ולהשלים עסקאות שזכה בהן.\n• לא לפגוע, להטריד או לאיים על משתמשים אחרים.`}
          </Section>

          <Section theme={theme} title="5. עמלות ותשלומים">
            {`• Safe Trade Fee: 2% מסכום העסקה, מוחזק בנאמנות (Escrow) עד לאישור קבלת הפריט.\n• עמלת פלטפורמה: 10% מסכום המכירה, מנוכה מתשלום המוכר.\n• כל התשלומים מבוצעים באמצעות Stripe ומאובטחים בתקן PCI DSS.`}
          </Section>

          <Section theme={theme} title="6. Escrow ונאמנות">
            {`SwipeBid מפעיל מנגנון Escrow להגנה על הקונה והמוכר:\n• הכסף מוחזק בנאמנות עד שהקונה מאשר קבלת הפריט.\n• לאחר 14 יום ללא אישור — הכסף משוחרר אוטומטית למוכר.\n• במקרה של מחלוקת, SwipeBid שומרת לעצמה את הזכות להכריע.`}
          </Section>

          <Section theme={theme} title="7. ביטולים והחזרות">
            {`• מוכר רשאי לבטל מכרז לפני קבלת הצעה ראשונה בלבד.\n• לאחר זכייה, עסקה ניתנת לביטול רק בהסכמת שני הצדדים.\n• SwipeBid אינה אחראית לאיכות הפריטים, מצבם, או התאמתם לתיאור.`}
          </Section>

          <Section theme={theme} title="8. הגבלת אחריות">
            {`SwipeBid לא תהיה אחראית לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע מ:\n• שימוש או אי-שימוש בשירות.\n• פריטים פגומים, חסרים, או שאינם תואמים לתיאור.\n• השבתה טכנית של השירות.`}
          </Section>

          <Section theme={theme} title="9. קניין רוחני">
            {`כל תוכן באפליקציה — לוגו, עיצוב, קוד — הוא רכושה הבלעדי של SwipeBid. המשתמש מעניק ל-SwipeBid רישיון לשימוש בתמונות ותיאורים שפרסם לצורכי שיווק הפלטפורמה.`}
          </Section>

          <Section theme={theme} title="10. סיום חשבון">
            {`SwipeBid שומרת לעצמה את הזכות להשעות או למחוק חשבון שהפר את תנאי השימוש, ללא הודעה מוקדמת.`}
          </Section>

          <Section theme={theme} title="11. דין ושיפוט">
            {`תנאים אלו כפופים לדיני מדינת ישראל. כל מחלוקת תידון בבתי המשפט המוסמכים בתל אביב-יפו.`}
          </Section>

          <Section theme={theme} title="12. יצירת קשר">
            {`לשאלות בנוגע לתנאי השימוש:\nאימייל: support@swipebid.co.il\nאתר: bs-simple.com`}
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
