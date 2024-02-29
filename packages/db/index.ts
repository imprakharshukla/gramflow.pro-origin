import { COURIER, PrismaClient, Status } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

export {
  PrismaClient as PrismaClientSingleton,
  COURIER as Courier,
  Status as Status,
};

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
