import { getDb, collections } from '../mongodb.server.js';

export async function getCustomizers(shop) {
  const db = await getDb();
  const customizers = await db.collection(collections.customizers).find({ shop }).sort({ createdAt: -1 }).toArray();
  return customizers;
}

export async function getCustomizer(shop, customizerId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const customizer = await db.collection(collections.customizers).findOne({
    _id: new ObjectId(customizerId),
    shop
  });
  return customizer;
}

export async function createCustomizer(shop, customizerData) {
  const db = await getDb();
  const result = await db.collection(collections.customizers).insertOne({
    shop,
    name: customizerData.name,
    description: customizerData.description || '',
    isActive: customizerData.isActive !== undefined ? customizerData.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function updateCustomizer(shop, customizerId, customizerData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.customizers).updateOne(
    { _id: new ObjectId(customizerId), shop },
    { $set: { ...customizerData, updatedAt: new Date() } }
  );
  return result;
}

export async function deleteCustomizer(shop, customizerId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.customizers).deleteOne({
    _id: new ObjectId(customizerId),
    shop
  });
  return result;
}
