import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { colors, radius } from '../theme';

export default function RecentSearchesShortcut() {
  const router = useRouter();
  const { state, entries } = useRecentSearches();
  const detail = state.status === 'error' ? 'Confira seus dados salvos' : state.data ? entries.length + (entries.length === 1 ? ' busca' : ' buscas') : 'Carregando…';
  return <Pressable accessibilityRole="button" accessibilityLabel="Ver buscas recentes" onPress={() => router.push('/recent-searches')} style={styles.row}>
    <MaterialCommunityIcons name="history" size={25} color={colors.green} /><View style={styles.info}><Text style={styles.title}>Buscas recentes</Text><Text style={styles.detail}>{detail}</Text></View><MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted} />
  </Pressable>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, padding: 12, marginTop: 14, borderRadius: radius.md, backgroundColor: colors.surface },
  info: { flex: 1 }, title: { color: colors.text, fontSize: 15, fontWeight: '700' }, detail: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
