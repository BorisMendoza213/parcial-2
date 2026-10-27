import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { productsRepository } from '../db/repositories/products';
import { syncProducts } from '../services/sync';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount } = useProducts();
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSync = async () => {
    if (!user?.id) {
      setMessage('No hay sesión activa.');
      return;
    }
    setSyncing(true);
    setMessage(null);
    try {
      const result = await syncProducts(user.id);
      if (result.upserted === 0 && result.downloaded === 0 && result.pending === 0) {
        setMessage('No hay productos pendientes.');
      } else {
        setMessage(`Sincronización completada: ${result.upserted} productos subidos y ${result.downloaded} descargados.`);
      }
    } catch (e: any) {
      setMessage(e.message || 'No se pudo sincronizar. Comprueba tu conexión.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('Eliminar producto', `¿Eliminar ${item.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await productsRepository.remove(item.id);
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mi Tienda Pro</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>
          <Pressable onPress={handleSignOut}>
            <Text style={styles.linkText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Productos</Text>
            <Text style={styles.summaryValue}>{products.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Unidades</Text>
            <Text style={styles.summaryValue}>{totalUnits}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Valor total</Text>
            <Text style={styles.summaryValue}>${totalValue.toLocaleString('es-CO')}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Pendientes de sincronización: {pendingCount}</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/producto')}>
            <Text style={styles.primaryButtonText}>Agregar producto</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, syncing && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            <Text style={styles.secondaryButtonText}>{syncing ? 'Sincronizando...' : 'Sincronizar'}</Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <FlatList
          data={filtered}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin productos</Text>
              <Text style={styles.emptySubtitle}>Agrega tu primer producto para comenzar</Text>
            </View>
          }
          renderItem={({ item }: any) => {
            const isPending = !item.syncedAt || item.syncedAt < item.updatedAt;
            const subtotal = (item.quantity || 0) * (item.price || 0);
            return (
              <Pressable
                style={styles.productCard}
                onLongPress={() => handleDelete(item)}
                onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
              >
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={[styles.syncBadge, isPending ? styles.syncPending : styles.syncOk]}>
                    {isPending ? 'Pendiente' : 'Sincronizado'}
                  </Text>
                </View>
                <View style={styles.productRow}>
                  <Text style={styles.productText}>Cantidad: {item.quantity}</Text>
                  <Text style={styles.productText}>Precio: ${item.price.toLocaleString('es-CO')}</Text>
                </View>
                <Text style={styles.productSubtotal}>Subtotal: ${subtotal.toLocaleString('es-CO')}</Text>
                <Text style={styles.hintText}>Pulsación larga para eliminar • Toca para editar</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF9' },
  container: { flex: 1, padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#14532D' },
  subtitle: { fontSize: 12, color: '#475569' },
  linkText: { color: '#166534', fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: 12, color: '#475569' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#14532D' },
  statusRow: { backgroundColor: '#FEF3C7', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  statusText: { color: '#92400E', fontSize: 13 },
  searchInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  primaryButton: { flex: 1, backgroundColor: '#166534', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  secondaryButton: { flex: 1, backgroundColor: '#E7F5EC', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#166534', fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  messageText: { color: '#166534', fontSize: 13 },
  listContainer: { gap: 10, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', gap: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  emptySubtitle: { color: '#475569' },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 8 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  syncBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  syncPending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  syncOk: { backgroundColor: '#DCFCE7', color: '#166534' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between' },
  productText: { color: '#475569' },
  productSubtotal: { fontWeight: '600', color: '#14532D' },
  hintText: { fontSize: 12, color: '#94A3B8' },
});
