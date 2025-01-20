import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!["accepted", "denied"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quoteManagement");

    const result = await db.collection("quotes").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }

    // Broadcast the update to all connected clients
    if (global.broadcastQuoteUpdate) {
      global.broadcastQuoteUpdate(result);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error updating quote" },
      { status: 500 }
    );
  }
}
