import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

const CATEGORIES = ['הכל', 'אופנה', 'אלקטרוניקה', 'מצלמות', 'מוזיקה', 'ספורט', 'בית וגן', 'אומנות', 'אחר'];

export default function SearchScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationMode, setLocationMode] = useState<'all' | 'near'>('all');
  const [userCity, setUserCity] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => { loadListings(); }, [selectedCategory]);

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert('נא לאפשר גישה למיקום בהגדרות'); return; }
      const loc = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(loc.coords);
      if (address?.city) setUserCity(address.city);
      setLocationMode('near');
    } catch (e) {
      alert('לא הצלחנו לקבל מיקום');
    } finally {
      setLocationLoading(false);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'הכל') {
        q = q.eq('category', selectedCategory);
      }

      const { data } = await q;
      if (data) setListings(data);
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const filtered = listings.filter(item => {
    const matchQuery = !query ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase());

    const matchLocation = locationMode === 'all' || !userCity || item.city === userCity;

    return matchQuery && matchLocation;
  });

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <Text style={[s.title, { color: theme.text }]}>חיפוש</Text>
      </View>

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[s.searchInput, { color: theme.text }]}
            placeholder="חפש מוצר, קטגוריה..."
            placeholderTextColor={theme.sub}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: theme.sub, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={s.locationRow}>
        <TouchableOpacity
          style={[s.locationBtn, { backgroundColor: theme.card, borderColor: theme.border }, locationMode === 'all' && s.locationBtnActive]}
          onPress={() => setLocationMode('all')}
        >
          <Text style={[s.locationBtnText, { color: theme.sub }, locationMode === 'all' && s.locationBtnTextActive]}>🌍 כל הארץ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.locationBtn, { backgroundColor: theme.card, borderColor: theme.border }, locationMode === 'near' && s.locationBtnActive]}
          onPress={userCity ? () => setLocationMode('near') : getLocation}
          disabled={locationLoading}
        >
          {locationLoading
            ? <ActivityIndicator color="#FF4D1C" size="small" />
            : <Text style={[s.locationBtnText, { color: theme.sub }, locationMode === 'near' && s.locationBtnTextActive]}>
                📍 {userCity && locationMode === 'near' ? userCity : 'קרוב אליי'}
              </Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.categoriesScroll}
        contentContainerStyle={s.categoriesContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.catChip, { backgroundColor: theme.card, borderColor: theme.border }, selectedCategory === cat && s.catChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[s.catChipText, { color: theme.sub }, selectedCategory === cat && s.catChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color="#FF4D1C" size="large" />
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadListings(); }} tintColor="#FF4D1C" />}
        >
          {filtered.length === 0 ? (
            <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={[s.emptyTitle, { color: theme.text }]}>לא נמצאו תוצאות</Text>
              <Text style={[s.emptySub, { color: theme.sub }]}>נסה חיפוש אחר או קטגוריה שונה</Text>
            </View>
          ) : (
            <>
              <Text style={[s.resultsCount, { color: theme.sub }]}>{filtered.length} תוצאות</Text>
              <View style={s.grid}>
                {filtered.map(item => (
                  <TouchableOpacity key={item.id} style={[s.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push({ pathname: '/listing', params: { id: item.id } })} activeOpacity={0.85}>
                    <View style={[s.gridImg, { backgroundColor: theme.dark ? '#222' : '#F0EDE8' }]}>
                      {item.images && item.images.length > 0 ? (
                        <Image source={{ uri: item.images[0] }} style={s.gridRealImg} resizeMode="cover" />
                      ) : (
                        <Text style={s.gridEmoji}>🛍️</Text>
                      )}
                      <View style={s.gridLive}>
                        <Text style={s.gridLiveText}>LIVE</Text>
                      </View>
                    </View>
                    <View style={s.gridBody}>
                      <Text style={[s.gridTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                      <Text style={[s.gridMeta, { color: theme.sub }]}>{item.category}</Text>
                      <Text style={s.gridPrice}>₪{item.current_bid || item.starting_price}</Text>
                      {item.city && (
                        <Text style={[s.gridCity, { color: theme.sub }]}>📍 {item.city}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 15 },
  locationRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  locationBtn: { flex: 1, padding: 10, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  locationBtnActive: { backgroundColor: '#FF4D1C', borderColor: '#FF4D1C' },
  locationBtnText: { fontSize: 13, fontWeight: '600' },
  locationBtnTextActive: { color: '#fff' },
  categoriesScroll: { maxHeight: 44, marginBottom: 12 },
  categoriesContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catChipActive: { backgroundColor: '#FF4D1C', borderColor: '#FF4D1C' },
  catChipText: { fontSize: 13, fontWeight: '500' },
  catChipTextActive: { color: '#fff', fontWeight: '700' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  resultsCount: { fontSize: 12, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '47%', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  gridImg: { height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gridRealImg: { width: '100%', height: '100%', position: 'absolute' },
  gridEmoji: { fontSize: 40 },
  gridLive: { position: 'absolute', top: 6, left: 6, backgroundColor: '#FF4D1C', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  gridLiveText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  gridBody: { padding: 10 },
  gridTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3, lineHeight: 18 },
  gridMeta: { fontSize: 11, marginBottom: 4 },
  gridPrice: { fontSize: 16, fontWeight: '900', color: '#FF4D1C', marginBottom: 3 },
  gridCity: { fontSize: 10 },
  emptyBox: { borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, marginTop: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 13 },
});