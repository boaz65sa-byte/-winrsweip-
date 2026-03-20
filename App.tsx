import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useRef, useState } from 'react';

const { width, height } = Dimensions.get('window');

const PRODUCTS = [
  { id: 1, emoji: '🧥', title: "Vintage Leather Jacket", meta: "אופנה · יפו · מידה M", bid: 150, buyNow: 300, bids: 3, watchers: 8, timer: "23:41" },
  { id: 2, emoji: '📸', title: "Nikon FM2 וינטג'", meta: "מצלמה · תל אביב · מצב טוב", bid: 480, buyNow: 900, bids: 7, watchers: 12, timer: "11:22" },
  { id: 3, emoji: '🎸', title: "Fender Stratocaster", meta: "מוזיקה · חיפה · משומש", bid: 1100, buyNow: 2000, bids: 5, watchers: 19, timer: "06:14" },
  { id: 4, emoji: '💻', title: "MacBook Air M2", meta: "אלקטרוניקה · רמת גן · כמו חדש", bid: 3200, buyNow: 4500, bids: 11, watchers: 22, timer: "02:05" },
];

export default function App() {
  const [index, setIndex] = useState(0);
  const [showBid, setShowBid] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = translateX.interpolate({ inputRange: [-width, 0, width], outputRange: ['-15deg', '0deg', '15deg'] });

  const product = PRODUCTS[index % PRODUCTS.length];

  const swipe = (dir: 'left' | 'right') => {
    Animated.timing(translateX, { toValue: dir === 'left' ? -width * 1.5 : width * 1.5, duration: 300, useNativeDriver: true }).start(() => {
      translateX.setValue(0);
      setIndex(i => i + 1);
    });
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>Swipe<Text style={s.logoAccent}>Bid</Text></Text>
        <View style={s.notifBtn}><View style={s.notifDot} /></View>
      </View>

      {/* Card */}
      <Animated.View style={[s.card, { transform: [{ translateX }, { rotate }] }]}>
        <View style={s.cardImg}>
          <Text style={s.cardEmoji}>{product.emoji}</Text>
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
          <View style={s.timerPill}>
            <Text style={s.timerText}>⏱ {product.timer}</Text>
          </View>
          <View style={s.watchersPill}>
            <Text style={s.watchersText}>👁 {product.watchers}</Text>
          </View>
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardTitle}>{product.title}</Text>
          <Text style={s.cardMeta}>{product.meta}</Text>
          <View style={s.priceRow}>
            <View>
              <Text style={s.bidLabel}>הצעה נוכחית</Text>
              <Text style={s.bidAmount}>₪{product.bid}</Text>
            </View>
            <View style={s.binBlock}>
              <Text style={s.binLabel}>קנה עכשיו</Text>
              <Text style={s.binAmount}>₪{product.buyNow}</Text>
            </View>
          </View>
          <Text style={s.bidsCount}>{product.bids} הצעות · {product.watchers} צופים</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.btnPass} onPress={() => swipe('left')}>
          <Text style={s.btnPassText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnBid} onPress={() => setShowBid(true)}>
          <Text style={s.btnBidText}>⬆</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnWatch} onPress={() => swipe('right')}>
          <Text style={s.btnWatchText}>♥</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.hint}>← דלג  |  ⬆ הצע  |  → שמור</Text>

      {/* Bid Modal */}
      {showBid && (
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>הגש הצעה</Text>
            <Text style={s.modalSub}>{product.title} · נוכחי: ₪{product.bid}</Text>
            <View style={s.feeBox}>
              <Text style={s.feeText}>Safe Trade Fee (2%) יתווסף בתשלום</Text>
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowBid(false)}>
                <Text style={s.cancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={() => setShowBid(false)}>
                <Text style={s.confirmText}>הצע ₪{product.bid + 50} ←</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  logo: { fontWeight: '900', fontSize: 24, color: '#fff', letterSpacing: -1 },
  logoAccent: { color: '#FF4D1C' },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D1C' },
  card: { marginHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardImg: { height: 260, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardEmoji: { fontSize: 80 },
  livePill: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FF4D1C', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  timerPill: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  timerText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  watchersPill: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  watchersText: { color: '#aaa', fontSize: 10 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#666', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bidLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  bidAmount: { fontSize: 26, fontWeight: '900', color: '#FF4D1C' },
  binBlock: { alignItems: 'flex-end' },
  binLabel: { fontSize: 10, color: '#444', marginBottom: 2 },
  binAmount: { fontSize: 14, fontWeight: '500', color: '#777' },
  bidsCount: { fontSize: 12, color: '#555', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 20 },
  btnPass: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  btnPassText: { color: '#666', fontSize: 20, fontWeight: '700' },
  btnBid: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF4D1C', alignItems: 'center', justifyContent: 'center' },
  btnBidText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  btnWatch: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  btnWatchText: { color: '#666', fontSize: 20 },
  hint: { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 4 },
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: '#2A2A2A', padding: 24 },
  modalHandle: { width: 36, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#666', marginBottom: 16 },
  feeBox: { backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#3A1500', borderRadius: 10, padding: 10, marginBottom: 16 },
  feeText: { fontSize: 12, color: '#FF7A50' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  cancelText: { color: '#fff', fontWeight: '600' },
  confirmBtn: { flex: 2, padding: 14, backgroundColor: '#FF4D1C', borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});