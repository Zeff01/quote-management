/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WS_URL:
      process.env.NODE_ENV === "production"
        ? "wss://your-render-app.onrender.com" // You'll update this with your Render URL
        : "ws://localhost:3001",
  },
};

module.exports = nextConfig;
