import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error('MONGODB_URL is not configured');
  }

  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  return cachedClient;
}

export const loader = async ({ params }) => {
  const { fileId } = params;

  try {
    const client = await getMongoClient();
    const db = client.db('signage_customizer');
    const bucket = new GridFSBucket(db, { bucketName: 'fonts' });

    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();

    if (!files || files.length === 0) {
      return new Response('Font file not found', { status: 404 });
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const contentType = file.metadata?.contentType || 'application/octet-stream';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error serving font file:', error);
    return new Response('Error loading font file', { status: 500 });
  }
};
