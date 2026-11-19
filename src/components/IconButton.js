import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function IconButton({ name, size = 24, color = colors.text, onPress, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name}
      disabled={!onPress}
      accessibilityState={{ disabled: !onPress }}
      hitSlop={6}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons accessible={false} name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.62 },
});
