import * as Crypto from 'expo-crypto';

export async function createAppleNonce() {
  const rawNonce = Array.from(await Crypto.getRandomBytesAsync(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  return { rawNonce, hashedNonce };
}

export function formatAuthError(error: unknown): string {
  const message =
    (error as { message?: string })?.message ||
    (typeof error === 'string' ? error : '') ||
    '';
  const lower = message.toLowerCase();

  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('network request failed') ||
    lower.includes('name or service not known')
  ) {
    return 'Could not reach the sign-in server. Check your connection and try again.\nלא ניתן להתחבר לשרת.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid_credentials')) {
    return 'Incorrect email or password.\nאימייל או סיסמה שגויים.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email, then try again.\nיש לאשר את המייל לפני ההתחברות.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'This email is already registered. Sign in instead.\nהמייל כבר רשום — התחבר/י.';
  }
  if (lower.includes('unsupported provider') || lower.includes('provider is not enabled')) {
    return 'Sign in with Apple is not enabled on the server yet. Use email and password.\nהתחברות עם Apple אינה זמינה. השתמש/י במייל וסיסמה.';
  }
  if (lower.includes('nonce')) {
    return 'Apple sign-in could not be verified. Please try again.\nאימות Apple נכשל, נסה/י שוב.';
  }
  return message || 'Something went wrong. / משהו השתבש.';
}

export function isAlreadyRegisteredError(error: unknown): boolean {
  const message = ((error as { message?: string })?.message || '').toLowerCase();
  return message.includes('already registered') || message.includes('already been registered');
}
