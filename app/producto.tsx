import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { productsRepository } from '../db/repositories/products';

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      productsRepository.getById(Number(id)).then((product) => {
        if (product) {
          setName(product.name);
          setQuantity(String(product.quantity));
          setPrice(String(product.price));
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    setError(null);
    const qty = Number(quantity);
    const prc = Number(price);

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!Number.isInteger(qty) || qty < 0) {
      setError('La cantidad debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (!Number.isInteger(prc) || prc < 0) {
      setError('El precio debe ser un número entero mayor o igual a 0.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await productsRepository.update(Number(id), { name, quantity: qty, price: prc });
      } else {
        await productsRepository.create({ name, quantity: qty, price: prc });
      }
      router.back();
    } catch (e: any) {
      setError('No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!isEdit) return;
    Alert.alert('Eliminar producto', '¿Eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await productsRepository.remove(Number(id));
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>Cancelar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Arroz 1kg"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Precio (COP)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>

          {isEdit ? (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Eliminar producto</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF9' },
  container: { flex: 1, padding: 16, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#14532D' },
  linkText: { color: '#166534', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, gap: 12 },
  label: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#F8FAF9' },
  errorText: { color: '#DC2626', fontSize: 14 },
  button: { backgroundColor: '#166534', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deleteButton: { borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  deleteButtonText: { color: '#DC2626', fontWeight: '600' },
});
