import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLikedTracks } from '../hooks/useLikedTracks';
import { colors, radius } from '../theme';

export default function LikeTrackButton({ track, showLabel = false }) {
  const { localData, state, isLiked, setLiked } = useLikedTracks();
  const [operation, setOperation] = useState(null);
  const pending = operation?.store === localData && operation?.id === track.id;
  const liked = isLiked(track.id);
  const disabled = state.status !== 'ready' || pending;
  async function press() {
    if (disabled) return;
    const current = { store: localData, id: track.id };
    setOperation(current);
    try { await setLiked(track, !liked); }
    catch { /* O aviso global da A12 apresenta falhas e oferece recuperação. */ }
    finally { setOperation(previous => previous === current ? null : previous); }
  }
  return <Pressable accessibilityRole="button" accessibilityLabel={(liked ? 'Descurtir ' : 'Curtir ') + track.title}
    accessibilityState={{ selected: liked, disabled, busy: pending }} disabled={disabled} onPress={press}
    style={[styles.button, showLabel && styles.labeled, disabled && styles.disabled]}>
    {pending ? <ActivityIndicator size="small" color={colors.green} /> : <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={25} color={liked ? colors.green : colors.text} />}
    {showLabel && <Text style={[styles.text, liked && styles.selected]}>{liked ? 'Curtida' : 'Curtir música'}</Text>}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  labeled: { alignSelf: 'flex-start', paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.subtle },
  text: { color: colors.text, fontWeight: '700', fontSize: 14 }, selected: { color: colors.green }, disabled: { opacity: 0.5 },
});
