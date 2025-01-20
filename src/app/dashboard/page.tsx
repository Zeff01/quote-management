"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, CheckCircle, XCircle, Clock } from "lucide-react";
import WebSocketService from "@/services/websocket";

const DashboardCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>{icon}</div>
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-gray-500">{title}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    denied: 0,
    pending: 0,
  });
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const wsRef = useRef<WebSocketService | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await res.json();
      setStats(data.stats);
      setQuotes(data.recentQuotes);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWebSocketUpdate = useCallback(
    (data: any) => {
      console.log("Received WebSocket update:", data);
      if (data.type === "QUOTE_UPDATE") {
        // Debounce the fetch to prevent multiple rapid updates
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        fetchTimeoutRef.current = setTimeout(fetchData, 500);
      }
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();

    // Initialize WebSocket only once
    if (!wsRef.current) {
      wsRef.current = WebSocketService.getInstance();
    }

    // Add listener
    const cleanup = wsRef.current.addListener(handleWebSocketUpdate);

    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      cleanup();
    };
  }, [fetchData, handleWebSocketUpdate]);

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
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Quote Dashboard</h1>

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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Quotes</h2>
          <div className="space-y-4">
            {quotes.map((quote: any) => (
              <div
                key={quote._id}
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
