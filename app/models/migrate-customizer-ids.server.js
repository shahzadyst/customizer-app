import { getDb, collections } from '../mongodb.server.js';

export async function migrateCustomizerIds() {
  const db = await getDb();

  const customizers = await db.collection(collections.customizers)
    .find({ customizerId: { $exists: false } })
    .toArray();

  if (customizers.length === 0) {
    console.log('No customizers to migrate');
    return { migrated: 0 };
  }

  const totalCount = await db.collection(collections.customizers).countDocuments();
  let counter = totalCount - customizers.length;

  for (const customizer of customizers) {
    counter++;
    const customizerId = `cust-${counter}`;

    await db.collection(collections.customizers).updateOne(
      { _id: customizer._id },
      { $set: { customizerId } }
    );
  }

  console.log(`Migrated ${customizers.length} customizers`);
  return { migrated: customizers.length };
}
