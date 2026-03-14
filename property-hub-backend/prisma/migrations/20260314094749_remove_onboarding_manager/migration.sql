/*
  Warnings:

  - The values [ONBOARDING_MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

UPDATE "users" SET "primaryRole" = 'BUYER' WHERE "primaryRole" = 'ONBOARDING_MANAGER';
UPDATE "users" SET "roles" = array_remove("roles", 'ONBOARDING_MANAGER');
UPDATE "invitations" SET "roles" = array_remove("roles", 'ONBOARDING_MANAGER');

CREATE TYPE "UserRole_new" AS ENUM ('CENTRAL_AUTHORITY', 'PROPERTY_PARTNER', 'BROKER', 'BUYER', 'CONSULTANT', 'INFLUENCER', 'MARKETING_MANAGER', 'LOAN_ADVISOR', 'VISIT_EXECUTIVE');
ALTER TABLE "users" ALTER COLUMN "primaryRole" TYPE "UserRole_new" USING ("primaryRole"::text::"UserRole_new");
ALTER TABLE "users" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TABLE "invitations" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;
