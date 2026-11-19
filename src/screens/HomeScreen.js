import { useOpenTrack } from '../hooks/useOpenTrack';
import { useLocalData } from '../contexts/LocalDataContext';
import { displayNameForAccount } from '../services/localDisplayName.mjs';
import React, { useCallback } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import { useSession } from '../contexts/SessionContext';
import { useHome } from '../contexts/HomeContext';
import { useSearch } from '../contexts/SearchContext';
import { HOME_TOPICS } from '../services/spotifyHome.mjs';
import ApiFeedback from '../components/ApiFeedback';
import DemoHomeScreen from './DemoHomeScreen';
import { colors, radius } from '../theme';

const labels = { track: 'Música', album: 'Álbum', artist: 'Artista' };
const icons = { track: 'music-note', album: 'album', artist: 'account-music' };

export default function HomeScreen() {
  const { isDemo } = useSession();
  return isDemo ? <DemoHomeScreen /> : <SpotifyHomeScreen />;
}

function SpotifyHomeScreen() {
  const openTrackSelection = useOpenTrack();
  const router = useRouter();
  const { session } = useSession();
  const { state: localState } = useLocalData();
  const { home, state } = useHome();
  const { search } = useSearch();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(170, Math.max(132, (width - 48) / 2.25));
  useFocusEffect(useCallback(() => {
    home.setActive(true);
    return () => { home.setActive(false); };
  }, [home]));
  const topic = HOME_TOPICS.find(item => item.id === state.topic);
  const busy = state.status === 'loading';
  const sections = state.sections.filter(section => section.items.length > 0);
  const shortcuts = sections.flatMap(section => section.items.slice(0, 2));
  const name = displayNameForAccount(localState.data, session?.user.displayName || session?.user.id || 'Spotify');
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase() || '♪';
  function open(item) {
    if (item.type === 'track') openTrackSelection(item, sections.flatMap(section => section.items).filter(entry => entry.type === 'track'));
    else { search.rememberEntity(item); router.push(item.href); }
  }
  function discover(type = 'all') {
    search.setFilter(type);
    search.setQuery(topic.query);
    router.push('/search');
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#234630', colors.background]} style={StyleSheet.absoluteFill} locations={[0, 0.35]} />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={busy} onRefresh={home.refresh} tintColor={colors.green} colors={[colors.green]} />}>
          <View style={styles.topbar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')} style={styles.avatar}>
              {session?.user.imageUrl ? <Image source={{ uri: session.user.imageUrl }} style={styles.avatarImage} /> : <Text style={styles.initial}>{initial}</Text>}
            </Pressable>
            <View style={styles.greeting}><Text numberOfLines={1} style={styles.name}>Olá, {name}</Text><Text style={styles.sessionLabel}>Conta Spotify conectada</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Atualizar início" accessibilityState={{ disabled: busy }} disabled={busy} onPress={home.refresh} style={[styles.iconButton, busy && styles.disabled]}><MaterialCommunityIcons name="refresh" size={26} color={colors.text} /></Pressable>
          </View>
          <View style={styles.themeRow}>{HOME_TOPICS.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'Explorar ' + item.label} accessibilityState={{ selected: state.topic === item.id }} onPress={() => home.setTopic(item.id)} style={[styles.topic, state.topic === item.id && styles.selected]}><Text style={[styles.topicText, state.topic === item.id && styles.selectedText]}>{item.label}</Text></Pressable>)}
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir busca" onPress={() => router.push('/search')} style={styles.searchShortcut}><MaterialCommunityIcons name="magnify" size={23} color={colors.text} /></Pressable>
          </View>
          <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Explore {topic.label}</Text><MaterialCommunityIcons name="spotify" size={27} color={colors.green} /></View>
          <Text style={styles.description}>Músicas, álbuns e artistas para conhecer.</Text>
          <View style={styles.feedback}><ApiFeedback loading={busy} error={state.error} onRetry={home.refresh} retryLabel="Tentar atualizar início" /></View>
          {state.status === 'paused' && <ApiFeedback message="Atualização interrompida." onRetry={home.refresh} retryLabel="Atualizar início" />}
          {!!state.error && sections.length > 0 && <Text style={styles.notice}>Não foi possível atualizar. Estes são os itens carregados anteriormente.</Text>}
          {state.status === 'ready' && sections.length === 0 && <View style={styles.empty}><MaterialCommunityIcons name="music-note-outline" size={52} color={colors.muted} /><Text style={styles.emptyTitle}>Nenhum item encontrado neste tema.</Text><Text style={styles.description}>Escolha outro tema ou procure no Spotify.</Text><Pressable accessibilityRole="button" onPress={() => discover()} style={styles.emptyAction}><Text style={styles.emptyActionText}>Pesquisar no Spotify</Text></Pressable></View>}
          {shortcuts.length > 0 && <View style={styles.quickGrid}>{shortcuts.map(item => <Pressable key={item.type + ':' + item.id} accessibilityRole="button" accessibilityLabel={'Abrir destaque ' + labels[item.type] + ' ' + item.title} onPress={() => open(item)} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
            <Artwork item={item} compact />
            <View style={styles.quickInfo}><Text numberOfLines={2} style={styles.quickTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.quickType}>{labels[item.type]}</Text></View>
          </Pressable>)}</View>}
          {sections.map(section => <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text><Pressable accessibilityRole="button" accessibilityLabel={'Ver mais ' + section.title.toLowerCase()} onPress={() => discover(section.type)} style={styles.more}><Text style={styles.moreText}>Ver mais</Text></Pressable></View>
            <ScrollView keyboardDismissMode="on-drag" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
              {section.items.map(item => <Pressable key={item.type + ':' + item.id} accessibilityRole="button" accessibilityLabel={'Abrir ' + labels[item.type] + ' ' + item.title} onPress={() => open(item)} style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.pressed]}>
                <Artwork item={item} />
                <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.cardSubtitle}>{item.subtitle}</Text>
              </Pressable>)}
            </ScrollView>
          </View>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
