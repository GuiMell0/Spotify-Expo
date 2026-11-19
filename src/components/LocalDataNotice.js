import { useSession } from '../contexts/SessionContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalData } from '../contexts/LocalDataContext';
import { colors, radius } from '../theme';

export default function LocalDataNotice() {
  const { localData, state } = useLocalData();
  const { session, sessionRecovery } = useSession();
  if (state.status !== 'error') return null;
  return (
    <SafeAreaView edges={session && sessionRecovery ? ['left', 'right'] : ['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.notice}>
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{state.error.message}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar dados salvos" onPress={localData.retry} style={styles.retry}><Text style={styles.label}>Tentar novamente</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { backgroundColor: colors.surface }, notice: { padding: 14, gap: 8 },
  text: { color: colors.text, fontSize: 13, lineHeight: 20 },
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: 16, backgroundColor: colors.green },
  label: { color: colors.black, fontWeight: '700', fontSize: 13 },
});
