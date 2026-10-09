import { MongoClient, Db } from 'mongodb';

const configuredUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const localUri = 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || (configuredUri.includes('mongodb.net') ? 'Links' : 'google_flag_reviews');

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _activeUri?: string;
};

async function connectClient(uri: string): Promise<MongoClient> {
  const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv://');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    ...(isAtlas ? { maxIdleTimeMS: 60000 } : {})
  });
  return client.connect();
}

function formatError(err: any): Error {
  const msg = err?.message || String(err);
  if (
    msg.includes('SSL routines') ||
    msg.includes('alert internal error') ||
    msg.includes('SSL alert number 80')
  ) {
    return new Error(
      'MongoDB Atlas Connection Blocked (SSL alert 80): Your current IP is not whitelisted in MongoDB Atlas. Go to MongoDB Atlas -> Network Access -> Add IP Address (allow 0.0.0.0/0 or current IP).'
    );
  }
  return err instanceof Error ? err : new Error(msg);
}

function getClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = connectClient(configuredUri)
      .then((client) => {
        globalForMongo._activeUri = configuredUri;
        return client;
      })
      .catch(async (primaryErr) => {
        // If primary connection failed (e.g. Atlas IP whitelist block), attempt local fallback if available
        if (configuredUri !== localUri) {
          console.warn(
            '[MongoDB] Primary URI connection failed:',
            primaryErr.message,
            '-> Attempting fallback to local MongoDB (127.0.0.1:27017)...'
          );
          try {
            const fallbackClient = await connectClient(localUri);
            globalForMongo._activeUri = localUri;
            console.log('[MongoDB] Connected successfully to fallback local database.');
            return fallbackClient;
          } catch (localErr) {
            // If local fallback also fails, throw formatted primary error
            globalForMongo._mongoClientPromise = undefined;
            throw formatError(primaryErr);
          }
        }

        globalForMongo._mongoClientPromise = undefined;
        throw formatError(primaryErr);
      });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
