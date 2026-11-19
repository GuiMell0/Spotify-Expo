import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaView from '../components/ScreenSafeArea';
import Chip from '../components/Chip';
import MediaCard from '../components/MediaCard';
import MiniPlayer from '../components/DemoMiniPlayer';
import { ASSETS, homeAlbums, quickItems } from '../data/media';
import { colors, radius } from '../theme';
import { useSession } from '../contexts/SessionContext';

export default function DemoHomeScreen() {
  const router = useRouter();
  const { isDemo } = useSession();
  const [filter, setFilter] = useState('Tudo');
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(155, (width - 47) / 2.25);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#244431', colors.background]} style={StyleSheet.absoluteFill} locations={[0, 0.44]} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView keyboardDismissMode="on-drag" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')}>
              <Image source={ASSETS.profile} style={styles.avatar} />
            </Pressable>
            <View style={styles.chips}>
              {['Tudo', 'Música', 'Podcasts'].map((item) => (
                <Chip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
              ))}
            </View>
          </View>

          <Text style={styles.sessionLabel}>{isDemo ? 'Modo demonstração' : 'Conta Spotify conectada'}</Text>
          <View style={styles.quickGrid}>
            {quickItems.map((item) => (
              <Pressable key={item.id} onPress={() => router.push(item.href)} style={styles.quickCard}>
                <Image source={item.image} style={styles.quickImage} />
                <Text numberOfLines={2} style={styles.quickTitle}>{item.title}</Text>
                <MaterialCommunityIcons name="dots-horizontal" size={18} color={colors.muted} style={styles.quickDots} />
              </Pressable>
            ))}
          </View>

          <Section title="Seus mixes mais ouvidos" items={homeAlbums} cardWidth={cardWidth} />
          <Section title="Feito para anna" items={[...homeAlbums].reverse()} cardWidth={cardWidth} />
        </ScrollView>
        <MiniPlayer />
      </SafeAreaView>
    </View>
  );
}

function Section({ title, items, cardWidth }) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView keyboardDismissMode="on-drag" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 6 }}>
        {items.map((item) => (
          <MediaCard key={item.id} item={item} width={cardWidth} onPress={() => router.push(item.href)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { paddingHorizontal: 12, paddingBottom: 96 },
  topbar: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 9, borderWidth: 1, borderColor: '#767676' },
  chips: { flexDirection: 'row', gap: 7 },
  sessionLabel: { color: colors.muted, fontSize: 12, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  quickCard: { width: '48.8%', minHeight: 58, backgroundColor: '#2A2A2A', borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  quickImage: { width: 58, height: 58, backgroundColor: colors.surface },
  quickTitle: { color: colors.text, fontWeight: '700', fontSize: 12, flex: 1, paddingHorizontal: 9 },
  quickDots: { marginRight: 5 },
  section: { marginTop: 28 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 14 },
});
