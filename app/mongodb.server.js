import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGODB_URL) {
  throw new Error('Please add your MongoDB URL to .env');
}

const uri = process.env.MONGODB_URL;
const options = {};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db('signage_customizer');
}

export const collections = {
  customizers: 'customizers',
  configurations: 'configurations',
  fonts: 'fonts',
  colors: 'colors',
  sizes: 'sizes',
  usageTypes: 'usage_types',
  acrylicShapes: 'acrylic_shapes',
  backboardColors: 'backboard_colors',
  hangingOptions: 'hanging_options',
  pricings: 'pricings',
};
