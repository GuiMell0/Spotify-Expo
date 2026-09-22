import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import { ASSETS } from '../data/media';
import { colors, radius } from '../theme';

export default function PlayerScreen({ navigation }) {
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(true);

  const goToHome = () => {
    navigation.navigate('Main', {
      screen: 'HomeTab',
      params: { screen: 'Home' },
    });
  };

  return (
    <LinearGradient colors={['#8C8C8C', '#5D5D5D', '#202020']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <IconButton
              name="chevron-down"
              size={32}
              onPress={goToHome}
              style={styles.backButton}
              accessibilityLabel="Voltar para a Home"
            />
            <View><Text style={styles.context}>TOCANDO DA PLAYLIST</Text><Text style={styles.contextTitle}>daily</Text></View>
            <IconButton name="dots-vertical" />
          </View>
          <Image source={ASSETS.playerCover} style={styles.cover} resizeMode="cover" />
          <View style={styles.metaRow}>
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.title}>Bedless</Text><Text style={styles.artist}>Pierce The Veil</Text></View>
            <Pressable onPress={() => setLiked((value) => !value)}><MaterialCommunityIcons name={liked ? 'check-circle' : 'heart-outline'} size={27} color={liked ? colors.green : colors.text} /></Pressable>
          </View>
          <View style={styles.progress}><View style={styles.progressFill} /><View style={styles.knob} /></View>
          <View style={styles.times}><Text style={styles.time}>0:24</Text><Text style={styles.time}>3:29</Text></View>
          <View style={styles.controls}>
            <MaterialCommunityIcons name="shuffle-variant" size={25} color={colors.green} />
            <MaterialCommunityIcons name="skip-previous" size={39} color={colors.text} />
            <Pressable onPress={() => setPlaying((value) => !value)} style={styles.mainButton}>
              <MaterialCommunityIcons name={playing ? 'pause' : 'play'} size={43} color={colors.black} />
            </Pressable>
            <MaterialCommunityIcons name="skip-next" size={39} color={colors.text} />
            <MaterialCommunityIcons name="repeat" size={25} color={colors.text} />
          </View>
          <View style={styles.devices}>
            <MaterialCommunityIcons name="devices" size={22} color={colors.text} />
            <View style={{ flexDirection: 'row', gap: 22 }}><MaterialCommunityIcons name="share-variant-outline" size={22} color={colors.text} /><MaterialCommunityIcons name="playlist-music-outline" size={24} color={colors.text} /></View>
          </View>
          <View style={styles.lyrics}><View><Text style={styles.lyricsTitle}>Letra</Text><Text style={styles.lyricsText}>"Why the fuck am I falling apart?"</Text></View><MaterialCommunityIcons name="arrow-expand" size={22} color={colors.text} /></View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, safe: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { paddingBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)' },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, context: { color: colors.text, fontSize: 9, textAlign: 'center', fontWeight: '600' }, contextTitle: { color: colors.text, fontSize: 12, textAlign: 'center', fontWeight: '800', marginTop: 3 },
  cover: { width: '100%', aspectRatio: 1, maxHeight: 390, alignSelf: 'center', marginTop: 12, borderRadius: 3, backgroundColor: colors.surface },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 27, gap: 17 }, title: { color: colors.text, fontSize: 17, fontWeight: '800', lineHeight: 22 }, artist: { color: colors.muted, fontSize: 14, marginTop: 5 },
  progress: { height: 4, borderRadius: 2, backgroundColor: '#9B9B9B', marginTop: 24 }, progressFill: { width: '18%', height: 4, borderRadius: 2, backgroundColor: colors.text }, knob: { position: 'absolute', left: '17%', top: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.text },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, time: { color: '#D0D0D0', fontSize: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }, mainButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  devices: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  lyrics: { backgroundColor: '#555', borderRadius: radius.lg, padding: 17, marginTop: 24, minHeight: 90, flexDirection: 'row', justifyContent: 'space-between' }, lyricsTitle: { color: colors.text, fontSize: 16, fontWeight: '900' }, lyricsText: { color: colors.text, fontSize: 13, marginTop: 9, opacity: 0.85 },
});
