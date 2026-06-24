/*
  Warnings:

  - The values [DRAFT] on the enum `UnitStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `cityGeoId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `cityName` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `postalCodeId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `projects` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD');
ALTER TABLE "property_units" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "property_units" ALTER COLUMN "status" TYPE "UnitStatus_new" USING ("status"::text::"UnitStatus_new");
ALTER TYPE "UnitStatus" RENAME TO "UnitStatus_old";
ALTER TYPE "UnitStatus_new" RENAME TO "UnitStatus";
DROP TYPE "UnitStatus_old";
ALTER TABLE "property_units" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_cityGeoId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_postalCodeId_fkey";

-- DropIndex
DROP INDEX "projects_cityGeoId_idx";

-- DropIndex
DROP INDEX "projects_postalCodeId_idx";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "address",
DROP COLUMN "cityGeoId",
DROP COLUMN "cityName",
DROP COLUMN "location",
DROP COLUMN "pincode",
DROP COLUMN "postalCodeId",
DROP COLUMN "state",
ADD COLUMN     "addressId" TEXT;

-- AlterTable
ALTER TABLE "property_units" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googlePlaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addresses_googlePlaceId_key" ON "addresses"("googlePlaceId");

-- CreateIndex
CREATE INDEX "addresses_cityId_idx" ON "addresses"("cityId");

-- CreateIndex
CREATE INDEX "addresses_cityId_pincode_idx" ON "addresses"("cityId", "pincode");

-- CreateIndex
CREATE INDEX "cities_name_idx" ON "cities"("name");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
