import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { notifyUser } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

const { width } = Dimensions.get('window');

export default function ListingScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listing, setListing] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const [showBid, setShowBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  useEffect(() => {
    if (!listing?.ends_at) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, new Date(listing.ends_at).getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [listing]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: l } = await supabase.from('listings').select('*').eq('id', id).single();
      if (!l) { Alert.alert('שגיאה', 'לא נמצא מוצר'); router.back(); return; }
      setListing(l);
      setBidAmount(String((l.current_bid || l.starting_price) + 10));

      const { data: b } = await supabase
        .from('bids')
        .select('*, profiles(full_name)')
        .eq('listing_id', id)
        .order('amount', { ascending: false })
        .limit(10);
      if (b) setBids(b);

      if (l.seller_id) {
        const { data: s } = await supabase.from('profiles').select('*').eq('id', l.seller_id).single();
        if (s) setSeller(s);
      }
    } catch (e) {
      console.log('listing fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async () => {
    const amount = Number(bidAmount);
    const minBid = (listing.current_bid || listing.starting_price) + 1;
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
        .eq('listing_id', id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      const safeTradeFee = Math.round(amount * 0.02);
      const platformFee = Math.round(amount * 0.10);

      await supabase.from('bids').insert({ listing_id: id, bidder_id: user.id, amount });
      await supabase.from('listings').update({ current_bid: amount }).eq('id', id);

      // התראה לבידר הקודם
      if (prevBid?.bidder_id && prevBid.bidder_id !== user.id) {
        notifyUser(
          prevBid.bidder_id,
          '⚡ עקפו את הצעתך!',
          `הצעה חדשה של ₪${amount} על "${listing.title}". הגש הצעה חדשה!`,
          { screen: '/search' }
        );
      }

      // התראה למוכר
      if (listing.seller_id && listing.seller_id !== user.id) {
        notifyUser(
          listing.seller_id,
          '💰 הצעה חדשה!',
          `הצעה של ₪${amount} על "${listing.title}"`,
          { screen: '/profile' }
        );
      }
      await supabase.from('escrow_transactions').upsert({
        listing_id: id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount,
        safe_trade_fee: safeTradeFee,
        platform_fee: platformFee,
        status: 'holding',
      }, { onConflict: 'listing_id' });

      const isMatch = listing.reserve_price && amount >= listing.reserve_price;
      if (isMatch) {
        await supabase.from('listings').update({
          match_status: 'pending_seller',
          match_buyer_id: user.id,
          match_amount: amount,
        }).eq('id', id);
        Alert.alert('🎯 Match!', `הצעתך של ₪${amount} עברה את מחיר הרזרבה!`);
      } else {
        Alert.alert('הצעה הוגשה! ✓', `הגשת ₪${amount} + ₪${safeTradeFee} Safe Trade Fee`);
      }

      setShowBid(false);
      fetchAll();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message);
    } finally {
      setBidLoading(false);
    }
  };

  const buyNow = () => {
    Alert.alert(
      'קנה עכשיו',
      `לקנות את "${listing.title}" ב-₪${listing.buy_now_price}?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: `שלם ₪${listing.buy_now_price} ←`,
          onPress: () => router.push({
            pathname: '/payment',
            params: { listingId: listing.id, amount: listing.buy_now_price, title: listing.title },
          }),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#FF4D1C" size="large" />
      </View>
    );
  }

  if (!listing) return null;

  const images: string[] = listing.images || [];
  const currentBid = listing.current_bid || listing.starting_price;
  const safeTradeFee = Math.round(Number(bidAmount) * 0.02) || 0;

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]} numberOfLines={1}>{listing.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>

        {/* Image Carousel */}
        <View style={s.carouselWrap}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => setCurrentImg(Math.round(e.nativeEvent.contentOffset.x / width))}
              >
                {images.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={s.carouselImg} resizeMode="cover" />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={s.dots}>
                  {images.map((_, i) => (
                    <View key={i} style={[s.dot, i === currentImg && s.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[s.placeholderImg, { backgroundColor: theme.dark ? '#222' : '#F0EDE8' }]}>
              <Text style={{ fontSize: 72 }}>🛍️</Text>
            </View>
          )}

          {/* Overlays */}
          <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View>
          <View style={[s.timerPill, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <Text style={s.timerText}>⏱ {timeLeft || '--:--:--'}</Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={s.body}>
          <Text style={[s.title, { color: theme.text }]}>{listing.title}</Text>
          <View style={s.metaRow}>
            <Text style={[s.metaChip, { backgroundColor: theme.card, color: theme.sub, borderColor: theme.border }]}>
              {listing.category}
            </Text>
            {listing.condition && (
              <Text style={[s.metaChip, { backgroundColor: theme.card, color: theme.sub, borderColor: theme.border }]}>
                {listing.condition}
              </Text>
            )}
            {listing.city && (
              <Text style={[s.metaChip, { backgroundColor: theme.card, color: theme.sub, borderColor: theme.border }]}>
                📍 {listing.city}
              </Text>
            )}
          </View>

          {/* Price Block */}
          <View style={[s.priceBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.priceRow}>
              <View>
                <Text style={[s.priceLabel, { color: theme.sub }]}>הצעה נוכחית</Text>
                <Text style={s.priceVal}>₪{currentBid}</Text>
              </View>
              {listing.buy_now_price && listing.listing_type !== 'auction' && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.priceLabel, { color: theme.sub }]}>קנה עכשיו</Text>
                  <Text style={[s.priceLabel, { color: theme.text, fontSize: 18, fontWeight: '700' }]}>₪{listing.buy_now_price}</Text>
                </View>
              )}
            </View>
            <Text style={[s.bidsCount, { color: theme.sub }]}>{bids.length} הצעות</Text>
          </View>

          {/* Description */}
          {listing.description && (
            <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>תיאור המוצר</Text>
              <Text style={[s.descText, { color: theme.sub }]}>{listing.description}</Text>
            </View>
          )}

          {/* Seller Info */}
          {seller && (
            <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>המוכר</Text>
              <View style={s.sellerRow}>
                <View style={[s.sellerAvatar, { backgroundColor: theme.border }]}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.sellerName, { color: theme.text }]}>{seller.full_name || 'משתמש'}</Text>
                  {seller.city && <Text style={[s.sellerCity, { color: theme.sub }]}>📍 {seller.city}</Text>}
                </View>
                {seller.verified && (
                  <View style={s.verifiedBadge}>
                    <Text style={s.verifiedText}>✓ מאומת</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bid History */}
          {bids.length > 0 && (
            <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>היסטוריית הצעות</Text>
              {bids.map((bid, i) => (
                <View key={bid.id} style={[s.bidRow, i < bids.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                  <Text style={{ fontSize: 14 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '}</Text>
                  <Text style={[s.bidName, { color: theme.sub }]}>
                    {bid.profiles?.full_name || 'משתמש אנונימי'}
                  </Text>
                  <Text style={s.bidVal}>₪{bid.amount}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* CTA Buttons */}
      <View style={[s.cta, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        {listing.listing_type !== 'fixed' && (
          <TouchableOpacity
            style={[s.bidBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowBid(true)}
          >
            <Text style={[s.bidBtnText, { color: theme.text }]}>⬆ הצע</Text>
          </TouchableOpacity>
        )}
        {listing.buy_now_price && (
          <TouchableOpacity style={s.buyBtn} onPress={buyNow}>
            <Text style={s.buyBtnText}>קנה עכשיו ₪{listing.buy_now_price} ←</Text>
          </TouchableOpacity>
        )}
        {listing.listing_type === 'auction' && !listing.buy_now_price && (
          <TouchableOpacity style={s.buyBtn} onPress={() => setShowBid(true)}>
            <Text style={s.buyBtnText}>⬆ הגש הצעה ←</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bid Modal */}
      {showBid && (
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={s.modalBg} onPress={() => setShowBid(false)} />
          <View style={[s.modalSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[s.modalHandle, { backgroundColor: theme.border }]} />
            <Text style={[s.modalTitle, { color: theme.text }]}>הגש הצעה</Text>
            <Text style={[s.modalSub, { color: theme.sub }]}>{listing.title} · נוכחי: ₪{currentBid}</Text>
            <View style={[s.inputWrap, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Text style={[s.currency, { color: theme.sub }]}>₪</Text>
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <View style={s.feeBox}>
              <Text style={s.feeText}>Safe Trade Fee (2%): +₪{safeTradeFee}</Text>
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity
                style={[s.cancelBtn, { backgroundColor: theme.input, borderColor: theme.border }]}
                onPress={() => setShowBid(false)}
              >
                <Text style={[s.cancelText, { color: theme.text }]}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, bidLoading && { opacity: 0.6 }]}
                onPress={submitBid}
                disabled={bidLoading}
              >
                {bidLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.confirmText}>הגש ₪{bidAmount} ←</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },
  scroll: { flex: 1 },

  // Carousel
  carouselWrap: { width, height: 300, position: 'relative' },
  carouselImg: { width, height: 300 },
  placeholderImg: { width, height: 300, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#FF4D1C', width: 18 },
  livePill: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FF4D1C', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  timerPill: { position: 'absolute', top: 12, right: 12, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  timerText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Body
  body: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 10, lineHeight: 28 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  metaChip: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },

  // Price
  priceBlock: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  priceLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  priceVal: { fontSize: 30, fontWeight: '900', color: '#FF4D1C' },
  bidsCount: { fontSize: 12 },

  // Section
  section: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },

  // Description
  descText: { fontSize: 14, lineHeight: 22 },

  // Seller
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sellerName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  sellerCity: { fontSize: 12 },
  verifiedBadge: { backgroundColor: '#0A2A0A', borderWidth: 1, borderColor: '#1A5A1A', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedText: { color: '#4CAF50', fontSize: 11, fontWeight: '700' },

  // Bid History
  bidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  bidName: { flex: 1, fontSize: 13 },
  bidVal: { fontSize: 15, fontWeight: '800', color: '#FF4D1C' },

  // CTA
  cta: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28, borderTopWidth: 1 },
  bidBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  bidBtnText: { fontSize: 15, fontWeight: '700' },
  buyBtn: { flex: 2, padding: 16, backgroundColor: '#FF4D1C', borderRadius: 16, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Bid Modal
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, padding: 24 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSub: { fontSize: 13, marginBottom: 16 },
  inputWrap: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  currency: { fontSize: 20, fontWeight: '700', marginRight: 6 },
  input: { flex: 1, fontSize: 28, fontWeight: '900' },
  feeBox: { backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#3A1500', borderRadius: 10, padding: 10, marginBottom: 16 },
  feeText: { fontSize: 12, color: '#FF7A50' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  confirmBtn: { flex: 2, padding: 14, backgroundColor: '#FF4D1C', borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
