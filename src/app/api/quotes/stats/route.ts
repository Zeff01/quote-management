import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quoteManagement");
    const collection = db.collection("quotes");

    // Get counts for each status
    const [total, accepted, denied, pending] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: "accepted" }),
      collection.countDocuments({ status: "denied" }),
      collection.countDocuments({ status: "pending" }),
    ]);

    // Get recent quotes
    const recentQuotes = await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json(
      {
        stats: {
          total,
          accepted,
          denied,
          pending,
        },
        recentQuotes,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error fetching stats" },
      { status: 500 }
    );
  }
}
