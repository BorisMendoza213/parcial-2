import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { productsRepository, type Product } from '../db/repositories/products';

export function useProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await productsRepository.getAll();
        if (active) {
          setItems(data);
          setError(undefined);
        }
      } catch (e) {
        if (active) setError(e as Error);
      }
    };

    load();

    const listener = addDatabaseChangeListener(({ tableName }) => {
      if (tableName === 'products') void load();
    });

    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  const pendingCount = items.filter((item) => !item.syncedAt || item.syncedAt < item.updatedAt).length;

  return {
    products: items,
    totalUnits,
    totalValue,
    pendingCount,
    isLoading: false,
    error,
  };
}
