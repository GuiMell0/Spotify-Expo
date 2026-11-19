import { displayNameForAccount } from '../services/localDisplayName.mjs';
import { createSpotifyLibrary } from '../services/spotifyLibrary.mjs';
import SpotifyLibraryPlaylists from '../components/SpotifyLibraryPlaylists';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LikedTracksShortcut from '../components/LikedTracksShortcut';
import RecentSearchesShortcut from '../components/RecentSearchesShortcut';
import { useLocalData } from '../contexts/LocalDataContext';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { LIBRARY_FILTERS, listLibraryItems, saveLibraryPreference } from '../services/library.mjs';
import DemoLibraryScreen from './DemoLibraryScreen';
import { colors, radius } from '../theme';

export default function LibraryScreen() {
  const { isDemo } = useSession();
  return isDemo ? <DemoLibraryScreen /> : <SavedLibraryScreen />;
}

function SavedLibraryScreen() {
  const router = useRouter();
  const { session, catalog } = useSession();
  const scope = session?.user.id;
  const spotifyLibrary = useMemo(() => createSpotifyLibrary(catalog, { scope }), [catalog, scope]);
  useEffect(() => () => spotifyLibrary.suspend(), [spotifyLibrary]);
  const { search } = useSearch();
  const { rememberIfReady } = useRecentSearches();
  const { localData, state } = useLocalData();
  const [filter, setFilter] = useState('all');
  const view = state.data?.preferences.libraryView ?? 'grid';
  const sort = state.data?.preferences.librarySort ?? 'recent';
  const entries = useMemo(() => listLibraryItems(state.data, { filter, sort }), [state.data, filter, sort]);
  const loading = ['idle', 'loading'].includes(state.status);
  const canSave = state.status === 'ready';
  const initial = Array.from(displayNameForAccount(state.data, session?.user.displayName || session?.user.id || 'Spotify').trim())[0]?.toLocaleUpperCase() || '♪';

  function preference(key, value) {
    if (localData.getSnapshot().status !== 'ready') return;
    saveLibraryPreference(localData, key, value).catch(() => { /* O aviso global preserva os dados e oferece nova leitura. */ });
  }
  function open(item) {
    if (item.type === 'track') {
      search.rememberEntity(item.track);
      router.push(item.track.href);
    } else if (item.type === 'local-playlist') {
      if (item.href) router.push(item.href);
    } else if (item.type === 'local-artist') {
      search.rememberEntity(item.artist);
      router.push(item.href);
    } else if (item.type === 'search') {
      rememberIfReady(item.term);
      search.setFilter('all');
      search.setQuery(item.term);
      search.retry();
      router.navigate('/search');
    }
  }
  function empty() {
    if (loading) return <View style={styles.empty}><ActivityIndicator color={colors.green} /><Text style={styles.description}>Carregando sua biblioteca…</Text></View>;
    if (state.status === 'error') return <View style={styles.empty}><Text style={styles.description}>Não foi possível carregar sua biblioteca. Use Tentar novamente no aviso acima.</Text></View>;
    const title = filter === 'tracks' ? 'Nenhuma música curtida' : filter === 'searches' ? 'Nenhuma busca recente' : filter === 'artists' ? 'Nenhum artista acompanhado' : filter === 'playlists' ? 'Nenhuma playlist local' : 'Nenhum item local salvo';
    return <View style={styles.empty}><MaterialCommunityIcons name="bookshelf" size={48} color={colors.muted} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>Crie uma playlist ou busque no Spotify e curta suas músicas. Seus dados ficam salvos neste aparelho.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/search')} style={styles.action}><Text style={styles.actionText}>Buscar músicas</Text></Pressable></View>;
  }

  return <View style={styles.root}><SafeAreaView style={styles.safe} edges={['top']}>
    <FlatList key={view} data={entries} numColumns={view === 'grid' ? 2 : 1} keyExtractor={item => item.key}
      contentContainerStyle={styles.content} columnWrapperStyle={view === 'grid' ? styles.columns : undefined}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={styles.header}>
        <View style={styles.topbar}><Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')} style={styles.avatar}>{session?.user.imageUrl ? <Image source={{ uri: session.user.imageUrl }} style={styles.avatarImage} /> : <Text style={styles.initial}>{initial}</Text>}</Pressable><Text accessibilityRole="header" style={styles.title}>Sua Biblioteca</Text><Pressable accessibilityRole="button" accessibilityLabel="Buscar no Spotify" onPress={() => router.navigate('/search')} style={styles.iconButton}><MaterialCommunityIcons name="magnify" size={26} color={colors.text} /></Pressable></View>
        <Text style={styles.description}>Suas músicas, playlists e buscas neste aparelho</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Criar playlist local" accessibilityState={{ disabled: !canSave }} disabled={!canSave} onPress={() => router.push('/local-playlist/new')} style={[styles.create, !canSave && styles.disabled]}><MaterialCommunityIcons name="plus" size={23} color={colors.black} /><Text style={styles.createText}>Criar playlist</Text></Pressable>
        <View style={styles.shortcuts}><LikedTracksShortcut /><RecentSearchesShortcut /></View>
        <View style={styles.filters}>{LIBRARY_FILTERS.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'Filtrar biblioteca: ' + item.label} accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)} style={[styles.chip, filter === item.id && styles.selected]}><Text style={[styles.chipText, filter === item.id && styles.selectedText]}>{item.label}</Text></Pressable>)}</View>
        <View style={styles.toolbar}><Pressable accessibilityRole="button" accessibilityLabel={'Ordenar biblioteca por ' + (sort === 'recent' ? 'título' : 'recentes')} accessibilityState={{ disabled: !canSave }} disabled={!canSave} onPress={() => preference('librarySort', sort === 'recent' ? 'title' : 'recent')} style={[styles.sortButton, !canSave && styles.disabled]}><MaterialCommunityIcons name="swap-vertical" size={23} color={colors.text} /><Text style={styles.sortText}>{sort === 'recent' ? 'Recentes' : 'Título'}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={'Visualizar biblioteca em ' + (view === 'grid' ? 'lista' : 'grade')} accessibilityState={{ disabled: !canSave }} disabled={!canSave} onPress={() => preference('libraryView', view === 'grid' ? 'list' : 'grid')} style={[styles.iconButton, !canSave && styles.disabled]}><MaterialCommunityIcons name={view === 'grid' ? 'view-list' : 'view-grid-outline'} size={25} color={colors.text} /></Pressable></View>
        {state.data && <Text accessibilityLiveRegion="polite" style={styles.count}>{entries.length} {entries.length === 1 ? 'item' : 'itens'}</Text>}
        {state.status === 'saving' && <Text accessibilityLiveRegion="polite" style={styles.description}>Salvando dados…</Text>}
        {state.status === 'error' && entries.length > 0 && <Text style={styles.description}>Esta é a última biblioteca carregada. Recarregue os dados pelo aviso acima.</Text>}
      </View>}
      ListFooterComponent={<SpotifyLibraryPlaylists controller={spotifyLibrary} visible={filter==='all'||filter==='playlists'} view={view} sort={sort}/>}
      ListEmptyComponent={empty}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={(item.type === 'track' ? 'Abrir música da biblioteca ' : item.type === 'local-playlist' ? 'Abrir playlist local ' : item.type === 'local-artist' ? 'Abrir artista acompanhado ' : 'Repetir busca da biblioteca ') + item.title} accessibilityState={{ disabled: item.type === 'local-playlist' && !item.href }} disabled={item.type === 'local-playlist' && !item.href} onPress={() => open(item)} style={({ pressed }) => [styles.item, view === 'grid' ? styles.gridItem : styles.listItem, pressed && styles.pressed]}><LibraryItemContent item={item} /></Pressable>}

    />
  </SafeAreaView></View>;
}

