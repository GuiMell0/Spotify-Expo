import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export default function MediaCard({ item, onPress, width = 148 }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.72 }]}>
      <Image source={item.image} style={[styles.image, { width, height: width }, item.round && styles.round]} />
      <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.subtitle}>{item.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: 15 },
  image: { backgroundColor: colors.surface, borderRadius: radius.sm },
  round: { borderRadius: 999 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 9 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
});