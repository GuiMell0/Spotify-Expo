import { useMiniPlayerVisible } from '../hooks/useMiniPlayerVisible';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrackQueue } from '../contexts/TrackQueueContext';
import { colors, radius } from '../theme';

export default function MiniPlayer() {
  const { state } = useTrackQueue();
  const visible = useMiniPlayerVisible();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const track = state.track;
  if (!visible) return null;
  return <View style={[styles.area, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={'Abrir faixa selecionada ' + track.title}
      onPress={() => router.push(track.href)} style={styles.container}>
      {track.image ? <Image source={track.image} resizeMode="contain" style={styles.cover} /> : <View style={styles.placeholder}><MaterialCommunityIcons name="music-note" size={26} color={colors.text} /></View>}
      <View style={styles.info}><Text numberOfLines={1} style={styles.title}>{track.title}</Text><Text numberOfLines={1} style={styles.artist}>{track.artist}</Text><Text style={styles.caption}>Selecionada · {state.index + 1}/{state.tracks.length}</Text></View>
      <MaterialCommunityIcons name="chevron-up" size={28} color={colors.text} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  area: { backgroundColor: colors.background, paddingHorizontal: 8, paddingTop: 5 },
  container: { minHeight: 76, padding: 9, borderRadius: radius.md, backgroundColor: '#224B38', flexDirection: 'row', alignItems: 'center', gap: 10 },
  cover: { width: 48, height: 48, borderRadius: radius.sm },
  placeholder: { width: 48, height: 48, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0, gap: 3 }, title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  artist: { color: colors.muted, fontSize: 12 }, caption: { color: colors.muted, fontSize: 11 },
});
