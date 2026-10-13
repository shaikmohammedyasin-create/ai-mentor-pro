import { PrismaClient } from '@prisma/client'
import path from 'path'

// Dynamically resolve relative SQLite file path to an absolute path to prevent resolution errors under nextjs standalone server
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  const filePath = process.env.DATABASE_URL.replace(/^file:/, '');
  if (!path.isAbsolute(filePath)) {
    process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), filePath)}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db