import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SpotifyApiError } from '../services/spotifyErrors.mjs';
import { getApiRecovery } from '../services/apiRecovery.mjs';
import { useRouter } from 'expo-router';
import { useSession } from '../contexts/SessionContext';
import { colors, radius } from '../theme';

export default function ApiFeedback({ loading = false, error, message, onRetry, retryLabel = 'Tentar novamente' }) {
  const router = useRouter();
  const { session, isDemo } = useSession();
  const [now, setNow] = useState(Date.now);
  const retryAt = error instanceof SpotifyApiError ? error.retryAt : null;
  useEffect(() => {
    if (!retryAt) return undefined;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAt) clearInterval(timer);
    };
    const initial = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [retryAt]);
  if (!loading && !error && !message) return null;
  const { seconds, retryAllowed, message: errorMessage, showLocalLibrary } = getApiRecovery(error, now);
  const canRetry = Boolean(onRetry) && !loading && seconds === 0 && retryAllowed;
  return (
    <View style={styles.container}>
      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.green} /><Text style={styles.text}>Carregando…</Text></View> : (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message || errorMessage}</Text>
      )}
      {!loading && showLocalLibrary && !!session && !isDemo && <Pressable accessibilityRole="button" accessibilityLabel="Abrir Biblioteca local" onPress={() => router.dismissTo('/library')} style={styles.local}><Text style={styles.localText}>Abrir Biblioteca local</Text></Pressable>}
      {seconds > 0 && <Text accessibilityLiveRegion="polite" style={styles.detail}>Tente novamente em {seconds}s.</Text>}
      {!!onRetry && !loading && retryAllowed && (
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canRetry }} disabled={!canRetry} onPress={onRetry} style={[styles.button, !canRetry && styles.disabled]}>
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, padding: 14, borderRadius: radius.md, gap: 12 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { color: colors.text, fontSize: 13, lineHeight: 20 },
  detail: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  button: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.green },
  buttonText: { color: colors.black, fontWeight: '700' },
  local: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.muted },
  localText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
