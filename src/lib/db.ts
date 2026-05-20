import { Db, MongoClient } from "mongodb";
import { ensureIndexes } from "@/lib/seed";

const uri = process.env.MONGODB_URI;
const dbName = "aor-tracker-dev";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let indexesEnsured: Promise<void> | undefined;

function requireUri(): string {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example).",
    );
  }
  return uri;
}

export async function getDb(): Promise<Db> {
  const connectionString = requireUri();
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(connectionString);
    globalForMongo._mongoClientPromise = client.connect();
  }
  const client = await globalForMongo._mongoClientPromise;
  const db = client.db(dbName);
  indexesEnsured ??= ensureIndexes(db).catch((err) => {
    indexesEnsured = undefined;
    throw err;
  });
  await indexesEnsured;
  return db;
}
