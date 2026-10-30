/**
 * ============================================================================
 * NEXT.JS PLATFORM CONFIGURATION (next.config.mjs)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Sets compilation flags and asset handling policies for the Next.js framework.
 * 
 * 💡 KEY SETTINGS EXPLAINED:
 * 1. `images.remotePatterns`: Allows Next.js Image component to load external
 *    photos from secure HTTPS hostnames (e.g. Unsplash images for seeded items).
 * 2. `outputFileTracingIncludes`: Bundles the SQLite database file (`prisma/dev.db`)
 *    into standalone deployment builds (essential for Vercel/serverless runtime).
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file configures Next.js. We configured it to bundle our SQLite
 * database file with the build and permit high-quality photos from external URLs."
 * ============================================================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db'],
    },
  },
};

export default nextConfig;
