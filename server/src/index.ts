import { createServer } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";

// Define types for our messages
interface QuoteData {
  id: string;
  status: "accepted" | "denied" | "pending";
  updatedAt: string;
}

interface WebSocketMessage {
  type: "QUOTE_RESPONSE" | "QUOTE_UPDATE";
  data: QuoteData;
}

// Server configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || "localhost";

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Broadcast function to send updates to all connected clients
const broadcast = (data: WebSocketMessage): void => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error("Error broadcasting message:", error);
      }
    }
  });
};

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");

  // Send initial connection confirmation
  try {
    ws.send(JSON.stringify({ type: "CONNECTION_ESTABLISHED" }));
  } catch (error) {
    console.error("Error sending connection confirmation:", error);
  }

  ws.on("message", (data: RawData) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      console.log("Received message:", message);

      if (message.type === "QUOTE_RESPONSE") {
        broadcast({
          type: "QUOTE_UPDATE",
          data: message.data,
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
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
  console.log(`> WebSocket Server is running on ws://${HOST}:${PORT}`);
});
