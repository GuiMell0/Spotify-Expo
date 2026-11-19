// O navegador não persiste tokens em localStorage ou AsyncStorage.
export function createVolatileSessionStorage() {
  return { persistent: false, read: async () => null, write: async () => {}, remove: async () => {} };
}
