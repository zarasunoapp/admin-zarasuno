/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Always re-fetch dynamic pages on navigation (no stale client router cache) —
    // keeps the dashboard/sales numbers in sync immediately after edits/deletes.
    staleTimes: { dynamic: 0, static: 0 },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ttxgowlsvutggtqauuza.supabase.co" },
    ],
  },
};

export default nextConfig;
