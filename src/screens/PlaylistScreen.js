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
import { ASSETS, demoPlaylists } from '../data/media';
import UnavailableContent from '../components/UnavailableContent';
import { colors, radius } from '../theme';

export default function PlaylistScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const playlist = demoPlaylists.find((item) => item.id === id);

  if (!playlist) return <UnavailableContent title="Playlist não encontrada" />;
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#686868', '#292929', colors.background]} locations={[0, 0.38, 0.72]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topbar}>
            <BackButton />
            <View style={styles.search}><MaterialCommunityIcons name="magnify" size={18} color={colors.text} /><Text style={styles.searchText}>Procurar nesta playlist</Text></View>
          </View>
          <Image source={playlist.image} style={styles.cover} />
          <Text style={styles.title}>{playlist.title}</Text>
          <View style={styles.ownerRow}><Image source={ASSETS.profile} style={styles.ownerAvatar} /><Text style={styles.owner}>anna</Text></View>
          <Text style={styles.meta}>Playlist • {playlist.tracks.length} músicas</Text>
          <View style={styles.actions}>
            <IconButton name="download-circle-outline" size={28} color={colors.muted} />
            <IconButton name="share-variant-outline" size={26} color={colors.muted} />
            <IconButton name="dots-vertical" size={26} color={colors.muted} />
            <MaterialCommunityIcons name="shuffle-variant" size={28} color={colors.green} style={{ marginLeft: 'auto' }} />
            <Pressable onPress={() => router.push('/player')} style={styles.play}><MaterialCommunityIcons name="play" size={34} color={colors.black} /></Pressable>
          </View>
          <View style={styles.pills}>
            <View style={styles.pill}><MaterialCommunityIcons name="plus" size={18} color={colors.text} /><Text style={styles.pillText}>Adicionar</Text></View>
            <View style={styles.pill}><MaterialCommunityIcons name="tune-variant" size={18} color={colors.text} /><Text style={styles.pillText}>Mixar</Text></View>
          </View>
          <View style={styles.list}>
            {playlist.tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} liked={index < 3} onPress={() => router.push('/player')} />
            ))}
          </View>
        </ScrollView>
        <MiniPlayer />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 }, content: { paddingBottom: 95 },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 6 },
  search: { flex: 1, height: 38, marginLeft: 18, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  searchText: { color: colors.text, fontSize: 13, fontWeight: '700', marginLeft: 7 },
  cover: { width: 220, height: 220, alignSelf: 'center', marginTop: 26, borderRadius: 3, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', marginHorizontal: 16, marginTop: 17 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10 },
  ownerAvatar: { width: 25, height: 25, borderRadius: 13, marginRight: 7 }, owner: { color: colors.text, fontSize: 13, fontWeight: '700' },
  meta: { color: colors.muted, marginHorizontal: 16, marginTop: 7, fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 19, marginHorizontal: 17, marginTop: 15 },
  play: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  pills: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderColor: '#666', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { color: colors.text, fontSize: 12, fontWeight: '700' }, list: { marginTop: 11 },
});
