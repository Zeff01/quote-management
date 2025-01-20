import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const nextPort = parseInt(process.env.PORT || "3000", 10);
const wsPort = 3001;

// Initialize Next.js
const app = next({ dev, hostname, port: nextPort });
const handle = app.getRequestHandler();

// Function to broadcast messages to all connected clients
const broadcast = (wss: WebSocketServer, data: any) => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

async function startServer() {
  try {
    await app.prepare();

    // Create Next.js server
    const nextServer = createServer(async (req, res) => {
      try {
        if (!req.url) return;
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("Internal server error");
      }
    });

    // Create WebSocket server
    const wsServer = createServer();
    const wss = new WebSocketServer({ server: wsServer });

    wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket");

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log("Received message:", message);

          if (message.type === "QUOTE_RESPONSE") {
            broadcast(wss, {
              type: "QUOTE_UPDATE",
              data: message.data,
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    // Start both servers
    wsServer.listen(wsPort, () => {
      console.log(`> WebSocket Server ready on ws://${hostname}:${wsPort}`);
    });

    nextServer.listen(nextPort, () => {
      console.log(`> Next.js App ready on http://${hostname}:${nextPort}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
