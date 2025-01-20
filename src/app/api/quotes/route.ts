import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salesPersonEmail, recipientEmail, amount, description } = body;

    const client = await clientPromise;
    const db = client.db("quoteManagement");

    const quote = await db.collection("quotes").insertOne({
      salesPersonEmail,
      recipientEmail,
      amount,
      description,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email using Resend
    await resend.emails.send({
      from: "QuoteFlow <onboarding@resend.dev>",
      to: recipientEmail,
      subject: "New Quote Available for Review",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Quote Available</h1>
          <p>Hello,</p>
          <p>You have received a new quote for review.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> $${amount}</p>
            ${
              description
                ? `<p><strong>Description:</strong> ${description}</p>`
                : ""
            }
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL}/quotes/${quote.insertedId}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Quote
            </a>
          </div>
        </div>
      `,
    });

    // Return the created quote with its ID
    const createdQuote = {
      _id: quote.insertedId,
      salesPersonEmail,
      recipientEmail,
      amount,
      description,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      message: "Quote sent successfully",
      quote: createdQuote,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error sending quote" },
      { status: 500 }
    );
  }
}
