import AddToPlaylistButton from '../components/AddToPlaylistButton';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { SEARCH_FILTERS, SEARCH_GROUPS } from '../services/spotifySearch.mjs';
import ApiFeedback from '../components/ApiFeedback';
import LikeTrackButton from '../components/LikeTrackButton';
import RecentSearchesShortcut from '../components/RecentSearchesShortcut';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { MAX_RECENT_TERM_LENGTH } from '../services/recentSearches.mjs';
import DemoSearchScreen from './DemoSearchScreen';
import { colors, radius } from '../theme';

const suggestions = ['Rock', 'Música brasileira', 'Jazz', 'Indie'];
const icons = { artist: 'account-music', album: 'album', track: 'music-note', playlist: 'playlist-music' };
const typeLabels = { artist: 'Artista', album: 'Álbum', track: 'Música', playlist: 'Playlist' };

export default function SearchScreen() {
  const { isDemo } = useSession();
  return isDemo ? <DemoSearchScreen /> : <SpotifySearchScreen />;
}

function SpotifySearchScreen() {
  const router = useRouter();
  const { search, state } = useSearch();
  const { rememberIfReady } = useRecentSearches();
  function submitSearch() {
    const term = search.getSnapshot().query;
    if (!term.trim()) return;
    rememberIfReady(term);
    search.retry();
  }
  function openResult(item) {
    rememberIfReady(search.getSnapshot().query);
    search.rememberEntity(item);
    router.push(item.href);
  }
  useFocusEffect(useCallback(() => {
    search.setActive(true);
    return () => search.setActive(false);
  }, [search]));
  const loading = ['debouncing', 'loading'].includes(state.status) && Boolean(state.query.trim());
  const groups = SEARCH_GROUPS.filter(group => state.groups[group.key]);
  const hasResults = groups.some(group => state.groups[group.key].items.length > 0);
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>Buscar</Text><MaterialCommunityIcons name="spotify" size={30} color={colors.green} /></View>
          <View style={styles.searchBox}>
            <Pressable accessibilityRole="button" accessibilityLabel="Confirmar busca" accessibilityState={{ disabled: !state.query.trim() }} disabled={!state.query.trim()} onPress={submitSearch} style={styles.confirmSearch}><MaterialCommunityIcons name="magnify" size={25} color={colors.black} /></Pressable>
            <TextInput accessibilityLabel="Pesquisar no Spotify" value={state.query} onChangeText={search.setQuery}
              placeholder="O que você quer ouvir?" placeholderTextColor="#555" style={styles.input}
              returnKeyType="search" autoCapitalize="none" autoCorrect={false} maxLength={MAX_RECENT_TERM_LENGTH} onSubmitEditing={submitSearch} />
            {!!state.query && <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => search.setQuery('')} style={styles.clear}><MaterialCommunityIcons name="close-circle" size={22} color="#555" /></Pressable>}
          </View>
          <RecentSearchesShortcut />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {SEARCH_FILTERS.map(filter => <Pressable key={filter.value} accessibilityRole="button" accessibilityLabel={'Filtrar ' + filter.label} accessibilityState={{ selected: state.filter === filter.value }}
              onPress={() => search.setFilter(filter.value)} style={[styles.filter, state.filter === filter.value && styles.selected]}>
              <Text style={[styles.filterText, state.filter === filter.value && styles.selectedText]}>{filter.label}</Text>
            </Pressable>)}
          </ScrollView>
          {!state.query.trim() ? (
            <View style={styles.intro}>
              <MaterialCommunityIcons name="magnify" size={58} color={colors.green} />
              <Text style={styles.introTitle}>Encontre sua próxima música</Text>
              <Text style={styles.description}>Pesquise músicas, artistas, álbuns e playlists no Spotify.</Text>
              <View style={styles.suggestions}>{suggestions.map(term => <Pressable key={term} accessibilityRole="button" onPress={() => { search.setQuery(term); rememberIfReady(term); }} style={styles.suggestion}><Text style={styles.filterText}>{term}</Text></Pressable>)}</View>
            </View>
          ) : (
            <View style={styles.results}>
              {state.status === 'paused' && <ApiFeedback message="Pesquisa interrompida." onRetry={search.retry} />}
              <ApiFeedback loading={loading} error={state.error} onRetry={search.retry} />
              {state.status === 'ready' && !hasResults && <Text accessibilityLiveRegion="polite" style={styles.empty}>Nenhum resultado para “{state.query.trim()}”. Tente outro termo.</Text>}
              {groups.map(group => {
                const result = state.groups[group.key];
                if (!result.items.length && !result.page.next) return null;
                return <View key={group.key} style={styles.section}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>{group.label}</Text>
                  {result.items.map(item => <View key={item.type + ':' + item.id} style={styles.resultEntry}><Pressable accessibilityRole="button" accessibilityLabel={'Abrir ' + typeLabels[item.type] + ' ' + item.title}
                    onPress={() => openResult(item)} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
                    {item.image ? <Image source={item.image} resizeMode="contain" style={[styles.resultImage, item.type === 'artist' && styles.artistImage]} /> : <View style={[styles.placeholder, item.type === 'artist' && styles.artistImage]}><MaterialCommunityIcons name={icons[item.type]} size={28} color={colors.muted} /></View>}
                    <View style={styles.resultInfo}><Text numberOfLines={2} style={styles.resultTitle}>{item.title}</Text><Text numberOfLines={2} style={styles.resultSub}>{item.type === 'artist' || item.type === 'playlist' ? item.subtitle : typeLabels[item.type] + ' • ' + item.subtitle}{item.duration ? ' • ' + item.duration : ''}</Text></View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
                  </Pressable>{item.type === 'track' && <LikeTrackButton track={item} />}{item.type === 'track' && <AddToPlaylistButton track={item} />}</View>)}
                  <ApiFeedback loading={result.loadingMore} error={result.error} onRetry={() => search.loadMore(group.key)} retryLabel={'Tentar carregar mais ' + group.label.toLowerCase()} />
                  {!!result.page.next && !result.loadingMore && !result.error && <Pressable accessibilityRole="button" accessibilityLabel={'Carregar mais ' + group.label.toLowerCase()} onPress={() => search.loadMore(group.key)} style={styles.more}><Text style={styles.moreText}>Carregar mais {group.label.toLowerCase()}</Text></Pressable>}
                </View>;
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 20 },
  title: { color: colors.text, fontSize: 29, fontWeight: '900' },
  searchBox: { minHeight: 54, borderRadius: radius.md, backgroundColor: colors.text, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 54, color: colors.black, fontSize: 16, fontWeight: '600', marginLeft: 8 },
  confirmSearch: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, paddingVertical: 18 },
  filter: { minHeight: 44, borderRadius: radius.pill, paddingHorizontal: 16, backgroundColor: colors.surface, justifyContent: 'center' },
  filterText: { color: colors.text, fontSize: 13, fontWeight: '600' }, selected: { backgroundColor: colors.green }, selectedText: { color: colors.black },
  intro: { alignItems: 'center', paddingVertical: 44, gap: 18 }, introTitle: { color: colors.text, fontSize: 23, fontWeight: '800', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 310 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 10 },
  suggestion: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 18, minHeight: 46, justifyContent: 'center' },
  results: { gap: 16 }, section: { gap: 10 }, sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 10 },
  resultEntry: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultRow: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 78, paddingVertical: 8, gap: 12, borderRadius: radius.md },
  resultImage: { width: 58, height: 58, backgroundColor: colors.surface }, placeholder: { width: 58, height: 58, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  artistImage: { borderRadius: 29 }, resultInfo: { flex: 1 }, resultTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  resultSub: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }, pressed: { backgroundColor: colors.surface },
  empty: { color: colors.muted, textAlign: 'center', lineHeight: 22, paddingVertical: 42 },
  more: { alignSelf: 'center', minHeight: 46, paddingHorizontal: 22, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.subtle, justifyContent: 'center', marginVertical: 8 },
  moreText: { color: colors.text, fontWeight: '700', fontSize: 13 },
});
