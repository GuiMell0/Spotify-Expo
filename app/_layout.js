import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LocalDataProvider } from '../src/contexts/LocalDataContext';
import LocalDataNotice from '../src/components/LocalDataNotice';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { HomeProvider } from '../src/contexts/HomeContext';
import { SearchProvider } from '../src/contexts/SearchContext';
import SessionLoadingScreen from '../src/screens/SessionLoadingScreen';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';
import { SessionProvider, useSession } from '../src/contexts/SessionContext';

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.black, primary: colors.green },
};

function RootNavigator() {
  const { canAccess, isRestoring, isEndingSession } = useSession();
  if (isRestoring || isEndingSession) return <SessionLoadingScreen ending={isEndingSession} />;
  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <View style={styles.root}>
      <LocalDataNotice />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!canAccess}><Stack.Screen name="login" /></Stack.Protected>
        <Stack.Screen name="callback" />
        <Stack.Protected guard={canAccess}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="album/[id]" />
          <Stack.Screen name="liked" />
          <Stack.Screen name="recent-searches" />
          <Stack.Screen name="local-playlist/new" />
          <Stack.Screen name="artist/[id]" />
          <Stack.Screen name="playlist/[id]" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="player" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <SessionProvider><LocalDataProvider><SearchProvider><HomeProvider><RootNavigator /></HomeProvider></SearchProvider></LocalDataProvider></SessionProvider>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
