/*
  Warnings:

  - The values [AVAILABLE,SOLD,RESERVED,PUBLISHED] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVAILABLE] on the enum `UnitStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `videoUrl` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,towerId,unitNumber]` on the table `property_units` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('DRAFT', 'UNDER_CONSTRUCTION', 'SUBMITTED', 'APPROVED', 'REJECTED');
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "ProjectStatus_old";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UnitStatus_new" AS ENUM ('DRAFT', 'RESERVED', 'BOOKED', 'SOLD');
ALTER TABLE "property_units" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "property_units" ALTER COLUMN "status" TYPE "UnitStatus_new" USING ("status"::text::"UnitStatus_new");
ALTER TYPE "UnitStatus" RENAME TO "UnitStatus_old";
ALTER TYPE "UnitStatus_new" RENAME TO "UnitStatus";
DROP TYPE "UnitStatus_old";
ALTER TABLE "property_units" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "property_units" DROP CONSTRAINT "property_units_towerId_fkey";

-- DropIndex
DROP INDEX "property_units_projectId_unitNumber_key";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "videoUrl",
ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY['Parking', 'Security', 'Lift']::TEXT[],
ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY['Prime Location', 'Quality Construction']::TEXT[],
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "property_units" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "property_units_projectId_towerId_unitNumber_key" ON "property_units"("projectId", "towerId", "unitNumber");

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
