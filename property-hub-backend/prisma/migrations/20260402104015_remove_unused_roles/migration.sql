/*
  Warnings:

  - The values [INFLUENCER,MARKETING_MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
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
