import { authenticate } from "../shopify.server";
import { getDb } from "../mongodb.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;

  if (session) {
    const db = await getDb();
    await db.collection('sessions').updateOne(
      { id: session.id },
      { $set: { scope: current.toString() } }
    );
  }

  return new Response();
};
