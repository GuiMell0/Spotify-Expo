import { createVolatileSessionStorage } from './volatileSession.mjs';

export function createSessionStorage() {
  return createVolatileSessionStorage();
}
