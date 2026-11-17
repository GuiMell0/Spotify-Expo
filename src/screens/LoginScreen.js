import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { getSpotifyConfig } from '../config/spotify.mjs';

export default function LoginScreen() {
  const router = useRouter();
  const spotifyConfig = getSpotifyConfig(Platform.OS);
  return (
    <LinearGradient colors={['#193724', '#121212', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <MaterialCommunityIcons name="spotify" size={78} color={colors.green} />
            <Text style={styles.title}>Milhões de músicas.{`\n`}Grátis no Spotify.</Text>
            <Text style={styles.subtitle}>Interface demonstrativa criada com React Native e Expo.</Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.configCard} accessibilityLiveRegion="polite">
              <Text style={styles.configTitle}>{spotifyConfig.isConfigured ? 'Configuração Spotify preenchida' : 'Configuração Spotify pendente'}</Text>
              <Text style={styles.configText}>{spotifyConfig.isConfigured
                ? 'O acesso à conta ainda não está ativo. Explore a demonstração.'
                : spotifyConfig.issues.join('\n')}</Text>
            </View>
            <Pressable onPress={() => router.replace('/home')} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Explorar demonstração</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/home')} style={styles.outlineButton}>
              <MaterialCommunityIcons name="google" size={22} color={colors.text} />
              <Text style={styles.outlineText}>Continuar com Google</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/home')} style={styles.outlineButton}>
              <MaterialCommunityIcons name="apple" size={24} color={colors.text} />
              <Text style={styles.outlineText}>Continuar com Apple</Text>
            </Pressable>
            <Text style={styles.disclaimer}>Protótipo acadêmico sem autenticação real.</Text>
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
  configCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 16, gap: 6 },
  configTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  configText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', lineHeight: 40, textAlign: 'center', marginTop: 26 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 16, maxWidth: 300 },
  actions: { paddingBottom: 30 },
  primaryButton: { backgroundColor: colors.green, borderRadius: radius.pill, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  primaryText: { color: colors.black, fontWeight: '800', fontSize: 16 },
  outlineButton: { height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: '#727272', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, marginBottom: 11 },
  outlineText: { flex: 1, color: colors.text, fontWeight: '700', textAlign: 'center', marginRight: 22 },
  disclaimer: { color: colors.subtle, textAlign: 'center', fontSize: 11, marginTop: 7 },
});
