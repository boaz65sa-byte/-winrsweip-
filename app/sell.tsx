import { ResizeMode, Video } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useContext, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

const CATEGORIES = ['אופנה', 'אלקטרוניקה', 'מצלמות', 'מוזיקה', 'ספורט', 'בית וגן', 'אומנות', 'אחר'];
const CONDITIONS = ['חדש', 'כמו חדש', 'טוב', 'סביר', 'למחזר'];
const CITIES = ['תל אביב', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'רמת גן', 'בת ים', 'רחובות', 'אשקלון', 'הרצליה', 'חולון', 'כפר סבא', 'מודיעין', 'לוד', 'רמלה', 'נהריה', 'אחר'];

export default function SellScreen() {
  const theme = useContext(ThemeContext);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [duration, setDuration] = useState(24);
  const [listingType, setListingType] = useState<'auction' | 'buynow' | 'both'>('both');
  const [images, setImages] = useState<string[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const pickImage = async () => {
    Alert.alert('הוסף תמונה', 'בחר מקור', [
      { text: 'ביטול', style: 'cancel' },
      { text: '📷 צלם עכשיו', onPress: openCamera },
      { text: '🖼️ בחר מהגלריה', onPress: pickFromGallery },
    ]);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) { Alert.alert('שגיאה', 'נא לאפשר גישה למצלמה'); return; }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setShowCamera(false);
      await uploadImage(photo.uri);
    }
  };

  const pickFromGallery = async () => {
    if (images.length >= 3) { Alert.alert('מקסימום 3 תמונות'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) await uploadImage(result.assets[0].uri);
  };

  const pickVideo = async () => {
    Alert.alert('הוסף וידאו (עד 30 שניות)', 'בחר מקור', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: '🎥 צלם וידאו',
        onPress: async () => {
          if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) { Alert.alert('שגיאה', 'נא לאפשר גישה למצלמה'); return; }
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            videoMaxDuration: 30,
            quality: 0.8,
          });
          if (!result.canceled) await uploadVideo(result.assets[0].uri);
        }
      },
      {
        text: '🎬 בחר מהגלריה',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            videoMaxDuration: 30,
            quality: 0.8,
          });
          if (!result.canceled) await uploadVideo(result.assets[0].uri);
        }
      },
    ]);
  };
  const uploadImage = async (uri: string) => {
    if (images.length >= 3) { Alert.alert('מקסימום 3 תמונות'); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('listings-images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('listings-images').getPublicUrl(fileName);
      setImages(prev => [...prev, urlData.publicUrl]);
    } catch (e: any) {
      Alert.alert('שגיאה', 'לא הצלחנו להעלות את התמונה');
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (uri: string) => {
    setUploadingVideo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `${user.id}/${Date.now()}.mp4`;
      const { error } = await supabase.storage.from('listings-images').upload(fileName, arrayBuffer, { contentType: 'video/mp4' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('listings-images').getPublicUrl(fileName);
      setVideoUri(urlData.publicUrl);
      Alert.alert('וידאו הועלה ✓');
    } catch (e: any) {
      Alert.alert('שגיאה', 'לא הצלחנו להעלות את הוידאו');
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const getMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(loc.coords);
      if (address.city) setCity(address.city);
    } catch (e) {
      Alert.alert('שגיאה', 'לא הצלחנו לקבל מיקום');
    }
  };

  const publish = async () => {
    if (!title || !startingPrice) { Alert.alert('שגיאה', 'נא למלא כותרת ומחיר התחלתי'); return; }
    if (!city) { Alert.alert('שגיאה', 'נא לבחור עיר/אזור'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('שגיאה', 'התחבר קודם'); return; }

      const { error } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        category,
        condition,
        city,
        starting_price: Number(startingPrice),
        current_bid: Number(startingPrice),
        reserve_price: reservePrice ? Number(reservePrice) : null,
        buy_now_price: buyNowPrice ? Number(buyNowPrice) : null,
        duration_hours: duration,
        listing_type: listingType,
        status: 'pending',
        ends_at: new Date(Date.now() + duration * 3600000).toISOString(),
        images,
        video_url: videoUri,
      });

      if (error) throw error;
      Alert.alert('נשלח לאישור! ✓', 'הפריט ממתין לאישור מנהל');
      setTitle(''); setCategory(''); setCondition(''); setCity('');
      setStartingPrice(''); setReservePrice(''); setBuyNowPrice('');
      setImages([]); setVideoUri(null); setListingType('both');
    } catch (e: any) {
      Alert.alert('שגיאה', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={s.cameraOverlay}>
            <TouchableOpacity style={s.cameraClose} onPress={() => setShowCamera(false)}>
              <Text style={s.cameraCloseText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.captureBtn} onPress={takePicture}>
              <View style={s.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={s.header}>
        <Text style={[s.title, { color: theme.text }]}>פרסם פריט</Text>
        <Text style={[s.sub, { color: theme.sub }]}>הכסף מאובטח עד אישור קבלה</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.sub }]}>סוג פרסום</Text>
          <View style={s.typeRow}>
            {[
              { key: 'both', icon: '⚡', label: 'מכרז + קנה עכשיו' },
              { key: 'auction', icon: '🔨', label: 'מכרז בלבד' },
              { key: 'buynow', icon: '🛒', label: 'קנה עכשיו' },
            ].map(t => (
              <TouchableOpacity key={t.key} style={[s.typeBtn, listingType === t.key && s.typeBtnActive]} onPress={() => setListingType(t.key as any)}>
                <Text style={s.typeIcon}>{t.icon}</Text>
                <Text style={[s.typeText, listingType === t.key && s.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.sub }]}>תמונות (עד 3)</Text>
          <View style={s.imgRow}>
            {images.map((uri, i) => (
              <TouchableOpacity key={i} style={s.imgThumb} onPress={() => removeImage(i)}>
                <Image source={{ uri }} style={s.imgThumbImg} />
                <View style={s.imgRemove}><Text style={s.imgRemoveText}>✕</Text></View>
              </TouchableOpacity>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={[s.imgAdd, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={pickImage} disabled={uploading}>
                {uploading ? <ActivityIndicator color="#FF4D1C" size="small" /> : <>
                  <Text style={s.imgAddIcon}>📷</Text>
                  <Text style={[s.imgAddText, { color: theme.sub }]}>תמונה</Text>
                </>}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.imgAdd, { backgroundColor: theme.input, borderColor: videoUri ? '#FF4D1C' : theme.border }]}
              onPress={videoUri ? () => setVideoUri(null) : pickVideo}
              disabled={uploadingVideo}
            >
              {uploadingVideo ? <ActivityIndicator color="#FF4D1C" size="small" /> : <>
                <Text style={s.imgAddIcon}>{videoUri ? '✓' : '🎬'}</Text>
                <Text style={[s.imgAddText, { color: videoUri ? '#FF4D1C' : theme.sub }]}>
                  {videoUri ? 'וידאו ✓' : 'וידאו'}
                </Text>
              </>}
            </TouchableOpacity>
          </View>
          {videoUri && (
            <Video
              source={{ uri: videoUri }}
              style={s.videoPreview}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
          )}
        </View>

        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.sub }]}>פרטי הפריט</Text>

          <TextInput style={[s.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="כותרת הפריט" placeholderTextColor={theme.sub} value={title} onChangeText={setTitle} />

          <TouchableOpacity style={[s.select, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={() => setShowCategories(!showCategories)}>
            <Text style={category ? { color: theme.text, fontSize: 14 } : { color: theme.sub, fontSize: 14 }}>{category || 'בחר קטגוריה'}</Text>
            <Text style={{ color: theme.sub }}>{showCategories ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCategories && (
            <View style={[s.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[s.dropItem, { borderBottomColor: theme.border }]} onPress={() => { setCategory(c); setShowCategories(false); }}>
                  <Text style={[s.dropText, category === c && s.dropTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[s.select, { backgroundColor: theme.input, borderColor: theme.border, marginTop: 10 }]} onPress={() => setShowConditions(!showConditions)}>
            <Text style={condition ? { color: theme.text, fontSize: 14 } : { color: theme.sub, fontSize: 14 }}>{condition || 'בחר מצב הפריט'}</Text>
            <Text style={{ color: theme.sub }}>{showConditions ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showConditions && (
            <View style={[s.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]}>
              {CONDITIONS.map(c => (
                <TouchableOpacity key={c} style={[s.dropItem, { borderBottomColor: theme.border }]} onPress={() => { setCondition(c); setShowConditions(false); }}>
                  <Text style={[s.dropText, condition === c && s.dropTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={[s.select, { backgroundColor: theme.input, borderColor: theme.border, flex: 1 }]} onPress={() => setShowCities(!showCities)}>
              <Text style={city ? { color: theme.text, fontSize: 14 } : { color: theme.sub, fontSize: 14 }}>{city || 'בחר עיר/אזור'}</Text>
              <Text style={{ color: theme.sub }}>{showCities ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.locationAutoBtn, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={getMyLocation}>
              <Text style={{ fontSize: 18 }}>📍</Text>
            </TouchableOpacity>
          </View>
          {showCities && (
            <View style={[s.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]}>
              {CITIES.map(c => (
                <TouchableOpacity key={c} style={[s.dropItem, { borderBottomColor: theme.border }]} onPress={() => { setCity(c); setShowCities(false); }}>
                  <Text style={[s.dropText, city === c && s.dropTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.sub }]}>תמחור</Text>
          {listingType !== 'buynow' && (
            <>
              <View style={s.priceRow}>
                <View style={s.priceField}>
                  <Text style={[s.fieldLabel, { color: theme.sub }]}>מחיר התחלה (₪)</Text>
                  <TextInput style={[s.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="100" placeholderTextColor={theme.sub} keyboardType="numeric" value={startingPrice} onChangeText={setStartingPrice} />
                </View>
                <View style={s.priceField}>
                  <Text style={[s.fieldLabel, { color: theme.sub }]}>מחיר רזרבה 🔒</Text>
                  <TextInput style={[s.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="סודי" placeholderTextColor={theme.sub} keyboardType="numeric" value={reservePrice} onChangeText={setReservePrice} />
                </View>
              </View>
              <View style={[s.reserveNote, { backgroundColor: theme.dark ? '#0A1520' : '#E8F0F8' }]}>
                <Text style={[s.reserveNoteText, { color: theme.dark ? '#5B9BD5' : '#1A5FA8' }]}>🔒 מחיר הרזרבה סודי — רק אתה והמנהל רואים אותו.</Text>
              </View>
            </>
          )}
          {listingType !== 'auction' && (
            <View style={s.priceField}>
              <Text style={[s.fieldLabel, { color: theme.sub }]}>מחיר קנה עכשיו (₪)</Text>
              <TextInput style={[s.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="300" placeholderTextColor={theme.sub} keyboardType="numeric" value={buyNowPrice} onChangeText={setBuyNowPrice} />
            </View>
          )}
        </View>

        {listingType !== 'buynow' && (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.label, { color: theme.sub }]}>משך המכרז</Text>
            <View style={s.durRow}>
              {[24, 48, 72].map(d => (
                <TouchableOpacity key={d} style={[s.durBtn, { backgroundColor: theme.input, borderColor: theme.border }, duration === d && s.durBtnActive]} onPress={() => setDuration(d)}>
                  <Text style={[s.durText, { color: theme.sub }, duration === d && s.durTextActive]}>{d} שעות</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[s.escrowBox, { backgroundColor: theme.dark ? '#0A1F0A' : '#E8F5E9' }]}>
          <Text style={s.escrowIcon}>🔒</Text>
          <Text style={[s.escrowText, { color: '#4CAF50' }]}>הכסף מוחזק בנאמנות — תקבל 90% מהמחיר הסופי לאחר אישור הקונה.</Text>
        </View>

        <TouchableOpacity style={[s.publishBtn, loading && s.publishBtnDisabled]} onPress={publish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.publishText}>פרסם ←</Text>}
        </TouchableOpacity>

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
  card: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center', backgroundColor: '#111' },
  typeBtnActive: { backgroundColor: '#FF4D1C', borderColor: '#FF4D1C' },
  typeIcon: { fontSize: 18, marginBottom: 4 },
  typeText: { fontSize: 10, color: '#666', textAlign: 'center', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  imgRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  imgThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imgThumbImg: { width: 80, height: 80 },
  imgRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  imgRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  imgAdd: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  imgAddIcon: { fontSize: 22 },
  imgAddText: { fontSize: 10, marginTop: 3 },
  videoPreview: { width: '100%', height: 160, borderRadius: 12, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 10 },
  select: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationAutoBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden', marginBottom: 4 },
  dropItem: { padding: 12, borderBottomWidth: 1 },
  dropText: { color: '#888', fontSize: 14 },
  dropTextActive: { color: '#FF4D1C', fontWeight: '700' },
  priceRow: { flexDirection: 'row', gap: 10 },
  priceField: { flex: 1 },
  fieldLabel: { fontSize: 11, marginBottom: 5 },
  reserveNote: { borderRadius: 10, padding: 10, marginBottom: 10 },
  reserveNoteText: { fontSize: 11, lineHeight: 16 },
  durRow: { flexDirection: 'row', gap: 10 },
  durBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  durBtnActive: { backgroundColor: '#FF4D1C', borderColor: '#FF4D1C' },
  durText: { fontWeight: '700', fontSize: 13 },
  durTextActive: { color: '#fff' },
  escrowBox: { borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  escrowIcon: { fontSize: 18 },
  escrowText: { flex: 1, fontSize: 12, lineHeight: 18 },
  publishBtn: { backgroundColor: '#FF4D1C', borderRadius: 16, padding: 16, alignItems: 'center' },
  publishBtnDisabled: { opacity: 0.6 },
  publishText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  cameraClose: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cameraCloseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});