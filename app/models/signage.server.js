import { getDb, collections } from '../mongodb.server.js';

export async function getShopConfiguration(shop) {
  const db = await getDb();
  const config = await db.collection(collections.configurations).findOne({ shop });
  return config;
}

export async function upsertShopConfiguration(shop, configData) {
  const db = await getDb();
  const result = await db.collection(collections.configurations).updateOne(
    { shop },
    { $set: { ...configData, shop, updatedAt: new Date() } },
    { upsert: true }
  );
  return result;
}

export async function getFonts(shop) {
  const db = await getDb();
  const fonts = await db.collection(collections.fonts).find({ shop }).toArray();
  return fonts;
}

export async function addFont(shop, fontData) {
  const db = await getDb();
  const result = await db.collection(collections.fonts).insertOne({
    shop,
    ...fontData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteFont(shop, fontId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.fonts).deleteOne({
    _id: new ObjectId(fontId),
    shop,
  });
  return result;
}

export async function getColors(shop) {
  const db = await getDb();
  const colors = await db.collection(collections.colors).find({ shop }).toArray();
  return colors;
}

export async function addColor(shop, colorData) {
  const db = await getDb();
  const result = await db.collection(collections.colors).insertOne({
    shop,
    ...colorData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteColor(shop, colorId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.colors).deleteOne({
    _id: new ObjectId(colorId),
    shop,
  });
  return result;
}

export async function getSizes(shop) {
  const db = await getDb();
  const sizes = await db.collection(collections.sizes).find({ shop }).toArray();
  return sizes;
}

export async function addSize(shop, sizeData) {
  const db = await getDb();
  const result = await db.collection(collections.sizes).insertOne({
    shop,
    ...sizeData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteSize(shop, sizeId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.sizes).deleteOne({
    _id: new ObjectId(sizeId),
    shop,
  });
  return result;
}

export async function getUsageTypes(shop) {
  const db = await getDb();
  const types = await db.collection(collections.usageTypes).find({ shop }).toArray();
  return types;
}

export async function addUsageType(shop, typeData) {
  const db = await getDb();
  const result = await db.collection(collections.usageTypes).insertOne({
    shop,
    ...typeData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteUsageType(shop, typeId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.usageTypes).deleteOne({
    _id: new ObjectId(typeId),
    shop,
  });
  return result;
}

export async function getAcrylicShapes(shop) {
  const db = await getDb();
  const shapes = await db.collection(collections.acrylicShapes).find({ shop }).toArray();
  return shapes;
}

export async function addAcrylicShape(shop, shapeData) {
  const db = await getDb();
  const result = await db.collection(collections.acrylicShapes).insertOne({
    shop,
    ...shapeData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteAcrylicShape(shop, shapeId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.acrylicShapes).deleteOne({
    _id: new ObjectId(shapeId),
    shop,
  });
  return result;
}

export async function getBackboardColors(shop) {
  const db = await getDb();
  const colors = await db.collection(collections.backboardColors).find({ shop }).toArray();
  return colors;
}

export async function addBackboardColor(shop, colorData) {
  const db = await getDb();
  const result = await db.collection(collections.backboardColors).insertOne({
    shop,
    ...colorData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteBackboardColor(shop, colorId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.backboardColors).deleteOne({
    _id: new ObjectId(colorId),
    shop,
  });
  return result;
}

export async function getHangingOptions(shop) {
  const db = await getDb();
  const options = await db.collection(collections.hangingOptions).find({ shop }).toArray();
  return options;
}

export async function addHangingOption(shop, optionData) {
  const db = await getDb();
  const result = await db.collection(collections.hangingOptions).insertOne({
    shop,
    ...optionData,
    createdAt: new Date(),
  });
  return result;
}

export async function deleteHangingOption(shop, optionId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.hangingOptions).deleteOne({
    _id: new ObjectId(optionId),
    shop,
  });
  return result;
}
