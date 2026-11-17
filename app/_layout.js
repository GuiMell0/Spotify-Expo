import React from 'react';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!canAccess}><Stack.Screen name="login" /></Stack.Protected>
        <Stack.Screen name="callback" />
        <Stack.Protected guard={canAccess}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="album/[id]" />
          <Stack.Screen name="artist/[id]" />
          <Stack.Screen name="playlist/[id]" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="player" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <SessionProvider><RootNavigator /></SessionProvider>;
}
