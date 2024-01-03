import {PrismaClient} from "@prisma/client";

const PrismaClientSingleton = new PrismaClient()
export {
  PrismaClientSingleton
}
