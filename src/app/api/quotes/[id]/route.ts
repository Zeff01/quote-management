import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { QuoteDocument, QuoteUpdateRequest, QuoteResponse } from "@/types/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const client = await clientPromise;
    const db = client.db("quoteManagement");

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { message: "Invalid quote ID format" },
        { status: 400 }
      );
    }

    const quote = await db.collection<QuoteDocument>("quotes").findOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { message: "Error fetching quote" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const client = await clientPromise;
    const db = client.db("quoteManagement");

    const { status } = (await req.json()) as QuoteUpdateRequest;

    console.log("Processing quote update:", { id: resolvedParams.id, status });

    if (!["accepted", "denied"].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be "accepted" or "denied".' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { message: "Invalid quote ID format" },
        { status: 400 }
      );
    }

    const result = await db
      .collection<QuoteDocument>("quotes")
      .findOneAndUpdate(
        { _id: new ObjectId(resolvedParams.id) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

    // Check if result exists
    if (!result) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }

    // If using WebSocket broadcast
    if (global.broadcastQuoteUpdate) {
      global.broadcastQuoteUpdate(result);
    }

    const response: QuoteResponse = {
      message: "Quote status updated successfully",
      quote: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { message: "Error updating quote" },
      { status: 500 }
    );
  }
}
