/*
  Warnings:

  - The values [INFLUENCER,MARKETING_MANAGER,LOAN_ADVISOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `walletBalance` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('PLATFORM', 'THIRD_PARTY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationType" ADD VALUE 'GROWTH_PARTNER';
ALTER TYPE "OrganizationType" ADD VALUE 'LOAN_PARTNER';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CENTRAL_AUTHORITY', 'PROPERTY_PARTNER', 'BROKER', 'BUYER', 'CONSULTANT', 'GROWTH_PARTNER', 'LOAN_PARTNER', 'VISIT_EXECUTIVE');
ALTER TABLE "users" ALTER COLUMN "activeRole" TYPE "UserRole_new" USING ("activeRole"::text::"UserRole_new");
ALTER TABLE "users" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TABLE "invitations" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_userId_fkey";

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "type" "InvitationType" NOT NULL DEFAULT 'PLATFORM';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "buyerId" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "walletBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "payment_orders" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "walletBalance";

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "one_time_passwords" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_time_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "one_time_passwords_phone_idx" ON "one_time_passwords"("phone");

-- CreateIndex
CREATE INDEX "one_time_passwords_email_idx" ON "one_time_passwords"("email");

-- CreateIndex
CREATE INDEX "one_time_passwords_code_idx" ON "one_time_passwords"("code");

-- CreateIndex
CREATE INDEX "payment_orders_organizationId_idx" ON "payment_orders"("organizationId");

-- CreateIndex
CREATE INDEX "wallet_transactions_organizationId_idx" ON "wallet_transactions"("organizationId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
