import { getDb } from './mongodb.server.js';
import { Session } from '@shopify/shopify-app-react-router/server';

export class MongoDBSessionStorage {
  constructor() {
    this.collectionName = 'sessions';
  }

  async storeSession(session) {
    const db = await getDb();
    const collection = db.collection(this.collectionName);

    await collection.updateOne(
      { id: session.id },
      {
        $set: {
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires,
          accessToken: session.accessToken,
          userId: session.onlineAccessInfo?.associated_user?.id,
          firstName: session.onlineAccessInfo?.associated_user?.first_name,
          lastName: session.onlineAccessInfo?.associated_user?.last_name,
          email: session.onlineAccessInfo?.associated_user?.email,
          accountOwner: session.onlineAccessInfo?.associated_user?.account_owner,
          locale: session.onlineAccessInfo?.associated_user?.locale,
          collaborator: session.onlineAccessInfo?.associated_user?.collaborator,
          emailVerified: session.onlineAccessInfo?.associated_user?.email_verified,
        },
      },
      { upsert: true }
    );

    return true;
  }

  async loadSession(id) {
    const db = await getDb();
    const collection = db.collection(this.collectionName);

    const sessionData = await collection.findOne({ id });

    if (!sessionData) {
      return undefined;
    }

    const session = new Session({
      id: sessionData.id,
      shop: sessionData.shop,
      state: sessionData.state,
      isOnline: sessionData.isOnline,
      scope: sessionData.scope,
      expires: sessionData.expires,
      accessToken: sessionData.accessToken,
    });

    if (sessionData.userId) {
      session.onlineAccessInfo = {
        associated_user: {
          id: sessionData.userId,
          first_name: sessionData.firstName,
          last_name: sessionData.lastName,
          email: sessionData.email,
          account_owner: sessionData.accountOwner,
          locale: sessionData.locale,
          collaborator: sessionData.collaborator,
          email_verified: sessionData.emailVerified,
        },
      };
    }

    return session;
  }

  async deleteSession(id) {
    const db = await getDb();
    const collection = db.collection(this.collectionName);

    await collection.deleteOne({ id });

    return true;
  }

  async deleteSessions(ids) {
    const db = await getDb();
    const collection = db.collection(this.collectionName);

    await collection.deleteMany({ id: { $in: ids } });

    return true;
  }

  async findSessionsByShop(shop) {
    const db = await getDb();
    const collection = db.collection(this.collectionName);

    const sessionDocs = await collection.find({ shop }).toArray();

    return sessionDocs.map((sessionData) => {
      const session = new Session({
        id: sessionData.id,
        shop: sessionData.shop,
        state: sessionData.state,
        isOnline: sessionData.isOnline,
        scope: sessionData.scope,
        expires: sessionData.expires,
        accessToken: sessionData.accessToken,
      });

      if (sessionData.userId) {
        session.onlineAccessInfo = {
          associated_user: {
            id: sessionData.userId,
            first_name: sessionData.firstName,
            last_name: sessionData.lastName,
            email: sessionData.email,
            account_owner: sessionData.accountOwner,
            locale: sessionData.locale,
            collaborator: sessionData.collaborator,
            email_verified: sessionData.emailVerified,
          },
        };
      }

      return session;
    });
  }
}
