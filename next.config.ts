/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to avoid missing plugin issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build if needed (only as last resort)
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;