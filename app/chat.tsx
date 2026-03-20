import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { notifyUser } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function ChatScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const { listingId, otherUserId, otherName, listingTitle } = useLocalSearchParams<{
    listingId: string;
    otherUserId: string;
    otherName: string;
    listingTitle: string;
  }>();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.back(); return; }
    setMyId(user.id);
    await fetchMessages(user.id);
    markAsRead(user.id);
    subscribeToMessages(user.id);
    setLoading(false);
  };

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listingId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const markAsRead = async (userId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('listing_id', listingId)
      .eq('receiver_id', userId)
      .eq('read', false);
  };

  const subscribeToMessages = (userId: string) => {
    const channel = supabase
      .channel(`chat-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          if (payload.new.receiver_id === userId) {
            supabase.from('messages').update({ read: true }).eq('id', payload.new.id);
          }
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !myId) return;

    setSending(true);
    setText('');
    try {
      await supabase.from('messages').insert({
        listing_id: listingId,
        sender_id: myId,
        receiver_id: otherUserId,
        content: trimmed,
      });

      // התראה push לצד השני
      notifyUser(
        otherUserId,
        `💬 הודעה חדשה מ-SwipeBid`,
        `${trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed}`,
        { screen: `/chat`, listingId, otherUserId: myId }
      );

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.log('send error', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'היום';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'אתמול';
    return d.toLocaleDateString('he-IL');
  };

  // הוסף תוויות תאריך בין הודעות
  const messagesWithDates = () => {
    const result: any[] = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (date !== lastDate) {
        result.push({ type: 'date', label: date, id: `date-${msg.id}` });
        lastDate = date;
      }
      result.push({ ...msg, type: 'message' });
    });
    return result;
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

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={{ color: theme.text, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={[s.headerName, { color: theme.text }]} numberOfLines={1}>
            {otherName || 'שיחה'}
          </Text>
          <Text style={[s.headerSub, { color: theme.sub }]} numberOfLines={1}>
            {listingTitle || 'פריט'}
          </Text>
        </View>
        <View style={[s.onlineDot, { backgroundColor: '#4CAF50' }]} />
      </View>

      {/* הודעות */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messagesWithDates()}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>💬</Text>
              <Text style={[s.emptyTitle, { color: theme.text }]}>התחל שיחה</Text>
              <Text style={[s.emptySub, { color: theme.sub }]}>
                שאל על המוצר, תאם משלוח, דבר על פרטים
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View style={s.dateLabelWrap}>
                  <View style={[s.dateLabelLine, { backgroundColor: theme.border }]} />
                  <Text style={[s.dateLabelText, { color: theme.sub, backgroundColor: theme.bg }]}>
                    {item.label}
                  </Text>
                  <View style={[s.dateLabelLine, { backgroundColor: theme.border }]} />
                </View>
              );
            }

            const isMine = item.sender_id === myId;
            return (
              <View style={[s.msgRow, isMine ? s.msgRowMine : s.msgRowOther]}>
                <View style={[
                  s.bubble,
                  isMine
                    ? s.bubbleMine
                    : [s.bubbleOther, { backgroundColor: theme.card, borderColor: theme.border }]
                ]}>
                  <Text style={[s.bubbleText, { color: isMine ? '#fff' : theme.text }]}>
                    {item.content}
                  </Text>
                  <View style={s.msgMeta}>
                    <Text style={[s.msgTime, { color: isMine ? 'rgba(255,255,255,0.6)' : theme.sub }]}>
                      {formatTime(item.created_at)}
                    </Text>
                    {isMine && (
                      <Text style={[s.msgRead, { color: item.read ? '#4CAF50' : 'rgba(255,255,255,0.5)' }]}>
                        {item.read ? ' ✓✓' : ' ✓'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* שדה קלט */}
        <View style={[s.inputRow, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
          <View style={[s.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[s.input, { color: theme.text }]}
              placeholder="הקלד הודעה..."
              placeholderTextColor={theme.sub}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
          </View>
          <TouchableOpacity
            style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.sendBtnText}>←</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },

  // Messages
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Date label
  dateLabelWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, gap: 8 },
  dateLabelLine: { flex: 1, height: 1 },
  dateLabelText: { fontSize: 11, paddingHorizontal: 8 },

  // Bubble
  msgRow: { marginBottom: 4, maxWidth: '80%' },
  msgRowMine: { alignSelf: 'flex-end' },
  msgRowOther: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#FF4D1C', borderBottomRightRadius: 4 },
  bubbleOther: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  msgMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 3 },
  msgTime: { fontSize: 10 },
  msgRead: { fontSize: 10 },

  // Input
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 28, borderTopWidth: 1, gap: 8 },
  inputWrap: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 120 },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF4D1C', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
