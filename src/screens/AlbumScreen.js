import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import BackButton from '../components/BackButton';
import MiniPlayer from '../components/MiniPlayer';
import TrackRow from '../components/TrackRow';
import { demoAlbums } from '../data/media';
import UnavailableContent from '../components/UnavailableContent';
import { colors } from '../theme';

export default function AlbumScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const album = demoAlbums.find((item) => item.id === id);

  if (!album) return <UnavailableContent title="Álbum não encontrado" />;
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#B50A13', '#491011', colors.background]} locations={[0, 0.44, 0.76]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton style={styles.back} />
          <Image source={album.image} style={styles.cover} />
          <View style={styles.info}>
            <Text style={styles.title}>{album.title}</Text>
            <Pressable onPress={() => router.push({ pathname: '/artist/[id]', params: { id: album.artistId } })} style={styles.artistRow}>
              <Image source={album.artistImage} style={styles.artistImage} />
              <Text style={styles.artist}>{album.artist}</Text>
            </Pressable>
            <Text style={styles.meta}>Álbum • {album.date}</Text>
            <View style={styles.actions}>
              <IconButton name="heart" size={28} color={colors.green} />
              <IconButton name="download-circle-outline" size={29} color={colors.muted} />
              <IconButton name="dots-vertical" size={26} color={colors.muted} />
              <MaterialCommunityIcons name="shuffle-variant" size={28} color={colors.muted} style={{ marginLeft: 'auto' }} />
              <Pressable onPress={() => router.push('/player')} style={styles.play}><MaterialCommunityIcons name="play" size={34} color={colors.black} /></Pressable>
            </View>
          </View>
          {album.tracks.map((track, index) => <TrackRow key={track.id} track={track} index={index} liked={index !== 1} onPress={() => router.push('/player')} />)}
          <Text style={styles.footer}>13 de maio de 2016{`\n`}© 2016 Fearless Records</Text>
        </ScrollView>
        <MiniPlayer />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { paddingBottom: 100 },
  back: { position: 'absolute', left: 16, top: 8, zIndex: 2, width: 38, height: 38, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  cover: { width: 226, height: 226, alignSelf: 'center', marginTop: 18, backgroundColor: colors.surface },
  info: { paddingHorizontal: 16, marginTop: 20 }, title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  artistRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 }, artistImage: { width: 25, height: 25, borderRadius: 13 },
  artist: { color: colors.text, fontSize: 13, fontWeight: '700', marginLeft: 8 }, meta: { color: colors.muted, fontSize: 12, marginTop: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 19, marginTop: 14, marginBottom: 8 },
  play: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  footer: { color: colors.subtle, fontSize: 11, lineHeight: 17, margin: 17 },
});
