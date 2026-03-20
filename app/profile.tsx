import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function ProfileScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhone(profileData.phone || '');
        setShippingAddress(profileData.shipping_address || '');
        setCity(profileData.city || '');
        setZipCode(profileData.zip_code || '');
      }

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (listingsData) setMyListings(listingsData);

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, listings(*)')
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (bidsData) setMyBids(bidsData);

    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveProfile = async () => {
    if (!fullName) { Alert.alert('שגיאה', 'נא למלא שם מלא'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('users').update({
        full_name: fullName,
        phone,
        shipping_address: shippingAddress,
        city,
        zip_code: zipCode,
      }).eq('id', user.id);

      Alert.alert('נשמר ✓', 'הפרופיל עודכן בהצלחה');
      setEditing(false);
      loadProfile();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    Alert.alert('התנתקות', 'האם להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FFB347';
      case 'sold': return '#378ADD';
      case 'rejected': return '#666';
      case 'expired': return '#888';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'pending': return 'ממתין';
      case 'sold': return 'נמכר';
      case 'rejected': return 'נדחה';
      case 'expired': return 'פג תוקף';
      default: return status;
    }
  };

  const totalSales = myListings.filter(l => l.status === 'sold').length;
  const totalBids = myBids.length;
  const hasShipping = profile?.shipping_address && profile?.city;

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

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor="#FF4D1C" />}
      >
        <View style={s.headerPad} />

        {!hasShipping && !editing && (
          <TouchableOpacity style={s.warningBox} onPress={() => setEditing(true)}>
            <Text style={s.warningText}>⚠️ חסרה כתובת למשלוח — הוסף כדי לזכות במכרזים</Text>
          </TouchableOpacity>
        )}

        <View style={s.avatarSection}>
          <View style={[s.avatar, { backgroundColor: '#FF4D1C' }]}>
            <Text style={s.avatarText}>
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </Text>
          </View>

          {editing ? (
            <View style={s.editFields}>
              <Text style={[s.editSection, { color: theme.sub }]}>פרטים אישיים</Text>
              <TextInput style={[s.editInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={fullName} onChangeText={setFullName} placeholder="שם מלא" placeholderTextColor={theme.sub} />
              <View style={s.phoneRow}>
                <View style={[s.phonePrefix, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Text style={{ color: theme.text, fontSize: 14 }}>🇮🇱 +972</Text>
                </View>
                <TextInput style={[s.phoneInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={phone} onChangeText={setPhone} placeholder="05X-XXXXXXX" placeholderTextColor={theme.sub} keyboardType="phone-pad" />
              </View>
              <Text style={[s.editSection, { color: theme.sub, marginTop: 8 }]}>כתובת למשלוח</Text>
              <TextInput style={[s.editInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={shippingAddress} onChangeText={setShippingAddress} placeholder="רחוב ומספר" placeholderTextColor={theme.sub} />
              <View style={s.cityRow}>
                <TextInput style={[s.editInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text, flex: 2 }]} value={city} onChangeText={setCity} placeholder="עיר" placeholderTextColor={theme.sub} />
                <TextInput style={[s.editInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text, flex: 1 }]} value={zipCode} onChangeText={setZipCode} placeholder="מיקוד" placeholderTextColor={theme.sub} keyboardType="numeric" />
              </View>
              <View style={s.editBtns}>
                <TouchableOpacity style={[s.cancelEditBtn, { borderColor: theme.border }]} onPress={() => setEditing(false)}>
                  <Text style={[s.cancelEditText, { color: theme.sub }]}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>שמור ✓</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.nameSection}>
              <Text style={[s.name, { color: theme.text }]}>{profile?.full_name || 'משתמש'}</Text>
              <Text style={[s.email, { color: theme.sub }]}>{profile?.email}</Text>
              {profile?.phone && <Text style={[s.detail, { color: theme.sub }]}>📱 {profile.phone}</Text>}
              {hasShipping && <Text style={[s.detail, { color: theme.sub }]}>📍 {profile.shipping_address}, {profile.city}</Text>}
              <TouchableOpacity style={[s.editBtn, { borderColor: theme.border }]} onPress={() => setEditing(true)}>
                <Text style={[s.editBtnText, { color: theme.sub }]}>✏️ ערוך פרופיל</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* סטטיסטיקות */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.statNum, { color: '#FF4D1C' }]}>{myListings.length}</Text>
            <Text style={[s.statLabel, { color: theme.sub }]}>פרסומים</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.statNum, { color: '#4CAF50' }]}>{totalSales}</Text>
            <Text style={[s.statLabel, { color: theme.sub }]}>מכירות</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.statNum, { color: '#378ADD' }]}>{totalBids}</Text>
            <Text style={[s.statLabel, { color: theme.sub }]}>הצעות</Text>
          </View>
        </View>

        {/* כפתורי Admin */}
        {theme.isAdmin && (
          <View style={s.adminSection}>
            <Text style={[s.adminTitle, { color: theme.sub }]}>ניהול מערכת</Text>
            <View style={s.adminBtns}>
              <TouchableOpacity
                style={[s.adminBtn, { backgroundColor: theme.card, borderColor: '#FF4D1C' }]}
                onPress={() => router.push('/admin')}
              >
                <Text style={s.adminBtnIcon}>⚙️</Text>
                <Text style={[s.adminBtnText, { color: theme.text }]}>לוח ניהול</Text>
                <Text style={[s.adminBtnSub, { color: theme.sub }]}>מודעות וסטטיסטיקות</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.adminBtn, { backgroundColor: theme.card, borderColor: '#FF4D1C' }]}
                onPress={() => router.push('/users')}
              >
                <Text style={s.adminBtnIcon}>👥</Text>
                <Text style={[s.adminBtnText, { color: theme.text }]}>משתמשים</Text>
                <Text style={[s.adminBtnSub, { color: theme.sub }]}>ניהול וחסימה</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* פרסומים */}
        {myListings.length > 0 && (
          <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>הפרסומים שלי</Text>
            {myListings.map(item => (
              <View key={item.id} style={[s.listRow, { borderBottomColor: theme.border }]}>
                <Text style={[s.listTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.listPrice, { color: '#FF4D1C' }]}>₪{item.current_bid || item.starting_price}</Text>
                  <View style={[s.minibadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                    <Text style={[s.minibadgeText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* הצעות */}
        {myBids.length > 0 && (
          <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>ההצעות שלי</Text>
            {myBids.map(item => (
              <View key={item.id} style={[s.listRow, { borderBottomColor: theme.border }]}>
                <Text style={[s.listTitle, { color: theme.text }]} numberOfLines={1}>{item.listings?.title || 'פריט'}</Text>
                <Text style={[s.listPrice, { color: '#FF4D1C' }]}>₪{item.amount}</Text>
              </View>
            ))}
          </View>
        )}

        {/* קישורים משפטיים */}
        <View style={[s.legalSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={[s.legalRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={() => router.push('/terms')}>
            <Text style={[s.legalText, { color: theme.text }]}>📄 תנאי שימוש</Text>
            <Text style={{ color: theme.sub }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.legalRow} onPress={() => router.push('/privacy')}>
            <Text style={[s.legalText, { color: theme.text }]}>🔒 מדיניות פרטיות</Text>
            <Text style={{ color: theme.sub }}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>התנתק</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  headerPad: { height: 60 },
  warningBox: { backgroundColor: '#2A1500', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FF4D1C' },
  warningText: { color: '#FF7A50', fontSize: 13, textAlign: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  nameSection: { alignItems: 'center', gap: 4 },
  name: { fontSize: 22, fontWeight: '900' },
  email: { fontSize: 13 },
  detail: { fontSize: 13 },
  editBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editBtnText: { fontSize: 13 },
  editFields: { width: '100%', gap: 8 },
  editSection: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  editInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  phonePrefix: { borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: 'center' },
  phoneInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  cityRow: { flexDirection: 'row', gap: 8 },
  editBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelEditBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelEditText: { fontWeight: '600' },
  saveBtn: { flex: 2, padding: 12, borderRadius: 12, backgroundColor: '#FF4D1C', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', marginBottom: 3 },
  statLabel: { fontSize: 11 },
  adminSection: { marginBottom: 16 },
  adminTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  adminBtns: { flexDirection: 'row', gap: 10 },
  adminBtn: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1.5, alignItems: 'center' },
  adminBtnIcon: { fontSize: 24, marginBottom: 6 },
  adminBtnText: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  adminBtnSub: { fontSize: 11 },
  section: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  listTitle: { flex: 1, fontSize: 13, marginRight: 8 },
  listPrice: { fontSize: 13, fontWeight: '700' },
  minibadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  minibadgeText: { fontSize: 10, fontWeight: '600' },
  legalSection: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  legalText: { fontSize: 14, fontWeight: '500' },
  logoutBtn: { backgroundColor: '#2A0A0A', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16 },
  logoutText: { color: '#FF4D1C', fontWeight: '700', fontSize: 15 },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים