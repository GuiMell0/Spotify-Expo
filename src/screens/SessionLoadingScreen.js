import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

export default function SessionLoadingScreen({ ending = false }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={ending ? 'Encerrando sessão' : 'Restaurando sessão'}>
      <StatusBar style="light" />
      <ActivityIndicator color={colors.green} size="large" />
      <Text style={styles.message}>{ending ? 'Encerrando sessão…' : 'Verificando sua sessão…'}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24, gap: 20 },
  message: { color: colors.text, fontSize: 16, textAlign: 'center' },
});
