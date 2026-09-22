import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MiniPlayer from '../components/MiniPlayer';
import { ASSETS, homeAlbums } from '../data/media';
import { colors, radius } from '../theme';

const categories = [
  { title: 'Música', color: '#DC148C', image: ASSETS.albumRed, target: 'Playlist' },
  { title: 'Podcasts', color: '#006450', image: ASSETS.albumBlue, target: 'Playlist' },
  { title: 'Eventos ao vivo', color: '#8400E7', image: ASSETS.artist, target: 'Artist' },
  { title: 'Feito para você', color: '#1E3264', image: ASSETS.albumNeon, target: 'Playlist' },
  { title: 'Lançamentos', color: '#E8115B', image: ASSETS.misadventures, target: 'Album' },
  { title: 'Rock', color: '#8D67AB', image: ASSETS.albumDark, target: 'Artist' },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const results = homeAlbums.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Buscar</Text>
            <MaterialCommunityIcons name="camera-outline" size={27} color={colors.text} />
          </View>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={25} color={colors.black} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="O que você quer ouvir?"
              placeholderTextColor="#555"
              style={styles.input}
              returnKeyType="search"
            />
            {!!query && <Pressable onPress={() => setQuery('')}><MaterialCommunityIcons name="close-circle" size={21} color="#555" /></Pressable>}
          </View>

          {query ? (
            <View style={styles.results}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              {results.map((item) => (
                <Pressable key={item.id} onPress={() => navigation.navigate(item.target)} style={styles.resultRow}>
                  <Image source={item.image} style={styles.resultImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultSub}>{item.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={25} color={colors.muted} />
                </Pressable>
              ))}
              {!results.length && <Text style={styles.empty}>Nenhum resultado neste protótipo.</Text>}
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Navegar por todas as seções</Text>
              <View style={styles.grid}>
                {categories.map((category) => (
                  <Pressable key={category.title} onPress={() => navigation.navigate(category.target)} style={[styles.category, { backgroundColor: category.color }]}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Image source={category.image} style={styles.categoryImage} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
        <MiniPlayer navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: 14, paddingBottom: 94 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { color: colors.text, fontSize: 29, fontWeight: '900' },
  searchBox: { height: 51, borderRadius: radius.md, backgroundColor: colors.text, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  input: { flex: 1, color: colors.black, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 26, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  category: { width: '48.4%', height: 102, borderRadius: radius.md, overflow: 'hidden', marginBottom: 13, padding: 12 },
  categoryTitle: { color: colors.text, fontSize: 16, fontWeight: '900', width: '76%', zIndex: 1 },
  categoryImage: { position: 'absolute', width: 65, height: 65, right: -9, bottom: -7, transform: [{ rotate: '24deg' }], borderRadius: 4 },
  results: { marginTop: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  resultImage: { width: 58, height: 58, borderRadius: radius.sm, marginRight: 12 },
  resultTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  resultSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 60 },
});
