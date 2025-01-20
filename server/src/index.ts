import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface QuoteData {
  id: string;
  status: "accepted" | "denied" | "pending";
  updatedAt: string;
}

interface WebSocketMessage {
  type: "QUOTE_RESPONSE" | "QUOTE_UPDATE";
  data: QuoteData;
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || "localhost";

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Broadcast function
const broadcast = (data: WebSocketMessage): void => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error("Broadcast error:", err);
      }
    }
  });
};

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");

  // Send connection confirmation
  try {
    ws.send(JSON.stringify({ type: "CONNECTION_ESTABLISHED" }));
  } catch (err) {
    console.error("Error sending confirmation:", err);
  }

  ws.on("message", (rawData: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData.toString());
      console.log("Received message:", message);

      if (message.type === "QUOTE_RESPONSE") {
        broadcast({
          type: "QUOTE_UPDATE",
          data: message.data,
        });
      }
    } catch (err) {
      console.error("Message processing error:", err);
    }
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Error handling for the server
server.on("error", (error: Error) => {
  console.error("Server error:", error);
});

// Start the server
server.listen(PORT, () => {
  console.log(`> WebSocket Server running at ws://${HOST}:${PORT}`);
});
