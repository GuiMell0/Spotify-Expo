import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import { useSearch } from '../contexts/SearchContext';
import { useSession } from '../contexts/SessionContext';
import { useRecentSearches } from '../hooks/useRecentSearches';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';

export default function RecentSearchesScreen() {
  const router = useRouter();
  const { search } = useSearch();
  const { isDemo, signOut } = useSession();
  const { localData, state, entries, remove, clear, rememberIfReady } = useRecentSearches();
  const [clearFor, setClearFor] = useState(null);
  const confirming = clearFor === localData;
  const canChange = state.status === 'ready';
  const saving = state.status === 'saving';
  function open(term) {
    rememberIfReady(term);
    search.setFilter('all');
    search.setQuery(term);
    search.retry();
    router.navigate('/search');
  }
  async function removeOne(term) {
    if (!canChange) return;
    try { await remove(term); } catch { /* A12 apresenta o erro e a recuperação. */ }
  }
  async function confirmClear() {
    if (!canChange) return;
    try { await clear(); setClearFor(null); } catch { /* A lista confirmada permanece visível. */ }
  }
  function empty() {
    if (isDemo || state.status === 'disabled') return <View style={styles.empty}><Text style={styles.emptyTitle}>Seu histórico começa com sua conta</Text><Text style={styles.description}>Entre com Spotify para guardar suas buscas neste aparelho.</Text><Pressable accessibilityRole="button" onPress={signOut} style={styles.action}><Text style={styles.actionText}>Ir para o login</Text></Pressable></View>;
    if (['idle', 'loading'].includes(state.status)) return <View style={styles.empty}><ActivityIndicator color={colors.green} /><Text style={styles.description}>Carregando suas buscas…</Text></View>;
    if (state.status === 'error') return <View style={styles.empty}><Text style={styles.description}>Não foi possível carregar o histórico. Use Tentar novamente no aviso acima.</Text></View>;
    return <View style={styles.empty}><MaterialCommunityIcons name="history" size={54} color={colors.muted} /><Text style={styles.emptyTitle}>Nenhuma busca recente</Text><Text style={styles.description}>Confirme uma busca ou abra um resultado para guardar o termo.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/search')} style={styles.action}><Text style={styles.actionText}>Buscar músicas</Text></Pressable></View>;
  }
  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <FlatList keyboardDismissMode="on-drag" data={entries} keyExtractor={item => item.term.toLowerCase()} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={styles.header}>
        <View style={styles.topbar}><BackButton style={styles.back} /><MaterialCommunityIcons name="spotify" size={27} color={colors.green} /></View>
        <Text accessibilityRole="header" style={styles.title}>Buscas recentes</Text>
        <Text style={styles.description}>Histórico desta conta, salvo neste aparelho</Text>
        <Text style={styles.description}>Até 20 termos, dos mais recentes para os mais antigos.</Text>
        {state.data && <Text accessibilityLiveRegion="polite" style={styles.count}>{entries.length} {entries.length === 1 ? 'busca salva' : 'buscas salvas'}</Text>}
        {saving && <Text accessibilityLiveRegion="polite" style={styles.description}>Salvando alteração…</Text>}
        {!!entries.length && !confirming && <Pressable accessibilityRole="button" accessibilityLabel="Limpar buscas recentes" accessibilityState={{ disabled: !canChange }} disabled={!canChange} onPress={() => setClearFor(localData)} style={[styles.secondary, !canChange && styles.disabled]}><Text style={styles.secondaryText}>Limpar histórico</Text></Pressable>}
        {confirming && <View style={styles.confirmation}><Text accessibilityRole="header" style={styles.confirmTitle}>Limpar todas as buscas recentes?</Text><Text style={styles.description}>Os termos salvos nesta conta e neste aparelho serão removidos.</Text><View style={styles.confirmActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar limpeza do histórico" disabled={saving} onPress={() => setClearFor(null)} style={[styles.secondary, saving && styles.disabled]}><Text style={styles.secondaryText}>Cancelar</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Confirmar limpeza do histórico" accessibilityState={{ disabled: !canChange }} disabled={!canChange} onPress={confirmClear} style={[styles.action, !canChange && styles.disabled]}><Text style={styles.actionText}>Limpar histórico</Text></Pressable>
        </View></View>}
        {state.status === 'error' && entries.length > 0 && <Text style={styles.description}>Esta é a última lista carregada. Recarregue os dados pelo aviso acima.</Text>}
      </View>}
      ListEmptyComponent={empty}
      renderItem={({ item }) => <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel={'Pesquisar novamente ' + item.term} onPress={() => open(item.term)} style={({ pressed }) => [styles.open, pressed && styles.pressed]}><MaterialCommunityIcons name="history" size={23} color={colors.muted} /><Text numberOfLines={2} style={styles.term}>{item.term}</Text><MaterialCommunityIcons name="arrow-top-left" size={22} color={colors.muted} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={'Remover busca ' + item.term} accessibilityState={{ disabled: !canChange }} disabled={!canChange} onPress={() => removeOne(item.term)} style={[styles.remove, !canChange && styles.disabled]}><MaterialCommunityIcons name="close" size={22} color={colors.muted} /></Pressable>
      </View>}
    />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 30 },
  header: { paddingTop: 8, paddingBottom: 20, gap: 14 }, topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 44, height: 44 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' }, description: { color: colors.muted, fontSize: 14, lineHeight: 22 }, count: { color: colors.text, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 70, paddingVertical: 12, borderRadius: radius.sm },
  term: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '600' }, remove: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: colors.surface }, disabled: { opacity: 0.5 }, confirmation: { padding: 16, gap: 14, borderRadius: radius.md, backgroundColor: colors.surface },
  confirmTitle: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '800' }, confirmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  secondary: { minHeight: 46, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 18, borderWidth: 1, borderColor: colors.subtle, borderRadius: radius.pill },
  secondaryText: { color: colors.text, fontWeight: '700', fontSize: 14 }, action: { minHeight: 46, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: colors.green, borderRadius: radius.pill },
  actionText: { color: colors.black, fontWeight: '800', fontSize: 14 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 32 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 29, textAlign: 'center' },
});
