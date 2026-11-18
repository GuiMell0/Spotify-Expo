import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalData } from '../contexts/LocalDataContext';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { localPlaylistCover, selectLocalPlaylist } from '../services/localPlaylistDetails.mjs';
import IconButton from '../components/IconButton';
import LikeTrackButton from '../components/LikeTrackButton';
import { colors, radius } from '../theme';

export default function LocalPlaylistScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDemo, signOut } = useSession();
  const { state } = useLocalData();
  const { search } = useSearch();
  const selection = selectLocalPlaylist(state, id);
  const playlist = selection.playlist;
  const cover = localPlaylistCover(playlist);
  const library = () => router.dismissTo('/library');
  const back = () => { if (router.canGoBack()) router.back(); else router.replace('/library'); };
  function open(track) { search.rememberEntity(track); router.push(track.href); }
  const topbar = <View style={styles.topbar}><IconButton name="arrow-left" accessibilityLabel="Voltar" onPress={back} style={styles.back} /><View style={styles.tag}><MaterialCommunityIcons name="playlist-music" size={23} color={colors.green} /><Text style={styles.tagText}>Playlist local</Text></View></View>;

  function feedback() {
    if (isDemo || selection.status === 'disabled') return <><Text accessibilityRole="header" style={styles.feedbackTitle}>Suas playlists são pessoais</Text><Text style={styles.description}>Entre com Spotify para acessar suas playlists locais neste aparelho.</Text><Pressable accessibilityRole="button" onPress={signOut} style={styles.action}><Text style={styles.actionText}>Ir para o login</Text></Pressable></>;
    if (selection.status === 'loading') return <><ActivityIndicator color={colors.green} /><Text accessibilityLiveRegion="polite" style={styles.description}>Carregando playlist local…</Text></>;
    if (selection.status === 'error') return <><Text accessibilityRole="header" style={styles.feedbackTitle}>Não foi possível carregar a playlist</Text><Text style={styles.description}>Use Tentar novamente no aviso acima. Os dados existentes foram preservados.</Text></>;
    if (selection.status === 'invalid') return <><Text accessibilityRole="header" style={styles.feedbackTitle}>Endereço de playlist inválido</Text><Text style={styles.description}>Abra uma playlist pela sua Biblioteca.</Text></>;
    return <><Text accessibilityRole="header" style={styles.feedbackTitle}>Playlist local não encontrada</Text><Text style={styles.description}>Ela pode ter sido removida ou pertencer a outra conta neste aparelho.</Text></>;
  }
  const unavailable = isDemo || selection.status !== 'ready';
  return <View style={styles.root}>
    <LinearGradient colors={['#194A33', colors.background]} locations={[0, 0.5]} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {unavailable ? <ScrollView contentContainerStyle={styles.content}>{topbar}<View style={styles.feedback}>{feedback()}<Pressable accessibilityRole="button" accessibilityLabel="Voltar à Biblioteca" onPress={library} style={styles.secondary}><Text style={styles.secondaryText}>Voltar à Biblioteca</Text></Pressable></View></ScrollView>
        : <FlatList key={playlist.id} data={playlist.tracks} keyExtractor={track => track.id} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
          ListHeaderComponent={<View style={styles.header}>{topbar}
            {cover ? <Image accessibilityLabel={'Capa de ' + playlist.name} source={cover} resizeMode="contain" style={styles.cover} /> : <LinearGradient colors={['#31694D', '#1B3024']} accessibilityLabel="Playlist sem capa" style={styles.placeholder}><MaterialCommunityIcons name="playlist-music" size={86} color={colors.text} /></LinearGradient>}
            <Text accessibilityRole="header" style={styles.title}>{playlist.name}</Text>
            <Text style={styles.description}>Salva neste aparelho · não altera sua conta Spotify</Text>
            <Text style={styles.count}>{playlist.tracks.length} {playlist.tracks.length === 1 ? 'música' : 'músicas'}</Text>
            {['idle', 'loading'].includes(state.status) && <Text accessibilityLiveRegion="polite" style={styles.description}>Recarregando dados salvos…</Text>}
            {state.status === 'saving' && <Text accessibilityLiveRegion="polite" style={styles.description}>Salvando dados…</Text>}
            {state.status === 'error' && <Text style={styles.description}>Esta é a última playlist carregada. Recarregue os dados pelo aviso acima.</Text>}
          </View>}
          ListEmptyComponent={<View style={styles.empty}><Text accessibilityRole="header" style={styles.emptyTitle}>Esta playlist ainda não tem músicas</Text><Text style={styles.emptyDescription}>As músicas adicionadas à sua seleção aparecerão aqui.</Text><Pressable accessibilityRole="button" accessibilityLabel="Buscar músicas no Spotify" onPress={() => router.dismissTo('/search')} style={styles.action}><Text style={styles.actionText}>Buscar músicas</Text></Pressable></View>}
          renderItem={({ item, index }) => <View style={styles.row}><Pressable accessibilityRole="button" accessibilityLabel={'Abrir música da playlist local ' + item.title} onPress={() => open(item)} style={({ pressed }) => [styles.open, pressed && styles.pressed]}>
            <Text style={styles.position}>{index + 1}</Text>
            {item.image ? <Image source={item.image} resizeMode="contain" style={styles.trackCover} /> : <View style={styles.trackPlaceholder}><MaterialCommunityIcons name="music-note" size={24} color={colors.muted} /></View>}
            <View style={styles.info}><Text numberOfLines={2} style={styles.trackTitle}>{item.title}</Text><Text numberOfLines={2} style={styles.artist}>{item.artist}</Text>{item.duration && <Text style={styles.duration}>{item.duration}</Text>}</View>
          </Pressable><LikeTrackButton track={item} /></View>}
        />}
    </SafeAreaView>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 }, topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  back: { width: 44, height: 44 }, tag: { flexDirection: 'row', alignItems: 'center', gap: 8 }, tagText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  header: { gap: 16, paddingBottom: 22 }, cover: { width: 190, height: 190, alignSelf: 'center', borderRadius: radius.md, backgroundColor: colors.surface, marginVertical: 8 },
  placeholder: { width: 190, height: 190, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, marginVertical: 8 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', lineHeight: 39 }, description: { color: colors.muted, fontSize: 14, lineHeight: 22 }, count: { color: colors.text, fontSize: 14 },
  empty: { flex: 1, paddingVertical: 24, alignItems: 'center', gap: 16 }, emptyTitle: { color: colors.text, fontSize: 21, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' }, action: { minHeight: 48, paddingHorizontal: 22, paddingVertical: 12, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.green },
  actionText: { color: colors.black, fontWeight: '800', fontSize: 14 }, feedback: { flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 30 }, feedbackTitle: { color: colors.text, fontSize: 25, lineHeight: 34, fontWeight: '800' },
  secondary: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.muted, alignSelf: 'flex-start', justifyContent: 'center' }, secondaryText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 }, open: { flex: 1, minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderRadius: radius.sm },
  position: { minWidth: 16, color: colors.muted, fontSize: 12 }, trackCover: { width: 48, height: 48, backgroundColor: colors.surface }, trackPlaceholder: { width: 48, height: 48, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, gap: 4 }, trackTitle: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 }, artist: { color: colors.muted, fontSize: 12, lineHeight: 18 }, duration: { color: colors.muted, fontSize: 12 }, pressed: { backgroundColor: colors.surface },
});
