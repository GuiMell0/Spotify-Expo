import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import MiniPlayer from '../components/MiniPlayer';
import { ASSETS, libraryItems } from '../data/media';
import { colors, radius } from '../theme';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#EC6196', '#77344D', colors.background]} locations={[0, 0.31, 0.58]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} style={styles.back} />
          <View style={styles.profileRow}>
            <Image source={ASSETS.profile} style={styles.avatar} />
            <View style={{ flex: 1 }}><Text style={styles.name}>anna</Text><Text style={styles.stats}>6 seguidores • 50 seguindo</Text></View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.edit}><Text style={styles.editText}>Editar</Text></Pressable>
            <IconButton name="cog-outline" size={26} />
            <IconButton name="dots-vertical" size={25} />
          </View>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Playlists</Text><Text style={styles.manage}>✎  Gerenciar</Text></View>
          {libraryItems.slice(0, 4).map((item) => (
            <Pressable key={item.id} onPress={() => navigation.navigate(item.target)} style={styles.playlistRow}>
              <Image source={item.image} style={styles.playlistImage} />
              <View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.playlistTitle}>{item.title}</Text><Text style={styles.playlistSub}>{item.subtitle}</Text></View>
              <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.muted} />
            </Pressable>
          ))}
          <Pressable style={styles.allButton}><Text style={styles.allText}>Ver todas as playlists</Text></Pressable>
        </ScrollView>
        <MiniPlayer navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { paddingBottom: 100 }, back: { marginLeft: 15, marginTop: 4, alignSelf: 'flex-start' },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 21 }, avatar: { width: 108, height: 108, borderRadius: 54, marginRight: 18 },
  name: { color: colors.text, fontSize: 29, fontWeight: '900' }, stats: { color: colors.text, fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginHorizontal: 24, marginTop: 25 }, edit: { borderWidth: 1, borderColor: '#999', borderRadius: radius.pill, paddingHorizontal: 17, paddingVertical: 8 }, editText: { color: colors.text, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 18, marginTop: 35, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900' }, manage: { color: colors.text, fontSize: 12, fontWeight: '600' },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, paddingVertical: 6 }, playlistImage: { width: 56, height: 56, marginRight: 12 },
  playlistTitle: { color: colors.text, fontSize: 15, fontWeight: '600' }, playlistSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  allButton: { borderWidth: 1, borderColor: '#777', borderRadius: radius.pill, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 9, marginTop: 23 }, allText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
