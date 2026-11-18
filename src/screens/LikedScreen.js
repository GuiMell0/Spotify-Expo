import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLikedTracks } from '../hooks/useLikedTracks';
import { useSearch } from '../contexts/SearchContext';
import { useSession } from '../contexts/SessionContext';
import BackButton from '../components/BackButton';
import LikeTrackButton from '../components/LikeTrackButton';
import { colors, radius } from '../theme';

export default function LikedScreen() {
  const router = useRouter();
  const { search } = useSearch();
  const { isDemo, signOut } = useSession();
  const { state, entries } = useLikedTracks();
  const loading = ['idle', 'loading'].includes(state.status);
  function open(track) {
    search.rememberEntity(track);
    router.push(track.href);
  }
  function empty() {
    if (isDemo || state.status === 'disabled') return <View style={styles.empty}><Text style={styles.emptyTitle}>Suas favoritas começam com sua conta</Text><Text style={styles.description}>Entre com Spotify para salvar músicas neste aparelho.</Text><Pressable accessibilityRole="button" onPress={signOut} style={styles.action}><Text style={styles.actionText}>Ir para o login</Text></Pressable></View>;
    if (loading) return <View style={styles.empty}><ActivityIndicator color={colors.green} /><Text style={styles.description}>Carregando suas músicas…</Text></View>;
    if (state.status === 'error') return <View style={styles.empty}><Text style={styles.description}>Não foi possível carregar suas favoritas. Use Tentar novamente no aviso acima.</Text></View>;
    return <View style={styles.empty}><MaterialCommunityIcons name="heart-outline" size={52} color={colors.muted} /><Text style={styles.emptyTitle}>Nenhuma música curtida ainda</Text><Text style={styles.description}>Toque no coração de uma música na busca, no álbum ou nos detalhes da faixa.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/search')} style={styles.action}><Text style={styles.actionText}>Buscar músicas</Text></Pressable></View>;
  }
  return <View style={styles.root}>
    <LinearGradient colors={['#40227F', colors.background]} locations={[0, 0.55]} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <FlatList data={entries} keyExtractor={item => item.track.id} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View style={styles.header}><BackButton style={styles.back} /><LinearGradient colors={['#4C22A9', '#97B9A8']} style={styles.art}><MaterialCommunityIcons name="heart" size={68} color={colors.text} /></LinearGradient><Text accessibilityRole="header" style={styles.title}>Músicas curtidas</Text><Text style={styles.description}>Suas favoritas salvas neste aparelho</Text>{state.data && <Text accessibilityLiveRegion="polite" style={styles.count}>{entries.length} {entries.length === 1 ? 'música' : 'músicas'}</Text>}{state.status === 'saving' && <Text accessibilityLiveRegion="polite" style={styles.count}>Salvando alteração…</Text>}{state.status === 'error' && entries.length > 0 && <Text style={styles.description}>Esta é a última lista carregada. Recarregue os dados pelo aviso acima.</Text>}</View>}
        ListEmptyComponent={empty}
        renderItem={({ item }) => <View style={styles.row}><Pressable accessibilityRole="button" accessibilityLabel={'Abrir música curtida ' + item.track.title} onPress={() => open(item.track)} style={({ pressed }) => [styles.open, pressed && styles.pressed]}>
          {item.track.image ? <Image source={item.track.image} resizeMode="contain" style={styles.cover} /> : <View style={styles.placeholder}><MaterialCommunityIcons name="music-note" size={25} color={colors.muted} /></View>}
          <View style={styles.info}><Text numberOfLines={2} style={styles.trackTitle}>{item.track.title}</Text><Text numberOfLines={1} style={styles.artist}>{item.track.artist}</Text></View>
          {item.track.duration && <Text style={styles.duration}>{item.track.duration}</Text>}
        </Pressable><LikeTrackButton track={item.track} /></View>}
      />
    </SafeAreaView>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 30 },
  header: { paddingTop: 8, gap: 15, paddingBottom: 24 }, back: { width: 44, height: 44 },
  art: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderRadius: radius.sm, marginVertical: 8 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' }, description: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  count: { color: colors.text, fontSize: 13, lineHeight: 20 }, row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  open: { flex: 1, minHeight: 80, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.sm },
  cover: { width: 52, height: 52, backgroundColor: colors.surface }, placeholder: { width: 52, height: 52, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 }, trackTitle: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 }, artist: { color: colors.muted, fontSize: 12, marginTop: 4 },
  duration: { color: colors.muted, fontSize: 12 }, pressed: { backgroundColor: colors.surface },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 36, gap: 16 },
  emptyTitle: { color: colors.text, fontSize: 21, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  action: { minHeight: 48, paddingHorizontal: 23, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.green, marginTop: 8 },
  actionText: { color: colors.black, fontWeight: '800', fontSize: 14 },
});
