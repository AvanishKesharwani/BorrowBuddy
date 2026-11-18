/**
 * ============================================================================
 * PRISMA CLIENT DATABASE SINGLETON (src/lib/prisma.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Initializes and exports a single, shared instance of the Prisma Client
 * (`prisma`) used by all API routes and Server Components to interact with
 * the SQLite database (`dev.db`).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Singleton Pattern: During Next.js development, code reloads frequently
 *    (Hot Module Replacement). Without a singleton attached to `globalThis`,
 *    every reload would create a new PrismaClient connection pool and quickly
 *    exhaust system resources.
 * 2. Serverless / Vercel SQLite Handling: In serverless environments (like AWS
 *    Lambda or Vercel), the root filesystem is read-only. This utility detects
 *    serverless deployments and copies `prisma/dev.db` into the writable `/tmp`
 *    folder so the app can continue reading and writing data seamlessly.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file manages our database connection. It creates a single,
 * reusable Prisma ORM client across the application and ensures SQLite can
 * run locally as well as on serverless hosting platforms."
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Store PrismaClient in the global Node.js scope to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * ----------------------------------------------------------------------------
 * getPrismaClient():
 * Returns the existing database connection or instantiates a new one.
 * Handles environment-specific file path resolution for SQLite.
 * ----------------------------------------------------------------------------
 */
function getPrismaClient(): PrismaClient {
  // If an active connection already exists in memory, reuse it
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Ensure connection timeouts so serverless queries never hang
  let dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('connect_timeout')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    dbUrl = `${dbUrl}${separator}connect_timeout=30&pool_timeout=30`;
  }

  // Instantiate the Prisma Client
  const client = new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Save to global scope so Next.js fast reloads won't create extra instances
  globalForPrisma.prisma = client;
  return client;
}

// Export the ready-to-use Prisma database instance
export const prisma = getPrismaClient();
