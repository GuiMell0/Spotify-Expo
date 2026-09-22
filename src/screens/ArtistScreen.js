import React from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import MiniPlayer from '../components/MiniPlayer';
import TrackRow from '../components/TrackRow';
import { ASSETS, tracks } from '../data/media';
import { colors, radius } from '../theme';

export default function ArtistScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground source={ASSETS.artist} style={styles.hero} imageStyle={{ opacity: 0.78 }}>
          <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)', colors.background]} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <IconButton name="arrow-left" onPress={() => navigation.goBack()} style={styles.back} />
            <View style={styles.heroText}>
              <Text style={styles.artistName}>Pierce The Veil</Text>
              <View style={styles.verified}><MaterialCommunityIcons name="check-decagram" size={17} color="#3D91F4" /><Text style={styles.verifiedText}>Verificado pelo Spotify</Text></View>
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View style={styles.body}>
          <Text style={styles.listeners}>10,2 mi ouvintes mensais</Text>
          <View style={styles.actions}>
            <Pressable style={styles.follow}><Text style={styles.followText}>Seguindo</Text></Pressable>
            <IconButton name="dots-vertical" size={25} color={colors.muted} />
            <MaterialCommunityIcons name="shuffle-variant" size={27} color={colors.muted} style={{ marginLeft: 'auto' }} />
            <Pressable onPress={() => navigation.navigate('Player')} style={styles.play}><MaterialCommunityIcons name="play" size={35} color={colors.black} /></Pressable>
          </View>
          <View style={styles.tabs}><Text style={styles.tabActive}>Músicas</Text><Text style={styles.tab}>Eventos</Text><Text style={styles.tab}>Sobre</Text></View>
          <Text style={styles.sectionTitle}>Mais ouvidas</Text>
          {tracks.slice(0, 5).map((track, index) => <TrackRow key={track.id} track={track} index={index} showIndex liked={index === 0} onPress={() => navigation.navigate('Player')} />)}
        </View>
      </ScrollView>
      <MiniPlayer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { paddingBottom: 96 },
  hero: { height: 360, justifyContent: 'flex-end' }, heroSafe: { flex: 1 },
  back: { marginLeft: 14, marginTop: 6, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.42)' },
  heroText: { marginTop: 'auto', padding: 18, paddingBottom: 30 }, artistName: { color: colors.text, fontSize: 43, lineHeight: 48, fontWeight: '900' },
  verified: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }, verifiedText: { color: colors.text, marginLeft: 6, fontSize: 12, fontWeight: '600' },
  body: { marginTop: -10 }, listeners: { color: colors.muted, fontSize: 13, marginHorizontal: 17 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16 }, follow: { borderWidth: 1, borderColor: '#777', borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  followText: { color: colors.text, fontSize: 13, fontWeight: '700' }, play: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', gap: 25, paddingHorizontal: 17, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab: { color: colors.muted, paddingBottom: 11, fontWeight: '600' }, tabActive: { color: colors.text, paddingBottom: 10, borderBottomColor: colors.green, borderBottomWidth: 2, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900', margin: 17 },
});
