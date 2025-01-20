"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WebSocketService from "@/services/websocket";

interface QuoteData {
  salesPersonEmail: string;
  recipientEmail: string;
  amount: number;
  description: string;
}

interface WebSocketMessage {
  type: "QUOTE_UPDATE";
  data: {
    type: string;
    quote: QuoteData;
  };
}

export default function NewQuote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data: QuoteData = {
      salesPersonEmail: formData.get("salesPersonEmail") as string,
      recipientEmail: formData.get("recipientEmail") as string,
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
    };

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send quote");
      }

      const result: { quote: QuoteData } = await response.json();

      // Send WebSocket update for new quote
      const ws = WebSocketService.getInstance();
      const message: WebSocketMessage = {
        type: "QUOTE_UPDATE",
        data: {
          type: "new",
          quote: result.quote,
        },
      };
      ws.sendMessage(message);

      router.push("/quotes/success");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Create New Quote
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="salesPersonEmail"
                className="block text-sm font-medium mb-2"
              >
                Your Email
              </label>
              <input
                type="email"
                name="salesPersonEmail"
                id="salesPersonEmail"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="your.email@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="recipientEmail"
                className="block text-sm font-medium mb-2"
              >
                Recipient Email
              </label>
              <input
                type="email"
                name="recipientEmail"
                id="recipientEmail"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-2"
              >
                Quote Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                id="amount"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Describe the products or services included in this quote..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium hover:from-blue-600 hover:to-teal-500 transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send Quote"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