function LibraryItemContent({ item }) {
  return <>{item.image ? <Image source={item.image} resizeMode="contain" style={styles.art} /> : <View style={[styles.art, styles.placeholder]}><MaterialCommunityIcons name={item.type === 'track' ? 'music-note' : item.type === 'local-playlist' ? 'playlist-music' : item.type === 'local-artist' ? 'account-music' : 'history'} size={30} color={item.type === 'track' ? colors.green : colors.muted} /></View>}<View style={styles.info}><Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text><Text numberOfLines={2} style={styles.subtitle}>{item.subtitle}</Text></View></>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 32 }, header: { gap: 12, paddingBottom: 14 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flex: 1, color: colors.text, fontSize: 23, fontWeight: '900' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 44, height: 44 }, initial: { color: colors.black, fontSize: 19, fontWeight: '800' },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20 }, shortcuts: { paddingVertical: 4 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: colors.surfaceLight, borderRadius: radius.pill },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' }, selected: { backgroundColor: colors.green }, selectedText: { color: colors.black },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 16 }, sortText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  count: { color: colors.muted, fontSize: 12 }, disabled: { opacity: 0.5 }, columns: { justifyContent: 'space-between' },
  item: { borderRadius: radius.md, gap: 12, marginBottom: 12 }, gridItem: { width: '48.5%', minHeight: 188, padding: 12, backgroundColor: colors.backgroundSoft },
  listItem: { minHeight: 88, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }, pressed: { backgroundColor: colors.surface },
  art: { width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.surface }, placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 5 }, itemTitle: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 16 },
  emptyTitle: { color: colors.text, fontSize: 21, fontWeight: '800', textAlign: 'center' }, emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  action: { minHeight: 48, paddingHorizontal: 24, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.green },
  create: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.green, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createText: { color: colors.black, fontSize: 14, fontWeight: '800' },
  actionText: { color: colors.black, fontSize: 14, fontWeight: '800' },
});
