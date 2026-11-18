import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalData } from '../contexts/LocalDataContext';
import { useSession } from '../contexts/SessionContext';
import { createLocalPlaylist, LocalPlaylistError, MAX_PLAYLIST_NAME_LENGTH, normalizePlaylistName } from '../services/localPlaylists.mjs';
import { LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import BackButton from '../components/BackButton';
import { colors, radius } from '../theme';

export default function CreatePlaylistScreen() {
  const { isDemo, signOut } = useSession();
  return isDemo ? <SafeAreaView style={styles.root}><View style={styles.demo}><BackButton /><Text accessibilityRole="header" style={styles.title}>Suas playlists começam com sua conta</Text><Text style={styles.description}>Entre com Spotify para criar playlists locais neste aparelho.</Text><Pressable accessibilityRole="button" onPress={signOut} style={styles.primary}><Text style={styles.primaryText}>Ir para o login</Text></Pressable></View></SafeAreaView> : <PlaylistForm />;
}

function PlaylistForm() {
  const router = useRouter();
  const { localData, state } = useLocalData();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const ready = state.status === 'ready';
  const saving = state.status === 'saving';
  const loading = ['idle', 'loading'].includes(state.status);
  const atLimit = (state.data?.playlists.length ?? 0) >= LOCAL_DATA_LIMITS.playlists;
  const created = attempt?.owner === localData && state.data?.playlists.some(item => item.id === attempt.id && item.name === attempt.name && item.createdAt === attempt.createdAt);
  useEffect(() => {
    if (ready && created) router.dismissTo('/library');
  }, [ready, created, router]);

  function submit() {
    if (localData.getSnapshot().status !== 'ready' || created) return;
    let normalized;
    try { normalized = normalizePlaylistName(name); } catch (failure) { setError(failure.message); return; }
    if (atLimit) { setError(new LocalPlaylistError('playlist_limit').message); return; }
    let input;
    try {
      input = attempt?.owner === localData && attempt.name === normalized ? attempt : {
        owner: localData, id: 'local-' + Crypto.randomUUID(), name: normalized, createdAt: Date.now(),
      };
    } catch { setError('Não foi possível preparar a playlist. Tente novamente.'); return; }
    setError(null);
    setAttempt(input);
    createLocalPlaylist(localData, { id: input.id, name: input.name, createdAt: input.createdAt }).catch(() => {
      // O aviso global mantém a tentativa e oferece leitura para conferir o resultado.
    });
  }

  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}><BackButton style={styles.back} /><MaterialCommunityIcons name="playlist-music" size={29} color={colors.green} /></View>
        <Text accessibilityRole="header" style={styles.title}>Criar playlist local</Text>
        <Text style={styles.description}>Dê um nome à sua seleção. Esta playlist fica salva neste aparelho e não altera sua conta Spotify.</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Nome da playlist</Text>
          <TextInput accessibilityLabel="Nome da playlist" value={name} onChangeText={value => { setName(value); setError(null); }} maxLength={MAX_PLAYLIST_NAME_LENGTH} editable={ready && !created} onSubmitEditing={submit} returnKeyType="done" placeholder="Ex.: Para estudar" placeholderTextColor={colors.subtle} selectionColor={colors.green} style={styles.input} />
          <Text style={styles.counter}>{name.length}/{MAX_PLAYLIST_NAME_LENGTH}</Text>
          {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          {loading && <View style={styles.status}><ActivityIndicator color={colors.green} /><Text style={styles.description}>Carregando suas playlists…</Text></View>}
          {state.status === 'error' && <Text style={styles.description}>Não foi possível confirmar seus dados. Use Tentar novamente no aviso acima para conferir o que foi salvo antes de continuar.</Text>}
          {atLimit && <Text accessibilityRole="alert" style={styles.description}>Você atingiu o limite de 50 playlists locais neste aparelho.</Text>}
          {state.data && <Text style={styles.description}>{state.data.playlists.length} de {LOCAL_DATA_LIMITS.playlists} playlists locais</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel="Salvar playlist local" accessibilityState={{ disabled: !ready || atLimit || !!created, busy: saving }} disabled={!ready || atLimit || !!created} onPress={submit} style={[styles.primary, (!ready || atLimit || created) && styles.disabled]}>
            {saving ? <ActivityIndicator color={colors.black} /> : <MaterialCommunityIcons name="plus" size={23} color={colors.black} />}<Text style={styles.primaryText}>{saving ? 'Salvando…' : 'Criar playlist'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar criação de playlist" accessibilityState={{ disabled: saving }} disabled={saving} onPress={() => router.dismissTo('/library')} style={styles.cancel}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 32, gap: 20 }, topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44 }, title: { color: colors.text, fontSize: 29, lineHeight: 37, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22 }, form: { gap: 14 }, label: { color: colors.text, fontSize: 16, fontWeight: '700' },
  input: { minHeight: 54, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 18, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.subtle },
  counter: { color: colors.muted, textAlign: 'right', fontSize: 12 }, error: { color: '#FFB6B6', fontSize: 14, lineHeight: 22 }, status: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primary: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: colors.green, borderRadius: radius.pill },
  primaryText: { color: colors.black, fontSize: 15, fontWeight: '800' }, disabled: { opacity: 0.5 },
  cancel: { minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: radius.pill }, cancelText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  demo: { flex: 1, padding: 20, gap: 22, justifyContent: 'center' },
});
