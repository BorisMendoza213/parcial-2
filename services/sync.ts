import { supabase } from '../lib/supabase';
import { productsRepository } from '../db/repositories/products';

type SyncResult = {
  upserted: number;
  downloaded: number;
  pending: number;
};

export async function syncProducts(userId: string): Promise<SyncResult> {
  const now = Date.now();
  let upserted = 0;
  let downloaded = 0;

  // Paso A: descargar
  const { data: remoteProducts, error: downloadError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId);

  if (downloadError) {
    if (downloadError.code === 'PGRST205' || downloadError.message?.includes('relation "public.products" does not exist')) {
      throw new Error('La tabla "products" no existe en Supabase todavía. Ejecuta supabase/schema.sql en Supabase.');
    }
    throw downloadError;
  }

  if (remoteProducts && remoteProducts.length > 0) {
    for (const remote of remoteProducts) {
      await productsRepository.upsertFromRemote({
        client_id: remote.client_id,
        name: remote.name,
        quantity: remote.quantity,
        price: remote.price,
        updated_at: new Date(remote.updated_at).getTime(),
      });
      downloaded += 1;
    }
  }

  // Paso B: subir
  const pending = await productsRepository.getPending();

  if (pending.length > 0) {
    const rows = pending.map((product) => ({
      user_id: userId,
      client_id: product.clientId,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      updated_at: new Date(product.updatedAt).toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'client_id' });

    if (upsertError) {
      throw upsertError;
    }

    const clientIds = pending.map((p) => p.clientId);
    await productsRepository.markSynced(clientIds, now);
    upserted = pending.length;
  }

  return {
    upserted,
    downloaded: remoteProducts?.length ?? 0,
    pending: pending.length,
  };
}
