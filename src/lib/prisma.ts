import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient(): PrismaClient {
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

  const client = new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
