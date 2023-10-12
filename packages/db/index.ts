import {PrismaClient} from "@prisma/client";
import {OrdersModel, UsersModel} from "./prisma/zod";
import {z} from "zod";

export * from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

export {
  PrismaClient as PrismaClientSingleton
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

