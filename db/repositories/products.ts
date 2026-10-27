import { eq, isNull, lt, or } from 'drizzle-orm';
import { getDb } from '../index';
import { products } from '../schema';
import * as Crypto from 'expo-crypto';

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

function now() {
  return Date.now();
}

function generateClientId() {
  return Crypto.randomUUID();
}

export const productsRepository = {
  async getAll(): Promise<Product[]> {
    const db = await getDb();
    return db.select().from(products).orderBy(products.name);
  },

  async getById(id: number): Promise<Product | undefined> {
    const db = await getDb();
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  },

  async getPending(): Promise<Product[]> {
    const db = await getDb();
    return db
      .select()
      .from(products)
      .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
  },

  async create(data: { name: string; quantity: number; price: number }): Promise<Product> {
    const db = await getDb();
    const timestamp = now();
    const clientId = generateClientId();
    const [created] = await db
      .insert(products)
      .values({
        clientId,
        name: data.name.trim(),
        quantity: Math.max(0, Math.floor(data.quantity)),
        price: Math.max(0, Math.floor(data.price)),
        updatedAt: timestamp,
        syncedAt: null,
      })
      .returning();
    return created;
  },

  async update(id: number, data: { name: string; quantity: number; price: number }): Promise<Product | undefined> {
    const db = await getDb();
    const timestamp = now();
    const [updated] = await db
      .update(products)
      .set({
        name: data.name.trim(),
        quantity: Math.max(0, Math.floor(data.quantity)),
        price: Math.max(0, Math.floor(data.price)),
        updatedAt: timestamp,
        syncedAt: null,
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.delete(products).where(eq(products.id, id));
  },

  async markSynced(clientIds: string[], syncedAt: number): Promise<void> {
    if (clientIds.length === 0) return;
    const db = await getDb();
    for (const clientId of clientIds) {
      await db
        .update(products)
        .set({ syncedAt })
        .where(eq(products.clientId, clientId));
    }
  },

  async upsertFromRemote(remote: {
    client_id: string;
    name: string;
    quantity: number;
    price: number;
    updated_at: number;
  }): Promise<void> {
    const db = await getDb();
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.clientId, remote.client_id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values({
        clientId: remote.client_id,
        name: remote.name,
        quantity: remote.quantity,
        price: remote.price,
        updatedAt: remote.updated_at,
        syncedAt: Date.now(),
      });
    }
  },
};
