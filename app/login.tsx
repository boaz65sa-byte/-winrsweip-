import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createAppleNonce, formatAuthError, isAlreadyRegisteredError } from '../lib/auth';
import { supabase } from '../lib/supabase';

async function ensurePublicUserRow(params: {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
}) {
  try {
    await supabase.from('users').upsert({
      id: params.id,
      email: params.email ?? null,
      ...(params.full_name ? { full_name: params.full_name } : {}),
      ...(params.phone ? { phone: params.phone } : {}),
    }, { ignoreDuplicates: true });
  } catch {
    // Never block sign-in if the profile row already exists or RLS denies the upsert.
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(Platform.OS === 'ios');
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const finishSignedIn = async (user?: { id: string; email?: string | null } | null, extras?: { full_name?: string | null; phone?: string | null }) => {
    if (user) {
      await ensurePublicUserRow({
        id: user.id,
        email: user.email,
        full_name: extras?.full_name,
        phone: extras?.phone,
      });
    }
    router.replace('/');
  };

  const signInWithPassword = async (trimmedEmail: string, trimmedPassword: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    if (error) throw error;
    await finishSignedIn(data.user);
  };

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error / שגיאה', 'Please enter email and password.\nנא למלא מייל וסיסמה');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: trimmedName || undefined,
              ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            },
          },
        });
        if (error && isAlreadyRegisteredError(error)) {
          await signInWithPassword(trimmedEmail, trimmedPassword);
          return;
        }
        if (error) throw error;
        if (data.session) {
          await finishSignedIn(data.user, {
            full_name: trimmedName || null,
            phone: trimmedPhone || null,
          });
          return;
        }
        Alert.alert(
          'Check your email / נרשמת',
          'If confirmation is required, open the email we sent, then sign in.\nאם נדרש אישור — בדוק/י את המייל ואז התחבר/י.',
        );
        setIsRegister(false);
      } else {
        await signInWithPassword(trimmedEmail, trimmedPassword);
      }
    } catch (e: any) {
      Alert.alert('Sign-in failed / שגיאה', formatAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Error / שגיאה', 'Enter your email first.\nהכנס את המייל שלך קודם');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: 'winrswipe://login',
    });
    if (error) {
      Alert.alert('Error / שגיאה', formatAuthError(error));
    } else {
      Alert.alert('Sent / נשלח! ✓', 'Check your email to reset your password.\nבדוק את המייל שלך לאיפוס סיסמה');
    }
  };

  const handleApple = async () => {
    try {
      // Native iOS: Apple receives the SHA-256 hex nonce, Supabase receives the raw nonce.
      // The identity token audience is the bundle ID, so the Apple provider Client IDs
      // field must include com.winrswipe.app. No Services ID is required for this native flow.
      const { rawNonce, hashedNonce } = await createAppleNonce();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        Alert.alert('Sign-in failed / שגיאה', 'Apple did not return an identity token.\nלא התקבל אישור מ-Apple');
        return;
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (error) throw error;

      // Apple only returns the name on the very first sign-in ever.
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
        : null;
      if (name && data.user) {
        await supabase.auth.updateUser({ data: { full_name: name } });
        await supabase.from('users').update({ full_name: name }).eq('id', data.user.id);
      }

      await finishSignedIn(data.user, { full_name: name || null });
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Sign-in failed / שגיאה', formatAuthError(e));
    }
  };

  const handleGoogle = async () => {
    const redirectUrl = 'winrswipe://login';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url) {
      Alert.alert('Sign-in failed / שגיאה', formatAuthError(error) || 'Could not start Google sign-in.');
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const hashParams = new URLSearchParams(result.url.split('#')[1] ?? '');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (!sessionError) router.replace('/');
        else Alert.alert('Sign-in failed / שגיאה', formatAuthError(sessionError));
      }
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <View style={s.top}>
        <Text style={s.logo}>Winr<Text style={s.logoAccent}>Swipe</Text></Text>
        <Text style={s.tagline}>Swipe. Bid. Win. · סוויפ. הצע. נצח.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{isRegister ? 'Create account / הרשמה' : 'Sign in / התחברות'}</Text>
        <Text style={s.cardHint}>
          {isRegister
            ? 'Email and password only. Phone is optional.'
            : 'Use email & password or Sign in with Apple.'}
        </Text>

        {isRegister && (
          <>
            <TextInput
              style={s.input}
              placeholder="Full name (optional) / שם מלא (לא חובה)"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <Text style={s.optionalLabel}>Phone (optional) · טלפון (לא חובה)</Text>
            <Text style={s.optionalHint}>Not required to create an account. You can skip this field.</Text>
            <TextInput
              style={s.input}
              placeholder="050-0000000"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          </>
        )}

        <TextInput
          style={s.input}
          placeholder="Email / מייל"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
        />

        <TextInput
          style={s.input}
          placeholder="Password (min 6) / סיסמה"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleAuth} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{isRegister ? 'Create account / הרשמה ←' : 'Sign in / התחברות ←'}</Text>
          }
        </TouchableOpacity>

        {!isRegister && (
          <TouchableOpacity style={s.forgotBtn} onPress={handleForgotPassword}>
            <Text style={s.forgotText}>Forgot password / שכחתי סיסמה</Text>
          </TouchableOpacity>
        )}

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or / או</Text>
          <View style={s.dividerLine} />
        </View>

        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={14}
            style={s.appleBtn}
            onPress={handleApple}
          />
        )}

        <TouchableOpacity style={s.googleBtn} onPress={handleGoogle}>
          <Text style={s.googleIcon}>G</Text>
          <Text style={s.googleText}>Continue with Google / המשך עם Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.switchBtn} onPress={() => setIsRegister(r => !r)}>
          <Text style={s.switchText}>
            {isRegister ? 'Already have an account? Sign in / כבר יש לך חשבון? התחבר' : 'No account? Create one / אין לך חשבון? הירשם'}
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
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
  cardHint: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20 },
  optionalLabel: { fontSize: 13, fontWeight: '700', color: '#ccc', marginBottom: 4 },
  optionalHint: { fontSize: 12, color: '#888', marginBottom: 8 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 14, padding: 14, color: '#fff', fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#FF4D1C', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  forgotBtn: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: '#888', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#666', fontSize: 12 },
  appleBtn: { width: '100%', height: 48, marginBottom: 12 },
  googleBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#FF4D1C' },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { color: '#888', fontSize: 13, textAlign: 'center' },
  footer: { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 40 },
});
