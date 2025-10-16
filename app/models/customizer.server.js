import { getDb, collections } from '../mongodb.server.js';

export async function getCustomizers(shop) {
  const db = await getDb();
  const customizers = await db.collection(collections.customizers).find({ shop }).sort({ createdAt: -1 }).toArray();
  return customizers.map(customizer => ({
    ...customizer,
    _id: customizer._id.toString()
  }));
}

export async function getActiveCustomizers(shop) {
  const db = await getDb();
  const customizers = await db.collection(collections.customizers).find({
    shop,
    isActive: true
  }).sort({ createdAt: -1 }).toArray();
  return customizers.map(customizer => ({
    ...customizer,
    _id: customizer._id.toString()
  }));
}

export async function getCustomizer(shop, identifier) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  let customizer;

  if (identifier.startsWith('cust-')) {
    customizer = await db.collection(collections.customizers).findOne({
      customizerId: identifier,
      shop
    });
  } else if (ObjectId.isValid(identifier)) {
    customizer = await db.collection(collections.customizers).findOne({
      _id: new ObjectId(identifier),
      shop
    });
  } else {
    return null;
  }

  if (customizer) {
    return {
      ...customizer,
      _id: customizer._id.toString()
    };
  }

  return null;
}

async function generateCustomizerId(db) {
  const count = await db.collection(collections.customizers).countDocuments();
  return `cust-${count + 1}`;
}

export async function createCustomizer(shop, customizerData) {
  const db = await getDb();
  const customizerId = await generateCustomizerId(db);

  const result = await db.collection(collections.customizers).insertOne({
    shop,
    customizerId,
    name: customizerData.name,
    description: customizerData.description || '',
    isActive: customizerData.isActive !== undefined ? customizerData.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function updateCustomizer(shop, identifier, customizerData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  if (identifier.startsWith('cust-')) {
    const result = await db.collection(collections.customizers).updateOne(
      { customizerId: identifier, shop },
      { $set: { ...customizerData, updatedAt: new Date() } }
    );
    return result;
  }

  if (!ObjectId.isValid(identifier)) {
    throw new Error('Invalid customizer ID');
  }

  const result = await db.collection(collections.customizers).updateOne(
    { _id: new ObjectId(identifier), shop },
    { $set: { ...customizerData, updatedAt: new Date() } }
  );
  return result;
}

export async function deleteCustomizer(shop, identifier) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  if (identifier.startsWith('cust-')) {
    const result = await db.collection(collections.customizers).deleteOne({
      customizerId: identifier,
      shop
    });
    return result;
  }

  if (!ObjectId.isValid(identifier)) {
    throw new Error('Invalid customizer ID');
  }

  const result = await db.collection(collections.customizers).deleteOne({
    _id: new ObjectId(identifier),
    shop
  });
  return result;
}
