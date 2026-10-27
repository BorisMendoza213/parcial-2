import { Platform } from 'react-native';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

let database: AppDatabase | null = null;

const ready: Promise<AppDatabase> = (async () => {
  if (Platform.OS === 'web') {
    const warmup = await openDatabaseAsync('mitienda.db');
    await warmup.closeAsync();
  }
  database = drizzle(openDatabaseSync('mitienda.db'), { schema });
  return database;
})();

export function getDb(): Promise<AppDatabase> {
  return ready;
}

export { schema };
