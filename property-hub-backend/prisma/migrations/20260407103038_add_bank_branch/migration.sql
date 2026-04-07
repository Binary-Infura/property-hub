/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `banks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "banks" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "branchId" TEXT;

-- CreateTable
CREATE TABLE "bank_branches" (
    "id" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_branches_bankId_cityId_idx" ON "bank_branches"("bankId", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_branches_bankId_cityId_name_key" ON "bank_branches"("bankId", "cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "banks_organizationId_key" ON "banks"("organizationId");

-- CreateIndex
CREATE INDEX "users_branchId_idx" ON "users"("branchId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "bank_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_branches" ADD CONSTRAINT "bank_branches_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_branches" ADD CONSTRAINT "bank_branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_branches" ADD CONSTRAINT "bank_branches_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
