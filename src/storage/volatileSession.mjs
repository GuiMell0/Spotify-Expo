// O navegador e a demonstração não persistem tokens em localStorage ou AsyncStorage.
export function createVolatileSessionStorage() {
  return { persistent: false, read: async () => null, write: async () => {}, remove: async () => {} };
}
