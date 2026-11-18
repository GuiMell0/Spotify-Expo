import { createAsyncStorageDriver, createLocalDataRepository } from './localDataRepository.mjs';

// A avaliação tardia permite orientar quem ainda está com o APK sem o módulo nativo.
const driver = createAsyncStorageDriver(async () => (await import('@react-native-async-storage/async-storage')).default);
export const localDataRepository = createLocalDataRepository(driver);
