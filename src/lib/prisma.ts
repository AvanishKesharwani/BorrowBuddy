/**
 * ============================================================================
 * PRISMA CLIENT DATABASE SINGLETON (src/lib/prisma.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Initializes and exports a single, shared instance of the Prisma Client
 * (`prisma`) used by all API routes and Server Components to interact with
 * the Supabase PostgreSQL database via DATABASE_URL environment variable.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Singleton Pattern: During Next.js development, code reloads frequently
 *    (Hot Module Replacement). Without a singleton attached to `globalThis`,
 *    every reload would create a new PrismaClient connection pool and quickly
 *    exhaust system resources.
 * 2. Cloud Database: Now uses Supabase PostgreSQL (not local SQLite). The
 *    DATABASE_URL is stored as a secure environment variable — never hardcoded.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file manages our database connection. It creates a single,
 * reusable Prisma ORM client across the application connected to our
 * cloud-hosted Supabase PostgreSQL database."
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';

// Store PrismaClient in the global Node.js scope to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * ----------------------------------------------------------------------------
 * getPrismaClient():
 * Returns the existing database connection or instantiates a new one.
 * Uses DATABASE_URL environment variable to connect to Supabase PostgreSQL.
 * ----------------------------------------------------------------------------
 */
function getPrismaClient(): PrismaClient {
  // If an active connection already exists in memory, reuse it
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Instantiate the Prisma Client — reads DATABASE_URL from environment
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Save to global scope so Next.js fast reloads won't create extra instances
  globalForPrisma.prisma = client;
  return client;
}

// Export the ready-to-use Prisma database instance
export const prisma = getPrismaClient();
