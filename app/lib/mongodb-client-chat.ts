import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './config';

const uri = env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let isConnected = false;

export async function connectToChatDB() {
  if (!isConnected) {
    try {
      const startConnectionTime = Date.now();
      await client.connect();
      isConnected = true;
      const endConnectionTime = Date.now();
      console.log(`MongoDB connection established in ${endConnectionTime - startConnectionTime} ms`);

    } catch (err) {
      console.error('Failed to connect to the database', err);
      throw err;
    }
  }
  return client.db("chatbotDB");
}
