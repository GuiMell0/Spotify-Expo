import * as SecureStore from 'expo-secure-store';
import { createVolatileSessionStorage } from './volatileSession.mjs';

export function createSessionStorage(clientId, { enabled = true } = {}) {
  if (!enabled) return createVolatileSessionStorage();
  const key = 'spotify_session_v1_' + clientId;
  const options = {
    keychainService: 'com.guimello.spotifyexpo.session',
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  return {
    persistent: true,
    read: () => SecureStore.getItemAsync(key, options),
    write: value => SecureStore.setItemAsync(key, value, options),
    remove: () => SecureStore.deleteItemAsync(key, options),
  };
}
