import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import { colors, radius } from '../theme';
import ApiFeedback from '../components/ApiFeedback';
import { useSession } from '../contexts/SessionContext';

export default function LoginScreen() {
  const { canAccess, logoutBlocked, canRetryRestore, restoreSession, signOut, isBusy, isPreparing, isReady, isBrowserOpen, blocker, message, status, signIn, cancelSignIn, startDemo, retryPreparation } = useSession();
  if (canAccess) return <Redirect href="/home" />;
  const loginDisabled = Boolean(blocker) || !isReady || isBusy;

  return (
    <LinearGradient colors={['#193724', '#121212', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView keyboardDismissMode="on-drag" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <MaterialCommunityIcons name="spotify" size={78} color={colors.green} />
            <Text accessibilityRole="header" style={styles.title}>Sua música.{`\n`}Do seu jeito.</Text>
            <Text style={styles.subtitle}>Conecte sua conta Spotify ou explore a demonstração.</Text>
          </View>
          <View style={styles.actions}>
            {!!blocker && <Text style={styles.notice}>{blocker}</Text>}
            <ApiFeedback message={message} onRetry={logoutBlocked ? signOut : canRetryRestore ? restoreSession : undefined} retryLabel={logoutBlocked ? 'Limpar sessão novamente' : 'Tentar restaurar sessão'} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar com Spotify"
              accessibilityState={{ disabled: loginDisabled, busy: isBusy || isPreparing }}
              disabled={loginDisabled}
              onPress={signIn}
              style={[styles.primaryButton, loginDisabled && styles.disabled]}
            >
              {isBusy || isPreparing ? <ActivityIndicator color={colors.black} /> : <MaterialCommunityIcons name="spotify" size={23} color={colors.black} />}
              <Text style={styles.primaryText}>{isPreparing ? 'Preparando entrada…' : status === 'exchanging' ? 'Conectando sua conta…' : isBusy ? 'Aguardando autorização…' : 'Entrar com Spotify'}</Text>
            </Pressable>
            {isBusy && <Pressable accessibilityRole="button" onPress={cancelSignIn} style={styles.secondaryButton}><Text style={styles.secondaryText}>Cancelar entrada</Text></Pressable>}
            {isBrowserOpen && !isBusy && <Text style={styles.notice}>Aguardando o fechamento da janela de autorização…</Text>}
            {!isBusy && !isPreparing && !isReady && !isBrowserOpen && !blocker && !logoutBlocked && (
              <Pressable accessibilityRole="button" onPress={retryPreparation} style={styles.secondaryButton}><Text style={styles.secondaryText}>Preparar entrada novamente</Text></Pressable>
            )}
            <Pressable accessibilityRole="button" disabled={isBusy} onPress={startDemo} style={[styles.secondaryButton, isBusy && styles.disabled]}>
              <Text style={styles.secondaryText}>Explorar demonstração</Text>
            </Pressable>
            <Text style={styles.disclaimer}>Projeto acadêmico com catálogo demonstrativo.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  content: { flexGrow: 1 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', lineHeight: 40, textAlign: 'center', marginTop: 26 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 16, maxWidth: 300 },
  actions: { paddingBottom: 30, gap: 12 },
  notice: { color: colors.muted, backgroundColor: colors.surface, padding: 14, borderRadius: radius.md, fontSize: 13, lineHeight: 20 },
  primaryButton: { backgroundColor: colors.green, borderRadius: radius.pill, minHeight: 54, paddingHorizontal: 18, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.black, fontWeight: '800', fontSize: 15 },
  secondaryButton: { minHeight: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: '#727272', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondaryText: { color: colors.text, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  disclaimer: { color: colors.subtle, textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 4 },
});
