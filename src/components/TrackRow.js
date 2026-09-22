import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function TrackRow({ track, index, onPress, showIndex = false, liked = false }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#242424' }]}>
      {showIndex && <Text style={styles.index}>{index + 1}</Text>}
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.artist}>{track.artist}</Text>
      </View>
      {liked && <MaterialCommunityIcons name="check-circle" size={17} color={colors.green} style={styles.liked} />}
      <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 6 },
  index: { color: colors.muted, width: 28, fontSize: 14 },
  meta: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '500' },
  artist: { color: colors.muted, fontSize: 12, marginTop: 4 },
  liked: { marginRight: 13 },
});
