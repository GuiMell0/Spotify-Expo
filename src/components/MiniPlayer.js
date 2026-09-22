import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ASSETS } from '../data/media';
import { colors, radius } from '../theme';

export default function MiniPlayer({ navigation }) {
  return (
    <Pressable
      onPress={() => navigation.navigate('Player')}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel="Abrir player de Bedless"
    >
      <Image source={ASSETS.playerCover} style={styles.cover} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>Bedless</Text>
        <Text numberOfLines={1} style={styles.artist}>Pierce The Veil</Text>
      </View>
      <MaterialCommunityIcons name="cellphone-sound" size={21} color={colors.text} />
      <MaterialCommunityIcons name="check-circle" size={21} color={colors.green} style={styles.icon} />
      <MaterialCommunityIcons name="play" size={29} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 8, right: 8, bottom: 5, height: 62, borderRadius: radius.md,
    backgroundColor: '#155B72', flexDirection: 'row', alignItems: 'center', padding: 7,
  },
  cover: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surface },
  meta: { flex: 1, marginLeft: 10, marginRight: 6 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  artist: { color: '#D5E8EE', fontSize: 12, marginTop: 2 },
  icon: { marginHorizontal: 13 },
});