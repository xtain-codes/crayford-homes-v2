import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In dev, Next.js hot-reloads modules; without the global cache below each
 * reload would open a new connection pool until the DB exhausts handles.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
