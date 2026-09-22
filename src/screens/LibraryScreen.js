import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from '../components/Chip';
import MediaCard from '../components/MediaCard';
import MiniPlayer from '../components/MiniPlayer';
import { ASSETS, libraryItems } from '../data/media';
import { colors } from '../theme';

export default function LibraryScreen({ navigation }) {
  const [filter, setFilter] = useState('Playlists');
  const { width } = useWindowDimensions();
  // Dois cards + margens internas do MediaCard dentro dos 14 px laterais.
  const cardWidth = (width - 58) / 2;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate('Profile')}><Image source={ASSETS.profile} style={styles.avatar} /></Pressable>
            <Text style={styles.title}>Sua Biblioteca</Text>
            <MaterialCommunityIcons name="magnify" size={27} color={colors.text} style={{ marginLeft: 'auto' }} />
            <MaterialCommunityIcons name="plus" size={30} color={colors.text} style={{ marginLeft: 17 }} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {['Playlists', 'Podcasts', 'Álbuns', 'Artistas'].map((item) => (
              <Chip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
            ))}
          </ScrollView>
          <View style={styles.sortRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="swap-vertical" size={20} color={colors.text} />
              <Text style={styles.sortText}>Recentes</Text>
            </View>
            <MaterialCommunityIcons name="view-grid-outline" size={21} color={colors.text} />
          </View>
          <View style={styles.grid}>
            {libraryItems.map((item) => (
              <MediaCard key={item.id} item={item} width={cardWidth} onPress={() => navigation.navigate(item.target)} />
            ))}
          </View>
        </ScrollView>
        <MiniPlayer navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: 14, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  filters: { gap: 8, paddingVertical: 20 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sortText: { color: colors.text, fontSize: 13, fontWeight: '700', marginLeft: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 23 },
});
