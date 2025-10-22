import { authenticate } from "../shopify.server";
import { MongoClient, GridFSBucket } from 'mongodb';

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

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const fontFile = formData.get("fontFile");

    if (!fontFile || !(fontFile instanceof File)) {
      return Response.json({ error: "No font file provided" }, { status: 400 });
    }

    const allowedTypes = [
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/x-font-ttf',
      'application/x-font-otf',
      'application/octet-stream'
    ];

    if (!allowedTypes.includes(fontFile.type) && !fontFile.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      return Response.json({ error: "Invalid font file type. Only TTF, OTF, WOFF, and WOFF2 files are allowed." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (fontFile.size > maxSize) {
      return Response.json({ error: "Font file is too large. Maximum size is 5MB." }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db('signage_customizer');
    const bucket = new GridFSBucket(db, { bucketName: 'fonts' });

    const timestamp = Date.now();
    const sanitizedShop = shop.replace(/[^a-z0-9]/gi, '-');
    const fileName = `${sanitizedShop}-${timestamp}-${fontFile.name.replace(/[^a-z0-9.-]/gi, '-')}`;

    const arrayBuffer = await fontFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: {
        shop,
        originalName: fontFile.name,
        contentType: fontFile.type || 'application/octet-stream',
        uploadedAt: new Date()
      }
    });

    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const fileId = uploadStream.id.toString();
    const fontFileUrl = `/api/font-file/${fileId}`;

    return Response.json({
      success: true,
      fontFileUrl: fontFileUrl,
      fontFileName: fontFile.name,
      fileId: fileId
    });

  } catch (error) {
    console.error('Font upload error:', error);
    return Response.json({ error: error.message || "Failed to upload font file" }, { status: 500 });
  }
};