function Artwork({ item, compact = false }) {
  const style = [compact ? styles.quickArt : styles.art, item.type === 'artist' && styles.roundArt];
  return item.image ? <Image source={item.image} resizeMode="contain" style={style} /> : <View style={[...style, styles.artPlaceholder]}><MaterialCommunityIcons name={icons[item.type]} size={compact ? 25 : 45} color={colors.muted} /></View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 }, content: { paddingHorizontal: 16, paddingBottom: 34 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#315840', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 44, height: 44 }, initial: { color: colors.text, fontWeight: '800', fontSize: 19 }, greeting: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' }, sessionLabel: { color: colors.muted, fontSize: 11, marginTop: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.5 },
  themeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 24 },
  topic: { minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: 18, backgroundColor: colors.surface },
  topicText: { color: colors.text, fontSize: 13, fontWeight: '700' }, selected: { backgroundColor: colors.green }, selectedText: { color: colors.black },
  searchShortcut: { marginLeft: 'auto', width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: colors.surface },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, title: { flex: 1, color: colors.text, fontSize: 28, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 8 }, feedback: { marginTop: 18 },
  notice: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginTop: 18 }, quickCard: { width: '48%', minHeight: 62, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderRadius: radius.sm },
  quickArt: { width: 54, height: 62, backgroundColor: '#292929' }, quickInfo: { flex: 1, paddingHorizontal: 8 }, quickTitle: { color: colors.text, fontWeight: '700', fontSize: 12, lineHeight: 16 }, quickType: { color: colors.muted, fontSize: 10, marginTop: 3 },
  section: { marginTop: 26 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 22, fontWeight: '800' }, more: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, moreText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  cards: { gap: 14, paddingBottom: 6, paddingTop: 12 }, card: { gap: 6 }, art: { width: '100%', aspectRatio: 1, backgroundColor: colors.surface }, roundArt: { borderRadius: 100 },
  artPlaceholder: { alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 }, cardSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.72 }, empty: { alignItems: 'center', paddingVertical: 40, gap: 14 }, emptyTitle: { color: colors.text, fontWeight: '700', fontSize: 18, textAlign: 'center' },
  emptyAction: { minHeight: 48, borderRadius: radius.pill, justifyContent: 'center', paddingHorizontal: 22, backgroundColor: colors.green, marginTop: 10 }, emptyActionText: { color: colors.black, fontWeight: '800' },
});
