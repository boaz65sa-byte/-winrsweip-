import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function AdminScreen() {
  const theme = useContext(ThemeContext);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsData) setListings(listingsData);

      const { data: statsData } = await supabase
        .from('admin_stats')
        .select('*')
        .single();

      if (statsData) setStats(statsData);

    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const approve = async (id: string) => {
    await supabase.from('listings').update({ status: 'active' }).eq('id', id);
    Alert.alert('אושר ✓', 'הפריט עלה לאוויר');
    loadData();
  };

  const reject = async (id: string) => {
    Alert.alert('דחיית פריט', 'האם לדחות את הפריט?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'דחה', style: 'destructive', onPress: async () => {
        await supabase.from('listings').update({ status: 'rejected' }).eq('id', id);
        loadData();
      }},
    ]);
  };

  const deleteListing = async (id: string, title: string) => {
    Alert.alert('מחיקת מודעה', `למחוק את "${title}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: async () => {
        await supabase.from('listings').delete().eq('id', id);
        Alert.alert('נמחק ✓');
        loadData();
      }},
    ]);
  };

  const editStatus = async (id: string, currentStatus: string) => {
    const statuses = ['active', 'pending', 'sold', 'rejected', 'expired'];
    Alert.alert('שנה סטטוס', `סטטוס נוכחי: ${currentStatus}`, [
      { text: 'ביטול', style: 'cancel' },
      ...statuses.filter(s => s !== currentStatus).map(s => ({
        text: s,
        onPress: async () => {
          await supabase.from('listings').update({ status: s }).eq('id', id);
          loadData();
        }
      }))
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF4D1C';
      case 'sold': return '#378ADD';
      case 'expired': return '#888';
      case 'rejected': return '#555';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'pending': return 'ממתין';
      case 'sold': return 'נמכר';
      case 'expired': return 'פג תוקף';
      case 'rejected': return 'נדחה';
      default: return status;
    }
  };

  const pending = listings.filter(l => l.status === 'pending');

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
        <Text style={[s.title, { color: theme.text }]}>ניהול</Text>
        <Text style={[s.sub, { color: theme.sub }]}>לוח בקרה מלא</Text>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4D1C" />}
      >

        {/* סטטיסטיקות ראשיות */}
        {stats && (
          <>
            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>סטטיסטיקות כלליות</Text>
            <View style={s.statsGrid}>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#FF4D1C' }]}>{stats.total_users}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>משתמשים</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#4CAF50' }]}>{stats.active_listings}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>מכרזים פעילים</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#378ADD' }]}>{stats.total_sold}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>נמכרו</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#FFB347' }]}>{stats.total_bids}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>הצעות</Text>
              </View>
            </View>

            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>פיננסי</Text>
            <View style={s.statsGrid}>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#4CAF50', fontSize: 16 }]}>₪{Number(stats.total_gmv).toLocaleString()}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>GMV כולל</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#FFB347', fontSize: 16 }]}>₪{Number(stats.total_revenue).toLocaleString()}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>הכנסות</Text>
              </View>
            </View>

            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>היום</Text>
            <View style={s.statsGrid}>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#FF4D1C' }]}>{stats.listings_today}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>פרסומים חדשים</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: '#378ADD' }]}>{stats.bids_today}</Text>
                <Text style={[s.statLabel, { color: theme.sub }]}>הצעות היום</Text>
              </View>
            </View>
          </>
        )}

        {/* תור אישורים */}
        {pending.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>ממתינים לאישור</Text>
              <View style={s.badge}><Text style={s.badgeText}>{pending.length}</Text></View>
            </View>
            {pending.map(item => (
              <View key={item.id} style={[s.queueItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[s.qiEmoji, { backgroundColor: theme.input }]}>
                  <Text style={{ fontSize: 24 }}>🛍️</Text>
                </View>
                <View style={s.qiInfo}>
                  <Text style={[s.qiTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[s.qiMeta, { color: theme.sub }]}>₪{item.starting_price} · {item.duration_hours}h · {item.listing_type}</Text>
                </View>
                <View style={s.qiActions}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => approve(item.id)}>
                    <Text style={s.approveBtnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => reject(item.id)}>
                    <Text style={s.rejectBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {pending.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={[s.emptyText, { color: theme.sub }]}>אין פריטים ממתינים לאישור</Text>
          </View>
        )}

        {/* כל המודעות */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 10 }]}>כל המודעות</Text>
          {listings.map(item => (
            <View key={item.id} style={[s.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={s.listItemTop}>
                <Text style={[s.listTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity
                  style={[s.statusChip, { backgroundColor: getStatusColor(item.status) + '22' }]}
                  onPress={() => editStatus(item.id, item.status)}
                >
                  <Text style={[s.statusChipText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)} ▾
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={s.listItemBottom}>
                <Text style={[s.listMeta, { color: theme.sub }]}>
                  {item.category} · ₪{item.current_bid || item.starting_price}
                  {item.reserve_price ? ` · רזרבה: ₪${item.reserve_price}` : ''}
                </Text>
                <TouchableOpacity style={s.deleteBtn} onPress={() => deleteListing(item.id, item.title)}>
                  <Text style={s.deleteBtnText}>🗑️ מחק</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

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
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '45%', borderRadius: 16, padding: 14, borderWidth: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', marginBottom: 3 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  badge: { backgroundColor: '#2A1500', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FF4D1C' },
  queueItem: { borderRadius: 16, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  qiEmoji: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qiInfo: { flex: 1 },
  qiTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  qiMeta: { fontSize: 11 },
  qiActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A2A0A', alignItems: 'center', justifyContent: 'center' },
  approveBtnText: { color: '#4CAF50', fontSize: 16, fontWeight: '700' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2A0A0A', alignItems: 'center', justifyContent: 'center' },
  rejectBtnText: { color: '#FF4D1C', fontSize: 16, fontWeight: '700' },
  emptyBox: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13 },
  listItem: { borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1 },
  listItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  listItemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listMeta: { fontSize: 12, flex: 1 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  deleteBtnText: { fontSize: 12, color: '#FF4D1C' },
});