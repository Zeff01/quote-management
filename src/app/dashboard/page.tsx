"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { BarChart, CheckCircle, Clock, XCircle, Home } from "lucide-react";
import WebSocketService from "@/services/websocket";
import { QuoteDocument, QuoteStats } from "@/types/db";

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface WebSocketUpdateData {
  type: "QUOTE_UPDATE";
  data: {
    id: string;
    status: "accepted" | "denied";
    updatedAt: string;
  };
}

interface DashboardData {
  stats: QuoteStats;
  recentQuotes: QuoteDocument[];
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>{icon}</div>
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-gray-500">{title}</p>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    accepted: 0,
    denied: 0,
    pending: 0,
  });
  const [quotes, setQuotes] = useState<QuoteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const wsRef = useRef<WebSocketService | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedRef = useRef<Date>(new Date());

  // Update ref when state changes
  useEffect(() => {
    lastUpdatedRef.current = lastUpdated;
  }, [lastUpdated]);

  const fetchData = useCallback(async (retryCount = 3) => {
    console.log("[Dashboard] Fetching data from API...");
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/quotes/stats?t=${timestamp}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control":
              "no-cache, no-store, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }

      const data = (await res.json()) as DashboardData;
      console.log("[Dashboard] Fetched Data:", data);

      setStats(data.stats);
      setQuotes(data.recentQuotes);
      setLastUpdated(new Date());
      setError("");
    } catch (error) {
      console.error("[Dashboard] Error fetching data:", error);
      if (retryCount > 0) {
        console.log(`[Dashboard] Retrying... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 2000);
      } else {
        setError(
          "Failed to load dashboard data. Please try refreshing the page."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWebSocketUpdate = useCallback(
    (data: WebSocketUpdateData) => {
      console.log("[WebSocket] Received update:", data);
      if (data.type === "QUOTE_UPDATE") {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        fetchTimeoutRef.current = setTimeout(fetchData, 500);
      }
    },
    [fetchData]
  );

  useEffect(() => {
    console.log("[Dashboard] Component mounted.");
    fetchData();

    // Initialize WebSocket connection
    try {
      if (!wsRef.current) {
        console.log("[WebSocket] Initializing WebSocket connection...");
        wsRef.current = WebSocketService.getInstance();
      }

      const cleanup = wsRef.current.addListener(handleWebSocketUpdate);

      // Set up periodic refresh as fallback
      const refreshInterval = setInterval(() => {
        const timeSinceLastUpdate =
          new Date().getTime() - lastUpdatedRef.current.getTime();
        if (timeSinceLastUpdate > 30000) {
          console.log("[Dashboard] Performing periodic refresh...");
          fetchData();
        }
      }, 30000);

      return () => {
        console.log("[Dashboard] Cleaning up...");
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        clearInterval(refreshInterval);
        cleanup();
      };
    } catch (error) {
      console.error("[WebSocket] Setup error:", error);
      setError("WebSocket connection failed. Updates may be delayed.");
    }
  }, [fetchData, handleWebSocketUpdate]); // Removed lastUpdated from dependencies

  const handleManualRefresh = () => {
    console.log("[Dashboard] Manual refresh triggered");
    setLoading(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Quote Dashboard</h1>

        {/* Rest of your dashboard content remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Quotes"
            value={stats.total}
            icon={<BarChart className="w-6 h-6 text-blue-500" />}
            color="bg-blue-100"
          />
          <DashboardCard
            title="Accepted"
            value={stats.accepted}
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            color="bg-green-100"
          />
          <DashboardCard
            title="Denied"
            value={stats.denied}
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            color="bg-red-100"
          />
          <DashboardCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-6 h-6 text-yellow-500" />}
            color="bg-yellow-100"
          />
        </div>

        {/* Recent Quotes section remains the same */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Quotes</h2>
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote._id.toString()}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{quote.recipientEmail}</p>
                  <p className="text-sm text-gray-500">${quote.amount}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    quote.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : quote.status === "denied"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
