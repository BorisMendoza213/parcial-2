import { useEffect, useState } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { getDb, type AppDatabase } from '../db';
import migrations from '../drizzle/migrations';
import { View, ActivityIndicator, Text } from 'react-native';

type MigrationsProps = {
  db: AppDatabase;
  children: React.ReactNode;
};

function Migrations({ db, children }: MigrationsProps) {
  const { success, error } = useMigrations(db, migrations as any);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#DC2626', textAlign: 'center' }}>
          Error al aplicar migraciones: {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAF9' }}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return <>{children}</>;
}

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    getDb()
      .then((value) => {
        if (active) setDb(() => value);
      })
      .catch((error) => {
        if (active) setInitError(error as Error);
      });
    return () => {
      active = false;
    };
  }, []);

  if (initError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#DC2626', textAlign: 'center' }}>
          Error al abrir la base de datos: {initError.message}
        </Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAF9' }}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return <Migrations db={db}>{children}</Migrations>;
}
