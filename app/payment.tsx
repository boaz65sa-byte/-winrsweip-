import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeContext } from './_layout';

export default function PaymentScreen() {
  const theme = useContext(ThemeContext);
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  const listingId = params.listingId as string;
  const amount = Number(params.amount);
  const title = params.title as string;
  const safeTradeFee = Math.round(amount * 0.02);
  const total = amount + safeTradeFee;

  const pay = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('שגיאה', 'התחבר קודם'); return; }

      const { data: sessionData } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: total * 100,
          currency: 'ils',
          listingId,
          userId: user.id,
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (error) {
        const errMsg = (data as any)?.error || error.message;
        throw new Error(errMsg);
      }
      if (!data?.clientSecret) {
        throw new Error((data as any)?.error || 'לא התקבל clientSecret מהשרת');
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'SwipeBid',
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: { email: user.email },
        appearance: {
          colors: {
            primary: '#FF4D1C',
            background: theme.dark ? '#1A1A1A' : '#FFFFFF',
            componentBackground: theme.dark ? '#2A2A2A' : '#F5F5F5',
            primaryText: theme.dark ? '#FFFFFF' : '#000000',
          }
        }
      });

      if (initError) throw initError;

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('שגיאה', paymentError.message);
        }
        return;
      }

      await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId);
      await supabase.from('escrow_transactions').upsert({
        listing_id: listingId,
        buyer_id: user.id,
        amount,
        safe_trade_fee: safeTradeFee,
        platform_fee: Math.round(amount * 0.10),
        status: 'holding',
        paid: true,
      }, { onConflict: 'listing_id' });

      Alert.alert('תשלום הצליח! 🎉', 'הכסף מוחזק בנאמנות עד קבלת הפריט.');
      router.replace('/won');

    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'משהו השתבש');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.sub }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>תשלום</Text>
      </View>

      <View style={s.content}>
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.itemTitle, { color: theme.text }]}>{title}</Text>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: theme.sub }]}>מחיר זוכה</Text>
            <Text style={[s.rowVal, { color: theme.text }]}>₪{amount}</Text>
          </View>
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: theme.sub }]}>Safe Trade Fee (2%)</Text>
            <Text style={[s.rowVal, { color: theme.text }]}>₪{safeTradeFee}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <View style={s.row}>
            <Text style={[s.totalLabel, { color: theme.text }]}>סה"כ לתשלום</Text>
            <Text style={s.totalVal}>₪{total}</Text>
          </View>
        </View>

        <View style={[s.escrowBox, { backgroundColor: theme.dark ? '#0A1F0A' : '#E8F5E9' }]}>
          <Text style={s.escrowIcon}>🔒</Text>
          <Text style={[s.escrowText, { color: '#4CAF50' }]}>
            הכסף מוחזק בנאמנות — ישוחרר למוכר רק לאחר שתאשר קבלת הפריט.
          </Text>
        </View>

        <TouchableOpacity style={[s.payBtn, loading && s.payBtnDisabled]} onPress={pay} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.payBtnText}>שלם ₪{total} ←</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  back: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: '900' },
  content: { flex: 1, paddingHorizontal: 16 },
  card: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1 },
  itemTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  divider: { height: 1, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14 },
  rowVal: { fontSize: 14, fontWeight: '500' },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#FF4D1C' },
  escrowBox: { borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-start' },
  escrowIcon: { fontSize: 18 },
  escrowText: { flex: 1, fontSize: 12, lineHeight: 18 },
  payBtn: { backgroundColor: '#FF4D1C', borderRadius: 16, padding: 18, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});