import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function UsersScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();

  useEffect(() => {
    if (theme.user !== null && !theme.isAdmin) router.replace('/');
  }, [theme.isAdmin, theme.user]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setUsers(data);
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadUsers(); };

  const banUser = async (user: any) => {
    const action = user.is_banned ? 'לשחרר' : 'לחסום';
    Alert.alert(
      `${action} משתמש`,
      `${action} את ${user.full_name || user.email}?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: action,
          style: user.is_banned ? 'default' : 'destructive',
          onPress: async () => {
            await supabase
              .from('users')
              .update({ is_banned: !user.is_banned })
              .eq('id', user.id);
            Alert.alert(user.is_banned ? 'שוחרר ✓' : 'נחסם ✓');
            loadUsers();
          }
        }
      ]
    );
  };

  const verifyUser = async (user: any) => {
    await supabase
      .from('users')
      .update({ is_verified: !user.is_verified })
      .eq('id', user.id);
    loadUsers();
  };

  const viewUserListings = async (user: any) => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id);

    if (!data || data.length === 0) {
      Alert.alert('אין פרסומים', `ל-${user.full_name || user.email} אין פרסומים`);
      return;
    }

    const list = data.map(l => `• ${l.title} — ₪${l.current_bid || l.starting_price} (${l.status})`).join('\n');
    Alert.alert(`פרסומי ${user.full_name || 'משתמש'}`, list);
  };

  const addNote = async (user: any) => {
    Alert.prompt(
      'הוסף הערה',
      `הערה על ${user.full_name || user.email}`,
      async (note) => {
        if (note) {
          await supabase.from('users').update({ notes: note }).eq('id', user.id);
          loadUsers();
        }
      },
      'plain-text',
      user.notes || ''
    );
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

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
        <Text style={[s.title, { color: theme.text }]}>משתמשים</Text>
        <Text style={[s.sub, { color: theme.sub }]}>{users.length} רשומים</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={[s.searchInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="חפש לפי שם, מייל או טלפון..."
          placeholderTextColor={theme.sub}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4D1C" />}
      >
        {filtered.map(user => (
          <View key={user.id} style={[s.userCard, { backgroundColor: theme.card, borderColor: user.is_banned ? '#FF4D1C' : theme.border }]}>

            <View style={s.userTop}>
              <View style={[s.avatar, { backgroundColor: user.is_banned ? '#2A0A0A' : '#FF4D1C22' }]}>
                <Text style={[s.avatarText, { color: user.is_banned ? '#FF4D1C' : '#FF4D1C' }]}>
                  {(user.full_name || user.email || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={s.userInfo}>
                <View style={s.nameRow}>
                  <Text style={[s.userName, { color: theme.text }]} numberOfLines={1}>
                    {user.full_name || 'ללא שם'}
                  </Text>
                  {user.is_verified && <Text style={s.verifiedBadge}>✓ מאומת</Text>}
                  {user.is_banned && <Text style={s.bannedBadge}>🚫 חסום</Text>}
                </View>
                <Text style={[s.userEmail, { color: theme.sub }]} numberOfLines={1}>{user.email}</Text>
                {user.phone && <Text style={[s.userPhone, { color: theme.sub }]}>📱 {user.phone}</Text>}
                {user.city && <Text style={[s.userPhone, { color: theme.sub }]}>📍 {user.city}</Text>}
                {user.notes && (
                  <View style={[s.noteBox, { backgroundColor: theme.input }]}>
                    <Text style={[s.noteText, { color: theme.sub }]}>📝 {user.notes}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[s.divider, { backgroundColor: theme.border }]} />

            <View style={s.actions}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#0A2A0A' }]} onPress={() => viewUserListings(user)}>
                <Text style={[s.actionText, { color: '#4CAF50' }]}>📦 פרסומים</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: user.is_verified ? '#1A1A00' : '#0A1520' }]} onPress={() => verifyUser(user)}>
                <Text style={[s.actionText, { color: user.is_verified ? '#FFB347' : '#378ADD' }]}>
                  {user.is_verified ? '✓ מאומת' : '◯ אמת'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.input }]} onPress={() => addNote(user)}>
                <Text style={[s.actionText, { color: theme.sub }]}>📝 הערה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: user.is_banned ? '#0A2A0A' : '#2A0A0A' }]} onPress={() => banUser(user)}>
                <Text style={[s.actionText, { color: user.is_banned ? '#4CAF50' : '#FF4D1C' }]}>
                  {user.is_banned ? '✓ שחרר' : '🚫 חסום'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={[s.emptyText, { color: theme.sub }]}>לא נמצאו משתמשים</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  sub: { fontSize: 12, marginTop: 3 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchInput: { borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  userCard: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  userTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontWeight: '900' },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontWeight: '700' },
  verifiedBadge: { fontSize: 10, color: '#4CAF50', backgroundColor: '#0A2A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  bannedBadge: { fontSize: 10, color: '#FF4D1C', backgroundColor: '#2A0A0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  userEmail: { fontSize: 12, marginBottom: 2 },
  userPhone: { fontSize: 12 },
  noteBox: { borderRadius: 8, padding: 6, marginTop: 6 },
  noteText: { fontSize: 11 },
  divider: { height: 1, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: '22%', padding: 8, borderRadius: 10, alignItems: 'center' },
  actionText: { fontSize: 11, fontWeight: '600' },
  emptyBox: { borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13 },
});