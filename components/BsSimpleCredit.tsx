import { Image, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const BS_SIMPLE_CREDIT = 'bs-simple.com · פתרונות יצירתיים · בועז סעדה';
export const BS_SIMPLE_URL = 'https://bs-simple.com';

/** bs-simple logo + the exact credit line, linking to bs-simple.com (QA WS-09). */
export function BsSimpleCredit({ color = '#888' }: { color?: string }) {
  return (
    <TouchableOpacity
      style={s.wrap}
      onPress={() => Linking.openURL(BS_SIMPLE_URL)}
      accessibilityRole="link"
      accessibilityLabel={BS_SIMPLE_CREDIT}
      testID="bs-simple-credit"
    >
      <Image source={require('../assets/images/bs-simple-monogram.png')} style={s.logo} />
      <Text style={[s.text, { color }]}>{BS_SIMPLE_CREDIT}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 16 },
  logo: { width: 48, height: 48, marginBottom: 8, borderRadius: 10, backgroundColor: '#fff' },
  text: { fontSize: 12, textAlign: 'center', textDecorationLine: 'underline' },
});
