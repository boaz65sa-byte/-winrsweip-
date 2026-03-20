import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'נא למלא מייל וסיסמה');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            phone,
          });
        }
        Alert.alert('נרשמת בהצלחה! ✓', 'עכשיו תוכל להתחבר');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'משהו השתבש');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('שגיאה', 'הכנס את המייל שלך קודם');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'winrswipe://login',
    });
    if (error) {
      Alert.alert('שגיאה', error.message);
    } else {
      Alert.alert('נשלח! ✓', 'בדוק את המייל שלך לאיפוס סיסמה');
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'winrswipe://login',
      },
    });
    if (error) Alert.alert('שגיאה', error.message);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <View style={s.top}>
        <Text style={s.logo}>Winr<Text style={s.logoAccent}>Swipe</Text></Text>
        <Text style={s.tagline}>סוויפ. הצע. נצח.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{isRegister ? 'הרשמה' : 'התחברות'}</Text>

        {isRegister && (
          <>
            <TextInput
              style={s.input}
              placeholder="שם מלא"
              placeholderTextColor="#444"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <View style={s.phoneRow}>
              <View style={s.phonePrefix}>
                <Text style={s.phonePrefixText}>🇮🇱 +972</Text>
              </View>
              <TextInput
                style={s.phoneInput}
                placeholder="05X-XXXXXXX"
                placeholderTextColor="#444"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        <TextInput
          style={s.input}
          placeholder="מייל"
          placeholderTextColor="#444"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={s.input}
          placeholder="סיסמה (לפחות 6 תווים)"
          placeholderTextColor="#444"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleAuth} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{isRegister ? 'הרשמה ←' : 'התחברות ←'}</Text>
          }
        </TouchableOpacity>

        {!isRegister && (
          <TouchableOpacity style={s.forgotBtn} onPress={handleForgotPassword}>
            <Text style={s.forgotText}>שכחתי סיסמה</Text>
          </TouchableOpacity>
        )}

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>או</Text>
          <View style={s.dividerLine} />
        </View>

        <TouchableOpacity style={s.googleBtn} onPress={handleGoogle}>
          <Text style={s.googleIcon}>G</Text>
          <Text style={s.googleText}>המשך עם Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.switchBtn} onPress={() => setIsRegister(r => !r)}>
          <Text style={s.switchText}>
            {isRegister ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>bs-simple.com | בועז סעדה</Text>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', paddingHorizontal: 24 },
  top: { alignItems: 'center', marginBottom: 40 },
  logo: { fontWeight: '900', fontSize: 36, color: '#fff', letterSpacing: -2 },
  logoAccent: { color: '#FF4D1C' },
  tagline: { fontSize: 14, color: '#555', marginTop: 6 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2A2A2A' },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 14, padding: 14, color: '#fff', fontSize: 15, marginBottom: 12 },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  phonePrefix: { backgroundColor: '#111', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 14, padding: 14, justifyContent: 'center' },
  phonePrefixText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  phoneInput: { flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 14, padding: 14, color: '#fff', fontSize: 15 },
  btn: { backgroundColor: '#FF4D1C', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  forgotBtn: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: '#555', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#444', fontSize: 12 },
  googleBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#FF4D1C' },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { color: '#555', fontSize: 13 },
  footer: { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 40 },
});