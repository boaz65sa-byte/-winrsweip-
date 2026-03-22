import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function WonScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [wonItems, setWonItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWonItems();
  }, []);

  const loadWonItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('escrow_transactions')
        .select('*, listings(*, profiles:seller_id(full_name))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setWonItems(data);
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
    }
  };

  const confirmReceived = async (transactionId: string, listingId: string) => {
    Alert.alert(
      'אישור קבלה',
      'האם קיבלת את הפריט ואתה מרוצה ממנו?',
      [
        { text: 'לא עדיין', style: 'cancel' },
        {
          text: 'כן, קיבלתי! ✓',
          onPress: async () => {
            await supabase
              .from('escrow_transactions')
              .update({ status: 'completed' })
              .eq('id', transactionId);

            await supabase
              .from('listings')
              .update({ status: 'sold' })
              .eq('id', listingId);

            Alert.alert('תודה! ✓', 'הכסף שוחרר למוכר. עסקה הושלמה בהצלחה!');
            loadWonItems();
          }
        }
      ]
    );
  };

  const openDispute = async (transactionId: string) => {
    Alert.alert(
      'פתיחת מחלוקת',
      'מה הבעיה עם הפריט?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'פריט לא תואם תיאור',
          onPress: async () => {
            await supabase
              .from('escrow_transactions')
              .update({ status: 'dispute' })
              .eq('id', transactionId);
            Alert.alert('מחלוקת נפתחה', 'הכסף יישאר קפוא עד לפתרון. צוות SwipeBid יצור איתך קשר.');
            loadWonItems();
          }
        },
        {
          text: 'פריט לא הגיע',
          onPress: async () => {
            await supabase
              .from('escrow_transactions')
              .update({ status: 'dispute' })
              .eq('id', transactionId);
            Alert.alert('מחלוקת נפתחה', 'הכסף יישאר קפוא עד לפתרון. צוות SwipeBid יצור איתך קשר.');
            loadWonItems();
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'holding': return '#FFB347';
      case 'shipped': return '#378ADD';
      case 'completed': return '#4CAF50';
      case 'dispute': return '#FF4D1C';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'holding': return 'ממתין לשילוח';
      case 'shipped': return 'בדרך אליך';
      case 'completed': return 'הושלם ✓';
      case 'dispute': return 'במחלוקת';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#FF4D1C" size="large" />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={s.header}>
        <Text style={[s.title, { color: theme.text }]}>הרכישות שלי</Text>
        <Text style={[s.sub, { color: theme.sub }]}>עסקאות פעילות ועבר</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {wonItems.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>עדיין לא זכית במכרז</Text>
            <Text style={[s.emptySub, { color: theme.sub }]}>חזור לגלה וסווייפ ימינה!</Text>
          </View>
        )}

        {wonItems.map(item => (
          <View key={item.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

            <View style={s.cardHeader}>
              <View style={s.cardEmoji}>
                <Text style={{ fontSize: 28 }}>🛍️</Text>
              </View>
              <View style={s.cardInfo}>
                <Text style={[s.cardTitle2, { color: theme.text }]} numberOfLines={1}>
                  {item.listings?.title || 'פריט'}
                </Text>
                <Text style={[s.cardMeta, { color: theme.sub }]}>
                  {item.listings?.category} · {item.listings?.condition}
                </Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <View style={[s.divider, { backgroundColor: theme.border }]} />

            <View style={s.priceRow}>
              <View style={s.priceItem}>
                <Text style={[s.priceLabel, { color: theme.sub }]}>מחיר זוכה</Text>
                <Text style={[s.priceVal, { color: theme.text }]}>₪{item.amount}</Text>
              </View>
              <View style={s.priceItem}>
                <Text style={[s.priceLabel, { color: theme.sub }]}>Safe Trade Fee</Text>
                <Text style={[s.priceVal, { color: theme.text }]}>₪{item.safe_trade_fee || Math.round(item.amount * 0.02)}</Text>
              </View>
              <View style={s.priceItem}>
                <Text style={[s.priceLabel, { color: theme.sub }]}>סה"כ</Text>
                <Text style={[s.priceValBig]}>₪{item.amount + (item.safe_trade_fee || Math.round(item.amount * 0.02))}</Text>
              </View>
            </View>

            <View style={[s.escrowBox, { backgroundColor: theme.dark ? '#0A1F0A' : '#E8F5E9' }]}>
              <Text style={s.escrowIcon}>🔒</Text>
              <Text style={[s.escrowText, { color: '#4CAF50' }]}>
                הכסף מוחזק בנאמנות — ישוחרר למוכר רק לאחר אישורך
              </Text>
            </View>

            {item.status === 'shipped' && (
              <View style={s.actionBtns}>
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={() => confirmReceived(item.id, item.listing_id)}
                >
                  <Text style={s.confirmBtnText}>קיבלתי את הפריט ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.disputeBtn, { borderColor: theme.border }]}
                  onPress={() => openDispute(item.id)}
                >
                  <Text style={[s.disputeBtnText, { color: theme.sub }]}>יש בעיה</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'holding' && !item.paid && (
              <TouchableOpacity
                style={s.payBtn}
                onPress={() => router.push({
                  pathname: '/payment',
                  params: {
                    listingId: item.listing_id,
                    amount: item.amount,
                    title: item.listings?.title || 'פריט',
                  },
                })}
              >
                <Text style={s.payBtnText}>שלם עכשיו ₪{item.amount + (item.safe_trade_fee || Math.round(item.amount * 0.02))} ←</Text>
              </TouchableOpacity>
            )}

            {item.status === 'holding' && item.paid && (
              <View style={[s.waitBox, { backgroundColor: theme.input }]}>
                <Text style={[s.waitText, { color: theme.sub }]}>⏳ ממתין לשילוח מהמוכר</Text>
              </View>
            )}

            {/* כפתור צ'אט — זמין בכל סטטוס שאינו completed */}
            {item.status !== 'completed' && item.listings?.seller_id && (
              <TouchableOpacity
                style={[s.chatBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={() => router.push({
                  pathname: '/chat',
                  params: {
                    listingId: item.listing_id,
                    otherUserId: item.listings.seller_id,
                    otherName: item.listings.profiles?.full_name || 'המוכר',
                    listingTitle: item.listings.title || 'פריט',
                  },
                })}
              >
                <Text style={s.chatBtnIcon}>💬</Text>
                <Text style={[s.chatBtnText, { color: theme.text }]}>צ'אט עם המוכר</Text>
              </TouchableOpacity>
            )}

            {item.status === 'completed' && (
              <View style={[s.waitBox, { backgroundColor: '#0A2A0A' }]}>
                <Text style={{ color: '#4CAF50', fontSize: 13, textAlign: 'center' }}>✓ עסקה הושלמה — הכסף שוחרר למוכר</Text>
              </View>
            )}

          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  sub: { fontSize: 12, marginTop: 3 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyBox: { borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 13 },
  card: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardEmoji: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle2: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardMeta: { fontSize: 11 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  divider: { height: 1, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceItem: { alignItems: 'center' },
  priceLabel: { fontSize: 10, marginBottom: 3 },
  priceVal: { fontSize: 14, fontWeight: '600' },
  priceValBig: { fontSize: 16, fontWeight: '900', color: '#FF4D1C' },
  escrowBox: { borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  escrowIcon: { fontSize: 14 },
  escrowText: { flex: 1, fontSize: 11, lineHeight: 16 },
  actionBtns: { gap: 8 },
  confirmBtn: { backgroundColor: '#FF4D1C', borderRadius: 14, padding: 14, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  disputeBtn: { borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  disputeBtnText: { fontSize: 13 },
  waitBox: { borderRadius: 12, padding: 12, alignItems: 'center' },
  waitText: { fontSize: 12 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 12, borderWidth: 1, marginTop: 8 },
  chatBtnIcon: { fontSize: 16 },
  chatBtnText: { fontSize: 14, fontWeight: '600' },
  payBtn: { backgroundColor: '#FF4D1C', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  payBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים