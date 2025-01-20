"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WebSocketService from "@/services/websocket";
import { QuoteDocument } from "@/types/db";

interface QuoteDetailsProps {
  id: string;
}

export default function QuoteDetails({ id }: QuoteDetailsProps) {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/quotes/${id}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setError("Failed to load quote");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status: "accepted" | "denied") => {
    try {
      setUpdating(true);
      setError("");

      const res = await fetch(`/api/quotes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update quote");
      }

      // Send WebSocket update
      const ws = WebSocketService.getInstance();
      ws.sendMessage({
        type: "QUOTE_RESPONSE",
        data: {
          id,
          status,
          updatedAt: new Date().toISOString(),
        },
      });

      // Navigate to thank you page
      router.push("/thank-you");
    } catch (error) {
      console.error("Error updating quote:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update quote"
      );
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md text-center">
          <p>{error}</p>
          <button
            onClick={fetchQuote}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Quote not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Quote Details</h1>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              <span className="font-medium">Amount:</span> ${quote.amount}
            </p>
            {quote.description && (
              <p className="text-gray-600">
                <span className="font-medium">Description:</span>{" "}
                {quote.description}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium">From:</span>{" "}
              {quote.salesPersonEmail}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {quote.status === "pending" && (
            <div className="flex gap-4">
              <button
                onClick={() => handleResponse("accepted")}
                disabled={updating}
                className={`flex-1 px-6 py-3 bg-green-500 text-white rounded-lg transition-colors ${
                  updating
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-600"
                }`}
              >
                {updating ? "Processing..." : "Accept Quote"}
              </button>
              <button
                onClick={() => handleResponse("denied")}
                disabled={updating}
                className={`flex-1 px-6 py-3 bg-red-500 text-white rounded-lg transition-colors ${
                  updating
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600"
                }`}
              >
                {updating ? "Processing..." : "Deny Quote"}
              </button>
            </div>
          )}

          {quote.status !== "pending" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-center text-gray-600">
                This quote has already been {quote.status}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
