import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const CHUNK_SIZE = 2000;
const CHUNK_COUNT_SUFFIX = '_chunks';
const CHUNK_INDEX_SUFFIX = '_chunk_';

const webStorage: StorageAdapter = {
  getItem: (key) => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

async function deleteChunks(key: string, count: number) {
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(`${key}${CHUNK_INDEX_SUFFIX}${index}`);
  }
}

const nativeStorage: StorageAdapter = {
  async getItem(key) {
    const countRaw = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    if (countRaw == null) {
      return SecureStore.getItemAsync(key);
    }

    const count = Number(countRaw);
    if (!Number.isInteger(count) || count <= 0) {
      return null;
    }

    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${key}${CHUNK_INDEX_SUFFIX}${index}`);
      if (part == null) {
        return null;
      }
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key, value) {
    const previousCountRaw = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    const previousCount = Number(previousCountRaw) || 0;

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
      await deleteChunks(key, previousCount);
      return;
    }

    const chunks: string[] = [];
    for (let index = 0; index < value.length; index += CHUNK_SIZE) {
      chunks.push(value.slice(index, index + CHUNK_SIZE));
    }

    for (let index = 0; index < chunks.length; index += 1) {
      await SecureStore.setItemAsync(`${key}${CHUNK_INDEX_SUFFIX}${index}`, chunks[index]);
    }
    await SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));
    await SecureStore.deleteItemAsync(key);
    await deleteChunks(key, Math.max(0, previousCount - chunks.length));
  },

  async removeItem(key) {
    const countRaw = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    const count = Number(countRaw) || 0;
    await SecureStore.deleteItemAsync(key);
    await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    await deleteChunks(key, count);
  },
};

const SecureStoreAdapter: StorageAdapter =
  Platform.OS === 'web' ? webStorage : nativeStorage;

export default SecureStoreAdapter;
