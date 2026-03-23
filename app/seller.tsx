import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function SellerScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadMyListings(); }, []);

  const loadMyListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setMyListings(data);
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadMyListings(); };

  const approveMatch = async (listing: any) => {
    Alert.alert(
      '🎯 אישור Match',
      `לאשר מכירה של "${listing.title}" ב-₪${listing.match_amount}?`,
      [
        { text: 'לא עכשיו', style: 'cancel' },
        {
          text: 'כן, אשר מכירה ✓',
          onPress: async () => {
            await supabase.from('listings').update({
              status: 'sold',
              match_status: 'approved',
            }).eq('id', listing.id);

            await supabase.from('escrow_transactions').update({
              status: 'holding',
            }).eq('listing_id', listing.id);

            Alert.alert('אושר! 🎉', 'הקונה קיבל התראה. הכסף יועבר אליך לאחר אישור קבלה.');
            loadMyListings();
          }
        }
      ]
    );
  };

  const rejectMatch = async (listing: any) => {
    Alert.alert(
      'דחיית Match',
      'לדחות את ההצעה? המכרז ימשיך.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'דחה והמשך מכרז',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('listings').update({
              match_status: null,
              match_buyer_id: null,
              match_amount: null,
            }).eq('id', listing.id);

            Alert.alert('נדחה', 'המכרז ממשיך. הצעות נוספות יתקבלו.');
            loadMyListings();
          }
        }
      ]
    );
  };

  const deleteListing = async (listing: any) => {
    Alert.alert(
      'מחיקת פרסום',
      `למחוק את "${listing.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('listings').delete().eq('id', listing.id);
            loadMyListings();
          }
        }
      ]
    );
  };

  const renewListing = async (listing: any) => {
    Alert.alert(
      'חידוש פרסום',
      'לחדש את הפרסום ל-24 שעות נוספות?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'חדש פרסום ←',
          onPress: async () => {
            await supabase.from('listings').update({
              status: 'pending',
              ends_at: new Date(Date.now() + 24 * 3600000).toISOString(),
              match_status: null,
              match_buyer_id: null,
              match_amount: null,
            }).eq('id', listing.id);

            Alert.alert('נשלח לאישור ✓', 'הפרסום שלך ממתין לאישור מנהל.');
            loadMyListings();
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FFB347';
      case 'sold': return '#378ADD';
      case 'rejected': return '#666';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '🟢 פעיל';
      case 'pending': return '⏳ ממתין לאישור';
      case 'sold': return '✅ נמכר';
      case 'rejected': return '❌ נדחה';
      default: return status;
    }
  };

  const matches = myListings.filter(l => l.match_status === 'pending_seller');
  const pending = myListings.filter(l => l.status === 'pending');
  const active = myListings.filter(l => l.status === 'active' && !l.match_status);
  const ended = myListings.filter(l => l.status === 'sold' || l.status === 'rejected');

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
        <Text style={[s.title, { color: theme.text }]}>המכרזים שלי</Text>
        <Text style={[s.sub, { color: theme.sub }]}>{myListings.length} פרסומים</Text>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4D1C" />}
      >

        {/* Matches ממתינים לאישור */}
        {matches.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>🎯 Matches — ממתינים לאישורך</Text>
              <View style={s.badge}><Text style={s.badgeText}>{matches.length}</Text></View>
            </View>
            {matches.map(item => (
              <View key={item.id} style={[s.matchCard, { backgroundColor: theme.dark ? '#1A1000' : '#FFF8E1', borderColor: '#FF4D1C' }]}>
                <Text style={[s.matchTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[s.matchAmount, { color: '#FF4D1C' }]}>₪{item.match_amount}</Text>
                <Text style={[s.matchSub, { color: theme.sub }]}>הצעה הגיעה למחיר הרזרבה שלך</Text>
                <View style={s.matchBtns}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => approveMatch(item)}>
                    <Text style={s.approveBtnText}>אשר מכירה ✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.rejectBtn, { borderColor: theme.border }]} onPress={() => rejectMatch(item)}>
                    <Text style={[s.rejectBtnText, { color: theme.sub }]}>דחה — המשך מכרז</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* פרסומים ממתינים לאישור */}
        {pending.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>⏳ ממתינים לאישור מנהל</Text>
              <View style={[s.badge, { backgroundColor: '#FFB347' }]}><Text style={s.badgeText}>{pending.length}</Text></View>
            </View>
            {pending.map(item => (
              <View key={item.id} style={[s.card, { backgroundColor: theme.card, borderColor: '#FFB347' }]}>
                <View style={s.cardTop}>
                  <Text style={[s.cardTitle2, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: '#FFB34722' }]}>
                    <Text style={[s.statusText, { color: '#FFB347' }]}>⏳ ממתין</Text>
                  </View>
                </View>
                <Text style={[s.cardMeta, { color: theme.sub, marginBottom: 10 }]}>
                  מחיר: <Text style={{ color: '#FF4D1C', fontWeight: '700' }}>₪{item.starting_price}</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[s.editBtn, { borderColor: theme.border }]}
                    onPress={() => router.push({ pathname: '/sell', params: { listingId: item.id } })}
                  >
                    <Text style={[s.editBtnText, { color: theme.text }]}>✏️ ערוך</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => deleteListing(item)}
                  >
                    <Text style={s.deleteBtnText}>🗑 מחק</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* פרסומים פעילים */}
        {active.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>פרסומים פעילים</Text>
            {active.map(item => (
              <View key={item.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={s.cardTop}>
                  <Text style={[s.cardTitle2, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                    <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                <View style={s.cardBottom}>
                  <Text style={[s.cardMeta, { color: theme.sub }]}>
                    הצעה נוכחית: <Text style={{ color: '#FF4D1C', fontWeight: '700' }}>₪{item.current_bid || item.starting_price}</Text>
                  </Text>
                  {item.reserve_price && (
                    <Text style={[s.cardMeta, { color: theme.sub }]}>
                      רזרבה: <Text style={{ color: '#FFB347' }}>₪{item.reserve_price} 🔒</Text>
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* פרסומים שנגמרו */}
        {ended.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>היסטוריה</Text>
            {ended.map(item => (
              <View key={item.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={s.cardTop}>
                  <Text style={[s.cardTitle2, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                    <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                {item.status === 'rejected' && (
                  <TouchableOpacity style={s.renewBtn} onPress={() => renewListing(item)}>
                    <Text style={s.renewBtnText}>↻ חדש פרסום</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {myListings.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>עדיין לא פרסמת כלום</Text>
            <Text style={[s.emptySub, { color: theme.sub }]}>לחץ על "פרסם" כדי להתחיל</Text>
          </View>
        )}

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
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  badge: { backgroundColor: '#FF4D1C', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  matchCard: { borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 2 },
  matchTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  matchAmount: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  matchSub: { fontSize: 12, marginBottom: 14 },
  matchBtns: { gap: 8 },
  approveBtn: { backgroundColor: '#FF4D1C', borderRadius: 14, padding: 14, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  rejectBtn: { borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  rejectBtnText: { fontSize: 13 },
  card: { borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle2: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardBottom: { gap: 3 },
  cardMeta: { fontSize: 12 },
  renewBtn: { backgroundColor: '#FF4D1C22', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 8 },
  renewBtnText: { color: '#FF4D1C', fontWeight: '700', fontSize: 13 },
  emptyBox: { borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 13 },
  editBtn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FF4D1C22', borderRadius: 10, padding: 10, alignItems: 'center', paddingHorizontal: 16 },
  deleteBtnText: { color: '#FF4D1C', fontSize: 13, fontWeight: '600' },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים