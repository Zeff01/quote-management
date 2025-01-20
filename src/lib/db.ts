import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { QuoteDocument, QuoteStatus, QuoteStats } from "@/types/db";

/**
 * Get database connection and collection
 */
async function getQuotesCollection() {
  const client = await clientPromise;
  const db = client.db("quoteManagement");
  return db.collection<QuoteDocument>("quotes");
}

/**
 * Fetch a quote by its ID
 */
export async function getQuoteById(id: string): Promise<QuoteDocument | null> {
  try {
    if (!ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return null;
    }

    const collection = await getQuotesCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

/**
 * Update a quote's status
 */
export async function updateQuoteStatus(
  id: string,
  status: Exclude<QuoteStatus, "pending">
): Promise<QuoteDocument | null> {
  try {
    if (!ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return null;
    }

    const collection = await getQuotesCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      console.error("No quote found with id:", id);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Error updating quote:", error);
    return null;
  }
}

/**
 * Get statistics about quotes
 */
export async function getQuoteStats(): Promise<QuoteStats> {
  try {
    const collection = await getQuotesCollection();

    const [total, accepted, denied, pending] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: "accepted" }),
      collection.countDocuments({ status: "denied" }),
      collection.countDocuments({ status: "pending" }),
    ]);

    return { total, accepted, denied, pending };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { total: 0, accepted: 0, denied: 0, pending: 0 };
  }
}

/**
 * Create a new quote
 */
export async function createQuote(
  quote: Omit<QuoteDocument, "_id" | "status" | "createdAt" | "updatedAt">
): Promise<QuoteDocument | null> {
  try {
    const collection = await getQuotesCollection();

    const newQuote: QuoteDocument = {
      ...quote,
      _id: new ObjectId(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newQuote);

    if (!result.insertedId) {
      console.error("Failed to create quote");
      return null;
    }

    return newQuote;
  } catch (error) {
    console.error("Error creating quote:", error);
    return null;
  }
}

/**
 * Get recent quotes
 */
export async function getRecentQuotes(
  limit: number = 10
): Promise<QuoteDocument[]> {
  try {
    const collection = await getQuotesCollection();

    return collection.find().sort({ createdAt: -1 }).limit(limit).toArray();
  } catch (error) {
    console.error("Error fetching recent quotes:", error);
    return [];
  }
}
