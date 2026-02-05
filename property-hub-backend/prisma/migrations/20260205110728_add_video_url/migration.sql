/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ads_executive_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creative_executive_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketing_lead_profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'DRAFT';
ALTER TYPE "PropertyStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "PropertyStatus" ADD VALUE 'APPROVED';
ALTER TYPE "PropertyStatus" ADD VALUE 'REJECTED';
ALTER TYPE "PropertyStatus" ADD VALUE 'PUBLISHED';

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_regionId_fkey";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "regionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "regions" ADD COLUMN     "city" TEXT,
ADD COLUMN     "continent" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT;

-- DropTable
DROP TABLE "ads_executive_profiles";

-- DropTable
DROP TABLE "creative_executive_profiles";

-- DropTable
DROP TABLE "marketing_lead_profiles";

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_continent_country_state_city_key" ON "locations"("continent", "country", "state", "city");

-- CreateIndex
CREATE INDEX "properties_locationId_idx" ON "properties"("locationId");

-- CreateIndex
CREATE INDEX "regions_locationId_idx" ON "regions"("locationId");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
