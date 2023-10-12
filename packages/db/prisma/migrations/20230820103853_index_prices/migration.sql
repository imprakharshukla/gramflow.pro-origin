-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "prices" INTEGER[] DEFAULT ARRAY[0]::INTEGER[];

-- CreateIndex
CREATE INDEX "Orders_user_id_id_idx" ON "Orders"("user_id", "id");

-- CreateIndex
CREATE INDEX "Users_id_idx" ON "Users"("id");
