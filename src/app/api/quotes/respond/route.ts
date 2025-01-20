import { NextRequest, NextResponse } from "next/server";
import { updateQuoteStatus } from "@/lib/db";

interface QuoteUpdateRequest {
  status: "accepted" | "denied";
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = (await request.json()) as QuoteUpdateRequest;

    if (!["accepted", "denied"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updatedQuote = await updateQuoteStatus(params.id, status);

    if (!updatedQuote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }

    if (global.broadcastQuoteUpdate) {
      global.broadcastQuoteUpdate(updatedQuote);
    }

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error updating quote" },
      { status: 500 }
    );
  }
}
