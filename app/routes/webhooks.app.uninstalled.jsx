import { authenticate } from "../shopify.server";
import { getDb } from "../mongodb.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    const db = await getDb();
    await db.collection('sessions').deleteMany({ shop });
  }

  return new Response();
};
