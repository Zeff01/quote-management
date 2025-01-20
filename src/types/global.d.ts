import { MongoClient } from "mongodb";
import type { QuoteDocument } from "./db";

declare global {
  /* eslint-disable no-var */
  var _mongoClientPromise: Promise<MongoClient>;
  var broadcastQuoteUpdate: ((quote: QuoteDocument) => void) | undefined;
  /* eslint-enable no-var */
}

export {};
