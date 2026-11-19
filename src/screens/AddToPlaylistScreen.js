import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { isSpotifyId } from '../services/spotifyModels.mjs';
import { savePlaylistTrack } from '../services/playlistTracks.mjs';
import { listLocalPlaylists } from '../services/localPlaylists.mjs';
import { localPlaylistHref } from '../services/localPlaylistDetails.mjs';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';
export default function AddToPlaylistScreen() {
  const { trackId } = useLocalSearchParams();
  const { catalog, isDemo } = useSession();
  const { search } = useSearch();
  const { localData, state } = useLocalData();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(null);
  const [saved, setSaved] = useState(null);
  const valid = isSpotifyId(trackId);
  const identity = useMemo(() => ({ catalog, trackId, attempt, localData }), [catalog, trackId, attempt, localData]);
  const cached = valid && !isDemo ? search.getEntity('track', trackId) ?? state.data?.likedTracks.find(item => item.track.id === trackId)?.track ?? state.data?.playlists.flatMap(item => item.tracks).find(item => item.id === trackId) : null;
  useEffect(() => {
    if (!valid || isDemo || cached) return undefined;
    const controller = new AbortController();
    catalog.getTrack(trackId, { signal: controller.signal }).then(track => { if (!controller.signal.aborted) setLoaded({ identity, track }); }).catch(error => { if (!controller.signal.aborted) setLoaded({ identity, error }); });
    return () => controller.abort();
  }, [valid, isDemo, cached, catalog, trackId, identity]);
  const current = loaded?.identity === identity ? loaded : null;
  const track = cached || current?.track;
  const playlists = isDemo ? [] : listLocalPlaylists(state.data);
  const ready = state.status === 'ready' && !!track;
  async function add(playlist) {
    if (localData.getSnapshot().status !== 'ready' || !track) return;
    try {
      await savePlaylistTrack(localData, playlist.id, track);
      setSaved({ owner: localData, trackId, playlistId: playlist.id });
    } catch { /* O aviso global preserva os dados e permite nova leitura. */ }
  }
  const confirmed = saved?.owner === localData && saved.trackId === trackId && state.data?.playlists.find(item => item.id === saved.playlistId && item.tracks.some(value => value.id === trackId));
  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><FlatList data={track ? playlists : []} keyExtractor={item => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<View style={styles.header}><BackButton style={styles.back} /><Text accessibilityRole="header" style={styles.title}>Adicionar à playlist</Text><Text style={styles.description}>Escolha uma playlist local deste aparelho.</Text>
      {isDemo ? <Text style={styles.description}>Entre com Spotify para usar suas playlists pessoais.</Text> : !valid ? <Text accessibilityRole="alert" style={styles.description}>Música inválida. Abra uma faixa pela busca.</Text> : <><ApiFeedback loading={!track && !current?.error} error={current?.error} onRetry={() => setAttempt(value => value + 1)} />{track && <Text style={styles.track}>{track.title} · {track.artist}</Text>}</>}
      {['idle', 'loading'].includes(state.status) && !isDemo && <Text style={styles.description}>Carregando playlists…</Text>}
      {state.status === 'error' && <Text style={styles.description}>Use Tentar novamente no aviso acima antes de salvar.</Text>}
      {state.status === 'saving' && <Text accessibilityLiveRegion="polite" style={styles.description}>Salvando música…</Text>}
      {confirmed && <View style={styles.success}><Text accessibilityRole="alert" style={styles.track}>Música adicionada a {confirmed.name}</Text><Pressable accessibilityRole="button" accessibilityLabel="Abrir playlist atualizada" onPress={() => router.replace(localPlaylistHref(confirmed.id))} style={styles.action}><Text style={styles.actionText}>Ver playlist</Text></Pressable></View>}
    </View>}
    ListEmptyComponent={track && state.status === 'ready' && !playlists.length ? <View style={styles.header}><Text style={styles.track}>Crie sua primeira playlist local</Text><Pressable accessibilityRole="button" onPress={() => router.push('/local-playlist/new')} style={styles.action}><Text style={styles.actionText}>Criar playlist</Text></Pressable></View> : null}
    renderItem={({ item }) => { const exists = item.tracks.some(value => value.id === trackId); const full = item.tracks.length >= 300; const disabled = !ready || exists || full; return <Pressable accessibilityRole="button" accessibilityLabel={'Adicionar em ' + item.name} accessibilityState={{ disabled }} disabled={disabled} onPress={() => add(item)} style={[styles.row, disabled && styles.disabled]}><MaterialCommunityIcons name={exists ? 'check' : 'playlist-plus'} size={28} color={exists ? colors.green : colors.text} /><View style={styles.info}><Text style={styles.track}>{item.name}</Text><Text style={styles.description}>{exists ? 'Já adicionada' : full ? 'Limite de 300 músicas' : item.tracks.length + ' músicas'}</Text></View></Pressable>; }}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1, padding: 20, paddingBottom: 32 }, header: { gap: 16, paddingBottom: 24 }, back: { width: 44, height: 44 }, title: { color: colors.text, fontSize: 28, fontWeight: '900' }, description: { color: colors.muted, fontSize: 14, lineHeight: 22 }, track: { color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 23 }, row: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 }, info: { flex: 1, gap: 4 }, disabled: { opacity: 0.5 }, success: { padding: 16, gap: 14, backgroundColor: colors.surface, borderRadius: radius.md }, action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.green, borderRadius: radius.pill, alignSelf: 'flex-start' }, actionText: { color: colors.black, fontWeight: '800' } });
