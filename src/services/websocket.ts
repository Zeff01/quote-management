class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Set<(data: any) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  private isConnecting = false;

  private constructor() {
    if (typeof window !== "undefined" && !this.ws) {
      this.connect();
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log("WebSocket connection lost. Attempting to reconnect...");
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000));
        } else {
          console.error("Max reconnection attempts reached");
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      this.isConnecting = false;
      console.error("Error creating WebSocket:", error);
    }
  }

  addListener(callback: (data: any) => void) {
    if (!this.listeners.has(callback)) {
      this.listeners.add(callback);
    }
    return () => this.removeListener(callback);
  }

  removeListener(callback: (data: any) => void) {
    this.listeners.delete(callback);
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error("Error in listener:", error);
      }
    });
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("WebSocket not connected, attempting to connect...");
      this.connect();
      setTimeout(() => this.sendMessage(message), 1000);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.listeners.clear();
  }
}

export default WebSocketService;
