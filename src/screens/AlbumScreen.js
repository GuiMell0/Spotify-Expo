import { useOpenTrack } from '../hooks/useOpenTrack';
import AddToPlaylistButton from '../components/AddToPlaylistButton';
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Image, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { albumTrackKey, createSpotifyAlbum } from '../services/spotifyAlbum.mjs';
import ApiFeedback from '../components/ApiFeedback';
import LikeTrackButton from '../components/LikeTrackButton';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';
const albumTypes = {
  album: 'Álbum',
  single: 'Single',
  compilation: 'Coletânea'
};
export default function SpotifyAlbumScreen() {
  const openTrackSelection = useOpenTrack();
  const {
    id: routeId
  } = useLocalSearchParams();
  const id = typeof routeId === 'string' ? routeId : '';
  const {
    catalog,
    session
  } = useSession();
  const {
    search
  } = useSearch();
  const router = useRouter();
  const scope = session?.user.id ?? null;
  const controller = useMemo(() => createSpotifyAlbum(catalog, id, {
    scope
  }), [catalog, id, scope]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [openError, setOpenError] = useState(null);
  useEffect(() => () => controller.suspend(), [controller]);
  useFocusEffect(useCallback(() => {
    controller.setActive(true);
    return () => {
      controller.setActive(false);
    };
  }, [controller]));
  const album = state.album;
  const busy = state.status === 'loading';
  const multipleDiscs = state.tracks.some(track => track.discNumber > 1);
  function openTrack(track) {
    openTrackSelection(track, state.tracks);
  }
  function openArtist(artist) {
    search.rememberEntity(search.getEntity('artist', artist.id) ?? artist);
    router.push(artist.href);
  }
  async function openSpotify() {
    setOpenError(null);
    try {
      await Linking.openURL(album.spotifyUrl);
    } catch {
      setOpenError(controller);
    }
  }
  return <View style={styles.root}>
      <LinearGradient colors={['#244431', colors.background]} style={StyleSheet.absoluteFill} locations={[0, 0.5]} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView keyboardDismissMode="on-drag" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={busy} onRefresh={controller.refresh} tintColor={colors.green} colors={[colors.green]} />}>
          <View style={styles.topbar}>
            <BackButton style={styles.back} />
            <View style={styles.brand}><MaterialCommunityIcons name="spotify" size={22} color={colors.green} /><Text style={styles.brandText}>Álbum no Spotify</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Atualizar álbum" accessibilityState={{
            disabled: busy || state.loadingMore
          }} disabled={busy || state.loadingMore} onPress={controller.refresh} style={[styles.iconButton, (busy || state.loadingMore) && styles.disabled]}><MaterialCommunityIcons name="refresh" size={25} color={colors.text} /></Pressable>
          </View>
          <ApiFeedback loading={busy} error={state.error} onRetry={controller.refresh} retryLabel="Tentar carregar álbum" />
          {state.status === 'paused' && <ApiFeedback message="Carregamento interrompido." onRetry={controller.refresh} retryLabel="Carregar álbum" />}
          {!!album && <>
            {album.image ? <Image source={album.image} resizeMode="contain" style={styles.cover} /> : <View style={styles.placeholder}><MaterialCommunityIcons name="album" size={90} color={colors.muted} /></View>}
            <Text accessibilityRole="header" style={styles.title}>{album.title}</Text>
            <View style={styles.artistList}>{album.artists.length ? album.artists.map((artist, index) => artist.id ? <Pressable key={artist.id + ':' + index} accessibilityRole="button" accessibilityLabel={'Abrir artista ' + artist.title} onPress={() => openArtist(artist)} style={styles.artistButton}><MaterialCommunityIcons name="account-music" size={18} color={colors.muted} /><Text style={styles.artist}>{artist.title}</Text><MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} /></Pressable> : <Text key={'credit:' + index} style={styles.credit}>{artist.title}</Text>) : <Text style={styles.credit}>Artista não informado</Text>}</View>
            <Text style={styles.meta}>{albumTypes[album.albumType] ?? 'Álbum'}{album.totalTracks !== null ? ' • ' + album.totalTracks + (album.totalTracks === 1 ? ' faixa' : ' faixas') : ''}</Text>
            {!!album.releaseDate && <Text style={styles.meta}>Lançamento: {album.releaseDate}</Text>}
            <Pressable accessibilityRole="link" accessibilityLabel={'Ver ' + album.title + ' no Spotify'} onPress={openSpotify} style={styles.spotify}><MaterialCommunityIcons name="spotify" size={23} color={colors.black} /><Text style={styles.spotifyText}>Ver no Spotify</Text></Pressable>
            {openError === controller && <Text accessibilityRole="alert" style={styles.notice}>Não foi possível abrir o Spotify. Tente tocar no botão novamente.</Text>}
            {!!state.error && state.tracks.length > 0 && <Text style={styles.notice}>Não foi possível atualizar. As faixas já carregadas continuam disponíveis.</Text>}
            <View style={styles.trackHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>Faixas</Text>{state.page && <Text style={styles.loaded}>{state.tracks.length} carregadas</Text>}</View>
            {state.status === 'ready' && !state.tracks.length && <Text style={styles.empty}>{state.page?.next ? 'Nenhuma faixa disponível nesta página. Você pode carregar a próxima.' : 'Nenhuma faixa disponível para este álbum.'}</Text>}
            {state.tracks.map(track => <View key={albumTrackKey(track)} style={styles.trackEntry}><Pressable accessibilityRole="button" accessibilityLabel={'Abrir faixa ' + track.title} onPress={() => openTrack(track)} style={({
              pressed
            }) => [styles.trackRow, pressed && styles.pressed]}>
              <View style={styles.position}>{track.trackNumber > 0 ? <Text style={styles.number}>{multipleDiscs && track.discNumber ? track.discNumber + '.' : ''}{track.trackNumber}</Text> : <MaterialCommunityIcons name="music-note-outline" size={19} color={colors.muted} />}</View>
              <View style={styles.trackInfo}><Text numberOfLines={2} style={styles.trackTitle}>{track.title}</Text><View style={styles.trackMeta}>{track.explicit && <Text accessibilityLabel="Conteúdo explícito" style={styles.explicit}>E</Text>}<Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text></View>{track.isPlayable === false && <Text style={styles.restricted}>Indisponível nesta conta</Text>}</View>
              {track.duration && <Text style={styles.duration}>{track.duration}</Text>}
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable><LikeTrackButton track={track} /><AddToPlaylistButton track={track} /></View>)}
            {state.skippedCount > 0 && <Text style={styles.notice}>Algumas faixas não foram fornecidas pelo Spotify.</Text>}
            <ApiFeedback loading={state.loadingMore} error={state.moreError} onRetry={controller.loadMore} retryLabel="Tentar carregar mais faixas" />
            {!!state.page?.next && !state.moreError && !state.loadingMore && !busy && <Pressable accessibilityRole="button" onPress={controller.loadMore} style={styles.more}><Text style={styles.moreText}>Carregar mais faixas</Text></Pressable>}
          </>}
        </ScrollView>
      </SafeAreaView>
    </View>;
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  safe: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 8
  },
  back: {
    width: 44,
    height: 44
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  brandText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600'
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabled: {
    opacity: 0.5
  },
  cover: {
    width: '100%',
    maxWidth: 310,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: colors.surface
  },
  placeholder: {
    width: '100%',
    maxWidth: 310,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: colors.text,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    marginTop: 8
  },
  artistList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  artistButton: {
    maxWidth: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface
  },
  artist: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1
  },
  credit: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  spotify: {
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 4
  },
  spotifyText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '800'
  },
  trackHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 14
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800'
  },
  loaded: {
    color: colors.muted,
    fontSize: 12
  },
  trackEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  trackRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 72,
    paddingVertical: 10,
    borderRadius: radius.md
  },
  position: {
    width: 28,
    alignItems: 'center'
  },
  number: {
    color: colors.muted,
    fontSize: 13
  },
  trackInfo: {
    flex: 1,
    minWidth: 0
  },
  trackTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600'
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4
  },
  trackArtist: {
    flex: 1,
    color: colors.muted,
    fontSize: 12
  },
  explicit: {
    color: colors.background,
    backgroundColor: colors.muted,
    paddingHorizontal: 4,
    borderRadius: 2,
    fontSize: 9,
    fontWeight: '700'
  },
  duration: {
    color: colors.muted,
    fontSize: 12
  },
  restricted: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 28
  },
  notice: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  pressed: {
    backgroundColor: colors.surface
  },
  more: {
    alignSelf: 'center',
    minHeight: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.subtle,
    justifyContent: 'center',
    paddingHorizontal: 22,
    marginVertical: 12
  },
  moreText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'
  }
});
