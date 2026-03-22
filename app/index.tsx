import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { notifyUser } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

const { width } = Dimensions.get('window');

const FALLBACK = [
  { id: '1', emoji: '🧥', title: "Vintage Leather Jacket", category: "אופנה", condition: "טוב", current_bid: 150, buy_now_price: 300, starting_price: 100, listing_type: 'both', images: [], ends_at: new Date(Date.now() + 24 * 3600000).toISOString() },
  { id: '2', emoji: '📸', title: "Nikon FM2 וינטג'", category: "מצלמות", condition: "כמו חדש", current_bid: 480, buy_now_price: 900, starting_price: 400, listing_type: 'auction', images: [], ends_at: new Date(Date.now() + 12 * 3600000).toISOString() },
];

export default function App() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(FALLBACK);
  const [showBid, setShowBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({});
  const [cityFilter, setCityFilter] = useState<string | null>(null); // null = כל הארץ
  const [userCity, setUserCity] = useState<string | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => { detectCity(); }, []);
  useEffect(() => { loadListings(); }, [cityFilter]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newTimes: {[key: string]: string} = {};
      products.forEach(p => {
        if (p.ends_at) {
          const end = new Date(p.ends_at);
          const diff = Math.max(0, end.getTime() - now.getTime());
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          newTimes[p.id] = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
      });
      setTimeLeft(newTimes);
    }, 1000);
    return () => clearInterval(timer);
  }, [products]);

  const detectCity = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(loc.coords);
      if (address?.city) {
        setUserCity(address.city);
        setCityFilter(address.city);
      }
    } catch (e) {
      // no location — show all
    }
  };

  const loadListings = async () => {
    try {
      let q = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (cityFilter) q = q.eq('city', cityFilter);

      const { data } = await q;
      if (data && data.length > 0) {
        setProducts(data.map(item => ({ ...item, emoji: '🛍️', bids: 0, watchers: 0 })));
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.log('fallback');
    } finally {
      setLoading(false);
    }
  };

  const buyNow = async (product: any) => {
    Alert.alert(
      'קנה עכשיו',
      `לקנות את "${product.title}" ב-₪${product.buy_now_price}?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: `שלם ₪${product.buy_now_price} ←`,
          onPress: () => router.push({
            pathname: '/payment',
            params: {
              listingId: product.id,
              amount: product.buy_now_price,
              title: product.title,
            }
          })
        }
      ]
    );
  };

  const submitBid = async () => {
    const amount = Number(bidAmount);
    const product = products[0];
    const minBid = (product.current_bid || product.starting_price) + 1;

    if (!bidAmount || amount < minBid) {
      Alert.alert('שגיאה', `המינימום הוא ₪${minBid}`);
      return;
    }

    setBidLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('שגיאה', 'התחבר קודם'); return; }

      // שלוף הבידר הקודם לפני העדכון
      const { data: prevBid } = await supabase
        .from('bids')
        .select('bidder_id')
        .eq('listing_id', product.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      const safeTradeFee = Math.round(amount * 0.02);
      const platformFee = Math.round(amount * 0.10);

      await supabase.from('bids').insert({ listing_id: product.id, bidder_id: user.id, amount });
      await supabase.from('listings').update({ current_bid: amount }).eq('id', product.id);

      // התראה לבידר הקודם — עקפו אותו
      if (prevBid?.bidder_id && prevBid.bidder_id !== user.id) {
        notifyUser(
          prevBid.bidder_id,
          '⚡ עקפו את הצעתך!',
          `הצעה חדשה של ₪${amount} על "${product.title}". הגש הצעה חדשה!`,
          { screen: '/search' }
        );
      }

      // התראה למוכר על הצעה חדשה
      if (product.seller_id && product.seller_id !== user.id) {
        notifyUser(
          product.seller_id,
          '💰 הצעה חדשה!',
          `הצעה של ₪${amount} על "${product.title}"`,
          { screen: '/profile' }
        );
      }
      await supabase.from('escrow_transactions').upsert({
        listing_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        amount,
        safe_trade_fee: safeTradeFee,
        platform_fee: platformFee,
        status: 'holding',
      }, { onConflict: 'listing_id' });

      const isMatch = product.reserve_price && amount >= product.reserve_price;
      if (isMatch) {
        await supabase.from('listings').update({
          match_status: 'pending_seller',
          match_buyer_id: user.id,
          match_amount: amount,
        }).eq('id', product.id);
        Alert.alert('🎯 Match!', `הצעתך של ₪${amount} עברה את מחיר הרזרבה! המוכר קיבל התראה לאישור.`);
      } else {
        Alert.alert('הצעה הוגשה! ✓', `הגשת ₪${amount} + ₪${safeTradeFee} Safe Trade Fee`);
      }

      setShowBid(false);
      setBidAmount('');
      loadListings();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message);
    } finally {
      setBidLoading(false);
    }
  };

  const product = products[0];

  const nextCard = () => {
    setProducts(prev => prev.slice(1));
    translateX.value = 0;
    translateY.value = 0;
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => { translateX.value = e.translationX; translateY.value = e.translationY; })
    .onEnd((e) => {
      if (e.translationX > 100) translateX.value = withSpring(width * 1.5, {}, () => runOnJS(nextCard)());
      else if (e.translationX < -100) translateX.value = withSpring(-width * 1.5, {}, () => runOnJS(nextCard)());
      else { translateX.value = withSpring(0); translateY.value = withSpring(0); }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / width) * 15}deg` }
    ],
  }));

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#FF4D1C" size="large" />
        <Text style={{ color: theme.sub, marginTop: 12, fontSize: 13 }}>טוען מכרזים...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[s.root, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900' }}>ראית הכל!</Text>
        <Text style={{ color: theme.sub, fontSize: 14 }}>אין עוד מכרזים כרגע</Text>
        <TouchableOpacity
          style={{ marginTop: 8, backgroundColor: '#FF4D1C', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 }}
          onPress={() => { setLoading(true); loadListings(); }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>רענן</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <Text style={[s.logo, { color: theme.text }]}>Winr<Text style={s.logoAccent}>Swipe</Text></Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={theme.toggle} style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name={theme.dark ? 'sunny' : 'moon'} size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setLoading(true); loadListings(); }} style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="refresh" size={18} color={theme.sub} />
          </TouchableOpacity>
        </View>
      </View>

      {/* City filter bar */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 }}>
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: cityFilter === null ? '#FF4D1C' : theme.card, borderColor: cityFilter === null ? '#FF4D1C' : theme.border, flex: 1, borderRadius: 20, height: 36 }]}
          onPress={() => { setCityFilter(null); setLoading(true); }}
        >
          <Text style={{ color: cityFilter === null ? '#fff' : theme.sub, fontSize: 12, fontWeight: '700' }}>🌍 כל הארץ</Text>
        </TouchableOpacity>
        {userCity && (
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: cityFilter === userCity ? '#FF4D1C' : theme.card, borderColor: cityFilter === userCity ? '#FF4D1C' : theme.border, flex: 1, borderRadius: 20, height: 36 }]}
            onPress={() => { setCityFilter(userCity); setLoading(true); }}
          >
            <Text style={{ color: cityFilter === userCity ? '#fff' : theme.sub, fontSize: 12, fontWeight: '700' }}>📍 {userCity}</Text>
          </TouchableOpacity>
        )}
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }, animatedStyle]}>
          <View style={[s.cardImg, { backgroundColor: theme.dark ? '#222' : '#F0EDE8' }]}>
            {product.images && product.images.length > 0 ? (
              <Image source={{ uri: product.images[0] }} style={s.cardRealImg} resizeMode="cover" />
            ) : (
              <Text style={s.cardEmoji}>{product.emoji || '🛍️'}</Text>
            )}
            <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View>
            <View style={[s.timerPill, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)', borderColor: theme.border }]}>
              <Text style={s.timerText}>⏱ {timeLeft[product.id] || '00:00:00'}</Text>
            </View>
            <View style={[s.watchersPill, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]}>
              <Text style={s.watchersText}>👁 {product.watchers || 0}</Text>
            </View>
          </View>
          <View style={s.cardBody}>
            <Text style={[s.cardTitle, { color: theme.text }]}>{product.title}</Text>
            <Text style={[s.cardMeta, { color: theme.sub }]}>{product.category} · {product.condition}</Text>
            <View style={s.priceRow}>
              <View>
                <Text style={[s.bidLabel, { color: theme.sub }]}>הצעה נוכחית</Text>
                <Text style={s.bidAmount}>₪{product.current_bid || product.starting_price}</Text>
              </View>
              {product.buy_now_price && (
                <TouchableOpacity style={s.buyNowBtn} onPress={() => buyNow(product)}>
                  <Text style={s.buyNowText}>קנה עכשיו ₪{product.buy_now_price}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[s.bidsCount, { color: theme.sub }]}>{product.bids || 0} הצעות · {product.watchers || 0} צופים</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={s.actions}>
        <TouchableOpacity style={[s.btnPass, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => { translateX.value = withSpring(-width * 1.5, {}, () => runOnJS(nextCard)()); }}>
          <Ionicons name="close" size={26} color={theme.sub} />
        </TouchableOpacity>
        <TouchableOpacity style={s.btnBid} onPress={() => { setBidAmount(String((product.current_bid || product.starting_price) + 10)); setShowBid(true); }}>
          <Ionicons name="arrow-up" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnWatch, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => { translateX.value = withSpring(width * 1.5, {}, () => runOnJS(nextCard)()); }}>
          <Ionicons name="heart" size={24} color="#FF4D1C" />
        </TouchableOpacity>
      </View>

      <Text style={[s.hint, { color: theme.sub }]}>← דלג  |  ⬆ הצע  |  → שמור</Text>

      {showBid && (
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={s.modalBg} onPress={() => setShowBid(false)} />
          <View style={[s.modalSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[s.modalHandle, { backgroundColor: theme.border }]} />
            <Text style={[s.modalTitle, { color: theme.text }]}>הגש הצעה</Text>
            <Text style={[s.modalSub, { color: theme.sub }]}>{product.title} · נוכחי: ₪{product.current_bid || product.starting_price}</Text>
            <View style={[s.bidInputWrap, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Text style={[s.currency, { color: theme.sub }]}>₪</Text>
              <TextInput style={[s.bidInput, { color: theme.text }]} value={bidAmount} onChangeText={setBidAmount} keyboardType="numeric" autoFocus />
            </View>
            <View style={s.feeBox}>
              <Text style={s.feeText}>Safe Trade Fee (2%): +₪{Math.round(Number(bidAmount) * 0.02) || 0}</Text>
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.cancelBtn, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={() => setShowBid(false)}>
                <Text style={[s.cancelText, { color: theme.text }]}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.confirmBtn, bidLoading && { opacity: 0.6 }]} onPress={submitBid} disabled={bidLoading}>
                {bidLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>הגש ₪{bidAmount} ←</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  logo: { fontWeight: '900', fontSize: 24, letterSpacing: -1 },
  logoAccent: { color: '#FF4D1C' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
  cardImg: { height: 260, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardRealImg: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
  cardEmoji: { fontSize: 80 },
  livePill: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FF4D1C', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  timerPill: { position: 'absolute', top: 12, right: 12, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  timerText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  watchersPill: { position: 'absolute', bottom: 12, right: 12, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  watchersText: { color: '#fff', fontSize: 10 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardMeta: { fontSize: 12, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bidLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  bidAmount: { fontSize: 26, fontWeight: '900', color: '#FF4D1C' },
  buyNowBtn: { backgroundColor: '#FF4D1C', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  buyNowText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bidsCount: { fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 20 },
  btnPass: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnBid: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#FF4D1C', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4D1C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnWatch: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { textAlign: 'center', fontSize: 11, marginTop: 4 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, padding: 24 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSub: { fontSize: 13, marginBottom: 16 },
  bidInputWrap: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  currency: { fontSize: 20, fontWeight: '700', marginRight: 6 },
  bidInput: { flex: 1, fontSize: 28, fontWeight: '900' },
  feeBox: { backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#3A1500', borderRadius: 10, padding: 10, marginBottom: 16 },
  feeText: { fontSize: 12, color: '#FF7A50' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  confirmBtn: { flex: 2, padding: 14, backgroundColor: '#FF4D1C', borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});