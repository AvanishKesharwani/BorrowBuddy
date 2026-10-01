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

  let dbUrl: string | undefined = undefined;

  // On Vercel / serverless runtime, SQLite database must reside in writable /tmp directory
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    const possibleSources = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.resolve('prisma/dev.db'),
      path.join(__dirname, 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      '/var/task/prisma/dev.db',
    ];

    if (!fs.existsSync(tmpDbPath)) {
      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            console.log('Successfully copied SQLite database from', src, 'to', tmpDbPath);
            break;
          } catch (err) {
            console.error('Error copying SQLite database to /tmp:', err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      dbUrl = `file:${tmpDbPath}`;
    }
  }

  // Instantiate the Prisma Client with connection logging in development mode
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
