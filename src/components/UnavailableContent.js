import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import SafeAreaView from './ScreenSafeArea';
import BackButton from './BackButton';
import { colors, radius } from '../theme';

export default function UnavailableContent({ title = 'Conteúdo não encontrado' }) {
  return (
    <SafeAreaView style={styles.root}>
      <BackButton style={styles.back} />
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.message}>Este endereço não está disponível no catálogo demonstrativo.</Text>
        <Link href="/home" replace asChild>
          <Pressable accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>Ir para o início</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: 16 },
  back: { alignSelf: 'flex-start', width: 44, height: 44 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  message: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
  button: { backgroundColor: colors.green, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 24 },
  buttonText: { color: colors.black, fontWeight: '800' },
});
