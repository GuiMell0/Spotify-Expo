import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import AlbumScreen from '../screens/AlbumScreen';
import ArtistScreen from '../screens/ArtistScreen';
import PlayerScreen from '../screens/PlayerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackOptions = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function HomeFlow() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Playlist" component={PlaylistScreen} />
      <HomeStack.Screen name="Album" component={AlbumScreen} />
      <HomeStack.Screen name="Artist" component={ArtistScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
}

function SearchFlow() {
  return (
    <SearchStack.Navigator screenOptions={stackOptions}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Playlist" component={PlaylistScreen} />
      <SearchStack.Screen name="Album" component={AlbumScreen} />
      <SearchStack.Screen name="Artist" component={ArtistScreen} />
      <SearchStack.Screen name="Profile" component={ProfileScreen} />
    </SearchStack.Navigator>
  );
}

function LibraryFlow() {
  return (
    <LibraryStack.Navigator screenOptions={stackOptions}>
      <LibraryStack.Screen name="Library" component={LibraryScreen} />
      <LibraryStack.Screen name="Playlist" component={PlaylistScreen} />
      <LibraryStack.Screen name="Album" component={AlbumScreen} />
      <LibraryStack.Screen name="Artist" component={ArtistScreen} />
      <LibraryStack.Screen name="Profile" component={ProfileScreen} />
    </LibraryStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#080808', borderTopColor: '#080808', height: 72, paddingTop: 7, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            HomeTab: focused ? 'home' : 'home-outline',
            SearchTab: 'magnify',
            LibraryTab: focused ? 'bookshelf' : 'bookshelf',
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeFlow} options={{ title: 'Início' }} />
      <Tab.Screen name="SearchTab" component={SearchFlow} options={{ title: 'Buscar' }} />
      <Tab.Screen name="LibraryTab" component={LibraryFlow} options={{ title: 'Sua Biblioteca' }} />
    </Tab.Navigator>
  );
}

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.black, primary: colors.green },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={stackOptions} initialRouteName="Login">
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="Player" component={PlayerScreen} options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
