import { useMiniPlayerVisible } from '../../src/hooks/useMiniPlayerVisible';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const miniVisible = useMiniPlayerVisible();
  const bottomPadding = miniVisible ? 8 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      initialRouteName="home"
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: [styles.tabBar, { height: 64 + bottomPadding, paddingBottom: bottomPadding }],
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, size, focused }) => {
          const icons = { home: focused ? 'home' : 'home-outline', search: 'magnify', library: 'bookshelf' };
          return <MaterialCommunityIcons accessible={false} importantForAccessibility="no-hide-descendants" name={icons[route.name]} size={size + 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Início' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="library" options={{ title: 'Sua Biblioteca' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#080808', borderTopColor: '#080808', paddingTop: 7 },
  label: { fontSize: 11, fontWeight: '600' },
});
