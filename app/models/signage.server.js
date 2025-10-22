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

export async function getFonts(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const fonts = await db.collection(collections.fonts).find(query).sort({ order: 1 }).toArray();
  return fonts.map(font => ({
    ...font,
    _id: font._id.toString()
  }));
}

export async function addFont(shop, fontData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.fonts).insertOne({
    shop,
    customizerId,
    ...fontData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateFont(shop, fontId, fontData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.fonts).updateOne(
    { _id: new ObjectId(fontId), shop },
    { $set: { ...fontData, updatedAt: new Date() } }
  );
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

export async function getColors(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const colors = await db.collection(collections.colors).find(query).sort({ order: 1 }).toArray();
  return colors.map(color => ({
    ...color,
    _id: color._id.toString()
  }));
}

export async function addColor(shop, colorData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.colors).insertOne({
    shop,
    customizerId,
    ...colorData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateColor(shop, colorId, colorData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.colors).updateOne(
    { _id: new ObjectId(colorId), shop },
    { $set: { ...colorData, updatedAt: new Date() } }
  );
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

export async function reorderColors(shop, orderedIds, customizerId = null) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.colors).bulkWrite(bulkOps);
  }
}

export async function getSizes(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const sizes = await db.collection(collections.sizes).find(query).sort({ order: 1 }).toArray();
  return sizes.map(size => ({
    ...size,
    _id: size._id.toString()
  }));
}

export async function addSize(shop, sizeData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.sizes).insertOne({
    shop,
    customizerId,
    ...sizeData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateSize(shop, sizeId, sizeData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.sizes).updateOne(
    { _id: new ObjectId(sizeId), shop },
    { $set: { ...sizeData, updatedAt: new Date() } }
  );
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

export async function getUsageTypes(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const types = await db.collection(collections.usageTypes).find(query).sort({ order: 1 }).toArray();
  return types.map(type => ({
    ...type,
    _id: type._id.toString()
  }));
}

export async function addUsageType(shop, typeData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.usageTypes).insertOne({
    shop,
    customizerId,
    ...typeData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateUsageType(shop, typeId, typeData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.usageTypes).updateOne(
    { _id: new ObjectId(typeId), shop },
    { $set: { ...typeData, updatedAt: new Date() } }
  );
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

export async function getAcrylicShapes(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const shapes = await db.collection(collections.acrylicShapes).find(query).sort({ order: 1 }).toArray();
  return shapes.map(shape => ({
    ...shape,
    _id: shape._id.toString()
  }));
}

export async function addAcrylicShape(shop, shapeData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.acrylicShapes).insertOne({
    shop,
    customizerId,
    ...shapeData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateAcrylicShape(shop, shapeId, shapeData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.acrylicShapes).updateOne(
    { _id: new ObjectId(shapeId), shop },
    { $set: { ...shapeData, updatedAt: new Date() } }
  );
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

export async function getBackboardColors(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const colors = await db.collection(collections.backboardColors).find(query).sort({ order: 1 }).toArray();
  return colors.map(color => ({
    ...color,
    _id: color._id.toString()
  }));
}

export async function addBackboardColor(shop, colorData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.backboardColors).insertOne({
    shop,
    customizerId,
    ...colorData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateBackboardColor(shop, colorId, colorData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.backboardColors).updateOne(
    { _id: new ObjectId(colorId), shop },
    { $set: { ...colorData, updatedAt: new Date() } }
  );
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

export async function getHangingOptions(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const options = await db.collection(collections.hangingOptions).find(query).sort({ order: 1 }).toArray();
  return options;
}

export async function addHangingOption(shop, optionData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.hangingOptions).insertOne({
    shop,
    customizerId,
    ...optionData,
    createdAt: new Date(),
  });
  return result;
}

export async function updateHangingOption(shop, optionId, optionData) {
  const db = await getDb();
  const { ObjectId} = await import('mongodb');
  const result = await db.collection(collections.hangingOptions).updateOne(
    { _id: new ObjectId(optionId), shop },
    { $set: { ...optionData, updatedAt: new Date() } }
  );
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

export async function getPricings(shop, customizerId = null) {
  const db = await getDb();
  const query = customizerId
    ? { shop, $or: [{ customizerId }, { customizerId: null }] }
    : { shop };
  const pricings = await db.collection(collections.pricings).find(query).toArray();
  return pricings.map(pricing => ({
    ...pricing,
    _id: pricing._id.toString()
  }));
}

export async function getPricing(shop, pricingId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const pricing = await db.collection(collections.pricings).findOne({
    _id: new ObjectId(pricingId),
    shop,
  });
  return pricing;
}

export async function addPricing(shop, pricingData, customizerId = null) {
  const db = await getDb();
  const result = await db.collection(collections.pricings).insertOne({
    shop,
    customizerId,
    ...pricingData,
    createdAt: new Date(),
  });
  return result;
}

export async function updatePricing(shop, pricingId, pricingData) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.pricings).updateOne(
    { _id: new ObjectId(pricingId), shop },
    { $set: { ...pricingData, updatedAt: new Date() } }
  );
  return result;
}

export async function getFontsUsingPricing(shop, pricingId) {
  const db = await getDb();
  const fonts = await db.collection(collections.fonts).find({
    shop,
    pricingId: pricingId,
  }).toArray();
  return fonts;
}

export async function deletePricing(shop, pricingId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const result = await db.collection(collections.pricings).deleteOne({
    _id: new ObjectId(pricingId),
    shop,
  });
  return result;
}

export async function reorderFonts(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.fonts).bulkWrite(bulkOps);
  }
}

export async function reorderSizes(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.sizes).bulkWrite(bulkOps);
  }
}

export async function reorderUsageTypes(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.usageTypes).bulkWrite(bulkOps);
  }
}

export async function reorderAcrylicShapes(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.acrylicShapes).bulkWrite(bulkOps);
  }
}

export async function reorderBackboardColors(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.backboardColors).bulkWrite(bulkOps);
  }
}

export async function reorderHangingOptions(shop, orderedIds) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id), shop },
      update: { $set: { order: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection(collections.hangingOptions).bulkWrite(bulkOps);
  }
}
