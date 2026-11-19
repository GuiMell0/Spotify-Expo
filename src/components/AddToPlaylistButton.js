import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '../contexts/SearchContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { colors } from '../theme';
export default function AddToPlaylistButton({ track }) {
  const router = useRouter();
  const { search } = useSearch();
  const { state } = useLocalData();
  const disabled = state.status !== 'ready';
  return <Pressable accessibilityRole="button" accessibilityLabel={'Adicionar a playlist: ' + track.title} accessibilityState={{ disabled }} disabled={disabled} onPress={() => { search.rememberEntity(track); router.push({ pathname: '/add-to-playlist', params: { trackId: track.id } }); }} style={[styles.button, disabled && styles.disabled]}><MaterialCommunityIcons name="playlist-plus" size={25} color={colors.text} /></Pressable>;
}
const styles = StyleSheet.create({ button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.5 } });
