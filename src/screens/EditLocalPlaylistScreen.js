import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SafeAreaView from '../components/ScreenSafeArea';
import { useLocalData } from '../contexts/LocalDataContext';
import { selectLocalPlaylist, localPlaylistHref } from '../services/localPlaylistDetails.mjs';
import { renameLocalPlaylist, removeLocalPlaylistTrack, deleteLocalPlaylist } from '../services/editLocalPlaylist.mjs';
import { normalizePlaylistName } from '../services/localPlaylists.mjs';
import { colors, radius } from '../theme';
export default function EditLocalPlaylistScreen() {
  const {
      id
    } = useLocalSearchParams(),
    {
      state
    } = useLocalData();
  const router = useRouter(),
    selection = selectLocalPlaylist(state, id);
  if (selection.status !== 'ready') return <SafeAreaView style={styles.root}><View style={styles.content}><Text accessibilityRole="header" style={styles.title}>Editar playlist local</Text><Text style={styles.description}>{selection.status === 'loading' ? 'Carregando playlist…' : selection.status === 'error' ? 'Não foi possível carregar a playlist. Use o aviso acima para tentar novamente.' : 'Playlist indisponível. Abra uma playlist pela Biblioteca.'}</Text><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/library')} style={styles.button}><Text style={styles.buttonText}>Voltar à Biblioteca</Text></Pressable></View></SafeAreaView>;
  return <Editor key={state.accountId + ':' + id} playlist={selection.playlist} />;
}
function Editor({
  playlist
}) {
  const router = useRouter(),
    {
      localData,
      state
    } = useLocalData();
  const [name, setName] = useState(playlist.name),
    [error, setError] = useState(null),
    [confirmation, setConfirmation] = useState(null),
    [message, setMessage] = useState(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const ready = state.status === 'ready',
    saving = state.status === 'saving';
  async function rename() {
    if (localData.getSnapshot().status !== 'ready') return;
    let value;
    try {
      value = normalizePlaylistName(name);
    } catch (failure) {
      setError(failure.message);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await localData.update(data => renameLocalPlaylist(data, playlist.id, value));
      if (active.current) setMessage('Nome salvo');
    } catch {/* O aviso global oferece nova leitura. */}
  }
  async function confirm() {
    if (!confirmation || localData.getSnapshot().status !== 'ready') return;
    const action = confirmation;
    try {
      await localData.update(data => action.kind === 'delete' ? deleteLocalPlaylist(data, playlist.id) : removeLocalPlaylistTrack(data, playlist.id, action.id));
      if (action.kind === 'delete') {
        if (localData.getSnapshot().status === 'ready') router.dismissTo('/library');
        return;
      }
      if (!active.current) return;
      setConfirmation(null);
      setMessage('Música removida da playlist');
    } catch {/* Não confirmar na interface antes de gravar. */}
  }
  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><FlatList keyboardDismissMode="on-drag" data={playlist.tracks} keyExtractor={item => item.id} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" ListHeaderComponent={<View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar aos detalhes da playlist" onPress={() => router.dismissTo(localPlaylistHref(playlist.id))} style={styles.button}><Text style={styles.buttonText}>Voltar à playlist</Text></Pressable><Text accessibilityRole="header" style={styles.title}>Editar playlist local</Text><Text style={styles.description}>As alterações ficam neste aparelho e não modificam sua conta Spotify.</Text><TextInput accessibilityLabel="Novo nome da playlist" value={name} onChangeText={value => {
          setName(value);
          setError(null);
          setMessage(null);
        }} editable={ready && !confirmation} maxLength={80} style={styles.input} selectionColor={colors.green} />{error && <Text accessibilityRole="alert" style={styles.description}>{error}</Text>}<Pressable accessibilityRole="button" accessibilityLabel="Salvar nome da playlist" disabled={!ready || !!confirmation} accessibilityState={{
          disabled: !ready || !!confirmation
        }} onPress={rename} style={styles.button}><Text style={styles.buttonText}>Salvar nome</Text></Pressable>
      {message && <Text accessibilityRole="alert" style={styles.description}>{message}</Text>}
      {state.status === 'error' && <Text style={styles.description}>Os dados confirmados foram mantidos. Use Tentar novamente no aviso acima.</Text>}
      {saving && <Text accessibilityLiveRegion="polite" style={styles.description}>Salvando alteração…</Text>}
      {confirmation && <View style={styles.confirmation}><Text accessibilityRole="header" style={styles.subtitle}>{confirmation.kind === 'delete' ? 'Excluir playlist ' + playlist.name + '?' : 'Remover ' + confirmation.title + ' desta playlist?'}</Text><Text style={styles.description}>{confirmation.kind === 'delete' ? 'A playlist e sua lista de músicas serão removidas deste aparelho. Suas curtidas serão mantidas.' : 'A música continuará disponível nas outras playlists e nas suas curtidas.'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Confirmar alteração da playlist" disabled={!ready} accessibilityState={{
            disabled: !ready
          }} onPress={confirm} style={styles.button}><Text style={styles.buttonText}>Confirmar</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Cancelar alteração da playlist" disabled={saving} onPress={() => setConfirmation(null)} style={styles.button}><Text style={styles.buttonText}>Cancelar</Text></Pressable></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Excluir playlist local" disabled={!ready || !!confirmation} onPress={() => {
          setMessage(null);
          setConfirmation({
            kind: 'delete'
          });
        }} style={styles.button}><Text style={styles.danger}>Excluir playlist</Text></Pressable><Text style={styles.description}>{playlist.tracks.length} músicas</Text></View>} ListEmptyComponent={<Text style={styles.description}>Esta playlist está vazia.</Text>} renderItem={({
        item
      }) => <View style={styles.row}><View style={styles.info}><Text style={styles.subtitle}>{item.title}</Text><Text style={styles.description}>{item.artist}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={'Remover da playlist: ' + item.title} disabled={!ready || !!confirmation} onPress={() => {
          setMessage(null);
          setConfirmation({
            kind: 'track',
            id: item.id,
            title: item.title
          });
        }} style={styles.button}><Text style={styles.danger}>Remover</Text></Pressable></View>} /></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    gap: 16
  },
  header: {
    gap: 16,
    paddingBottom: 16
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22
  },
  input: {
    minHeight: 52,
    padding: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    fontSize: 17
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  danger: {
    color: '#FFB6B6',
    fontSize: 14,
    fontWeight: '700'
  },
  confirmation: {
    padding: 16,
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.subtle,
    borderRadius: radius.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 5
  }
});
