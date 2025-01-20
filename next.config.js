/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WS_URL:
      process.env.NODE_ENV === "production"
        ? "https://quote-management.onrender.com"
        : "ws://localhost:3001",
  },
};

module.exports = nextConfig;
