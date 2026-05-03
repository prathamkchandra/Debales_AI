import mongoose from "mongoose";

const DEFAULT_DB_NAME = "Debales_ai";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return null;
  }

  if (cache.conn) {
    return cache.conn;
  }

  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? DEFAULT_DB_NAME,
  });

  cache.conn = await cache.promise;
  return cache.conn;
}
