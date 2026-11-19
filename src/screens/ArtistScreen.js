import FollowArtistButton from '../components/FollowArtistButton';
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Image, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { createSpotifyArtist } from '../services/spotifyArtist.mjs';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';
const albumTypes = {
  album: 'Álbum',
  single: 'Single',
  compilation: 'Coletânea'
};
export default function SpotifyArtistScreen() {
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
  const controller = useMemo(() => createSpotifyArtist(catalog, id, {
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
  const artist = state.artist;
  const busy = state.status === 'loading';
  function openAlbum(album) {
    search.rememberEntity(album);
    router.push(album.href);
  }
  async function openSpotify() {
    setOpenError(null);
    try {
      await Linking.openURL(artist.spotifyUrl);
    } catch {
      setOpenError(controller);
    }
  }
  return <View style={styles.root}>
      <LinearGradient colors={['#234038', colors.background]} style={StyleSheet.absoluteFill} locations={[0, 0.5]} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView keyboardDismissMode="on-drag" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={busy} onRefresh={controller.refresh} tintColor={colors.green} colors={[colors.green]} />}>
          <View style={styles.topbar}>
            <BackButton style={styles.back} />
            <View style={styles.brand}><MaterialCommunityIcons name="spotify" size={22} color={colors.green} /><Text style={styles.brandText}>Artista no Spotify</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Atualizar artista" accessibilityState={{
            disabled: busy || state.loadingMore
          }} disabled={busy || state.loadingMore} onPress={controller.refresh} style={[styles.iconButton, (busy || state.loadingMore) && styles.disabled]}><MaterialCommunityIcons name="refresh" size={25} color={colors.text} /></Pressable>
          </View>
          <ApiFeedback loading={busy} error={state.error} onRetry={controller.refresh} retryLabel="Tentar carregar artista" />
          {state.status === 'paused' && <ApiFeedback message="Carregamento interrompido." onRetry={controller.refresh} retryLabel="Carregar artista" />}
          {!!artist && <>
            {artist.image ? <Image source={artist.image} resizeMode="contain" style={styles.photo} /> : <View style={styles.placeholder}><MaterialCommunityIcons name="account-music" size={90} color={colors.muted} /></View>}
            <Text accessibilityRole="header" style={styles.title}>{artist.title}</Text>
            <Text style={styles.kind}>Artista</Text>
            <FollowArtistButton artist={artist} />
            <Text style={styles.kind}>Acompanhamento local: não altera quem você segue no Spotify.</Text>
            {artist.genres.length > 0 && <Text style={styles.genres}>{artist.genres.join(' • ')}</Text>}
            <Pressable accessibilityRole="link" accessibilityLabel={'Ver ' + artist.title + ' no Spotify'} onPress={openSpotify} style={styles.spotify}><MaterialCommunityIcons name="spotify" size={23} color={colors.black} /><Text style={styles.spotifyText}>Ver no Spotify</Text></Pressable>
            {openError === controller && <Text accessibilityRole="alert" style={styles.notice}>Não foi possível abrir o Spotify. Tente tocar no botão novamente.</Text>}
            {!!state.error && state.albums.length > 0 && <Text style={styles.notice}>Não foi possível atualizar. Os álbuns já carregados continuam disponíveis.</Text>}
            <View style={styles.albumHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>Discografia</Text>{state.page && <Text style={styles.loaded}>{state.albums.length} carregados</Text>}</View>
            <Text style={styles.kind}>Álbuns e singles</Text>
            {state.status === 'ready' && !state.albums.length && <Text style={styles.empty}>{state.page?.next ? 'Nenhum álbum disponível nesta página. Você pode carregar a próxima.' : 'Nenhum álbum ou single disponível para este artista.'}</Text>}
            {state.albums.map(album => <Pressable key={album.id} accessibilityRole="button" accessibilityLabel={'Abrir álbum ' + album.title} onPress={() => openAlbum(album)} style={({
            pressed
          }) => [styles.albumRow, pressed && styles.pressed]}>
              {album.image ? <Image source={album.image} resizeMode="contain" style={styles.albumCover} /> : <View style={styles.albumPlaceholder}><MaterialCommunityIcons name="album" size={30} color={colors.muted} /></View>}
              <View style={styles.albumInfo}><Text numberOfLines={2} style={styles.albumTitle}>{album.title}</Text><Text style={styles.albumMeta}>{albumTypes[album.albumType] ?? 'Álbum'}{album.releaseDate ? ' • ' + album.releaseDate : ''}</Text><Text numberOfLines={1} style={styles.albumArtist}>{album.artist}</Text></View>
              <MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted} />
            </Pressable>)}
            {state.skippedCount > 0 && <Text style={styles.notice}>Alguns lançamentos não foram fornecidos pelo Spotify.</Text>}
            <ApiFeedback loading={state.loadingMore} error={state.moreError} onRetry={controller.loadMore} retryLabel="Tentar carregar mais álbuns" />
            {state.status === 'ready' && !!state.page?.next && !state.moreError && !state.loadingMore && !busy && <Pressable accessibilityRole="button" onPress={controller.loadMore} style={styles.more}><Text style={styles.moreText}>Carregar mais álbuns</Text></Pressable>}
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
  photo: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: colors.surface
  },
  placeholder: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
    marginTop: 8
  },
  kind: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  genres: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 21
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
  albumHeading: {
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
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 84,
    paddingVertical: 8,
    borderRadius: radius.md
  },
  albumCover: {
    width: 62,
    height: 62,
    backgroundColor: colors.surface
  },
  albumPlaceholder: {
    width: 62,
    height: 62,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  albumInfo: {
    flex: 1
  },
  albumTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700'
  },
  albumMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 3
  },
  albumArtist: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
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
