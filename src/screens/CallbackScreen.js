import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { colors, radius } from '../theme';

export default function CallbackScreen() {
  const { canAccess, isBusy, message, cancelSignIn } = useSession();
  const router = useRouter();
  if (canAccess) return <Redirect href="/home" />;
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        {isBusy && <ActivityIndicator size="large" color={colors.green} />}
        <Text accessibilityRole="header" style={styles.title}>{isBusy ? 'Concluindo sua entrada…' : 'Reinicie a entrada'}</Text>
        <Text style={styles.message}>{isBusy ? 'Aguarde a confirmação da sua conta Spotify.' : message || 'Esta tentativa de login expirou ou não foi iniciada neste aplicativo.'}</Text>
        <Pressable accessibilityRole="button" onPress={() => { if (isBusy) cancelSignIn(); router.replace('/login'); }} style={styles.button}>
          <Text style={styles.buttonText}>{isBusy ? 'Cancelar entrada' : 'Voltar para o login'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  message: { color: colors.muted, lineHeight: 22, textAlign: 'center' },
  button: { backgroundColor: colors.green, borderRadius: radius.pill, padding: 16 },
  buttonText: { color: colors.black, fontWeight: '800' },
});
