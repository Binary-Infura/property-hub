/*
  Warnings:

  - The values [BROKERAGE,MARKETING_AGENCY] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `primaryRole` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('PLATFORM', 'PROPERTY_PARTNER');
ALTER TABLE "organizations" ALTER COLUMN "type" TYPE "OrganizationType_new" USING ("type"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "OrganizationType_old";
COMMIT;

-- DropIndex
DROP INDEX "users_primaryRole_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "primaryRole",
ADD COLUMN     "activeRole" "UserRole";

-- CreateIndex
CREATE INDEX "users_activeRole_idx" ON "users"("activeRole");
