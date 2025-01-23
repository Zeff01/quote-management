import { MongoClient, ReadPreferenceMode } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {
  readPreference: "primary" as ReadPreferenceMode,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then(async (client) => {
        // Test the connection
        await client.db().admin().ping();
        console.log("MongoDB connection established");
        return client;
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then(async (client) => {
      // Test the connection
      await client.db().admin().ping();
      console.log("MongoDB connection established");
      return client;
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    });
}

export default clientPromise;
