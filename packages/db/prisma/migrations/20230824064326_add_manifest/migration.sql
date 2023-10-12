/*
  Warnings:

  - You are about to drop the column `prices` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'MANIFESTED';

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "prices";
