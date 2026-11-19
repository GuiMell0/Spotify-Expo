import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

export default function MediaCard({ item, onPress, width = 148 }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={'Abrir ' + item.title} onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      <Image source={item.image} style={[styles.image, item.round && styles.round]} />
      <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.subtitle}>{item.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  card: { marginRight: 15 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.surface, borderRadius: radius.sm },
  round: { borderRadius: 999 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 9 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
});
