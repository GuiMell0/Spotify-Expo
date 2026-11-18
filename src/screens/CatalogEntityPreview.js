import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';

const methods = { album: 'getAlbum', artist: 'getArtist', track: 'getTrack', playlist: 'getPlaylist' };
const labels = { album: 'Álbum', artist: 'Artista', track: 'Música', playlist: 'Playlist' };
const icons = { album: 'album', artist: 'account-music', track: 'music-note', playlist: 'playlist-music' };

export default function CatalogEntityPreview({ type, id }) {
  const { catalog } = useSession();
  const { search } = useSearch();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(null);
  const [openError, setOpenError] = useState(false);
  const identity = useMemo(() => ({ type, id, catalog, attempt, search }), [type, id, catalog, attempt, search]);
  const cached = search.getEntity(type, id);
  useEffect(() => {
    if (cached) return undefined;
    const controller = new AbortController();
    catalog[methods[type]](id, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setLoaded({ identity, data });
    }).catch(error => {
      if (!controller.signal.aborted) setLoaded({ identity, error });
    });
    return () => controller.abort();
  }, [cached, catalog, id, type, identity]);
  const current = loaded?.identity === identity ? loaded : null;
  const data = cached ?? current?.data;
  async function openSpotify() {
    setOpenError(false);
    try { await Linking.openURL(data.spotifyUrl); }
    catch { setOpenError(true); }
  }
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton style={styles.back} />
        <ApiFeedback loading={!data && !current?.error} error={current?.error} onRetry={() => setAttempt(value => value + 1)} />
        {!!data && <>
          <View style={styles.brand}><MaterialCommunityIcons name="spotify" size={23} color={colors.green} /><Text style={styles.brandText}>{labels[type]} no Spotify</Text></View>
          {data.image ? <Image source={data.image} resizeMode="contain" style={styles.cover} /> : <View style={styles.placeholder}><MaterialCommunityIcons name={icons[type]} size={90} color={colors.muted} /></View>}
          <Text accessibilityRole="header" style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
          {data.releaseDate && <Text style={styles.detail}>Lançamento: {data.releaseDate}</Text>}
          {data.duration && <Text style={styles.detail}>Duração: {data.duration}</Text>}
          {data.description && <Text style={styles.detail}>{data.description}</Text>}
          {data.album?.id && <Pressable accessibilityRole="button" onPress={() => router.push(data.album.href)} style={styles.secondary}><Text style={styles.secondaryText}>Ver álbum: {data.album.title}</Text></Pressable>}
          {data.artists?.filter(artist => artist.id).map(artist => <Pressable key={artist.id} accessibilityRole="button" onPress={() => router.push(artist.href)} style={styles.secondary}><Text style={styles.secondaryText}>Ver artista: {artist.title}</Text></Pressable>)}
          <Pressable accessibilityRole="link" accessibilityLabel={'Ver ' + data.title + ' no Spotify'} onPress={openSpotify} style={styles.spotify}><MaterialCommunityIcons name="spotify" size={23} color={colors.black} /><Text style={styles.spotifyText}>Ver no Spotify</Text></Pressable>
          {openError && <Text accessibilityRole="alert" style={styles.detail}>Não foi possível abrir o Spotify. Tente tocar no botão novamente.</Text>}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1, padding: 24, gap: 16, paddingBottom: 40 },
  back: { alignSelf: 'flex-start' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 8 }, brandText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  cover: { width: '100%', maxWidth: 340, aspectRatio: 1, alignSelf: 'center', backgroundColor: colors.surface },
  placeholder: { width: '100%', maxWidth: 340, aspectRatio: 1, alignSelf: 'center', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  detail: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  spotify: { minHeight: 52, backgroundColor: colors.green, borderRadius: radius.pill, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 8 },
  spotifyText: { color: colors.black, fontWeight: '800', fontSize: 15 },
  secondary: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderColor: colors.subtle, borderRadius: radius.pill, paddingHorizontal: 18 },
  secondaryText: { color: colors.text, fontWeight: '600', fontSize: 14 },
});
