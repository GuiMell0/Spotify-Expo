import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.surfaceLight, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  selected: { backgroundColor: colors.green },
  label: { color: colors.text, fontSize: 13, fontWeight: '600' },
  selectedLabel: { color: colors.black },
});
