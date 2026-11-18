import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLikedTracks } from '../hooks/useLikedTracks';
import { colors, radius } from '../theme';

export default function LikedTracksShortcut() {
  const router = useRouter();
  const { state, entries } = useLikedTracks();
  const subtitle = state.status === 'error' ? 'Confira seus dados salvos' : state.data ? entries.length + (entries.length === 1 ? ' música salva neste aparelho' : ' músicas salvas neste aparelho') : 'Carregando suas músicas…';
  return <Pressable accessibilityRole="button" accessibilityLabel="Abrir músicas curtidas" onPress={() => router.push('/liked')} style={styles.row}>
    <LinearGradient colors={['#4C22A9', '#97B9A8']} style={styles.icon}><MaterialCommunityIcons name="heart" size={26} color={colors.text} /></LinearGradient>
    <View style={styles.info}><Text style={styles.title}>Músicas curtidas</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
  </Pressable>;
}
const styles = StyleSheet.create({
  row: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: radius.md, marginBottom: 12 },
  icon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm }, info: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
