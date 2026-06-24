/*
  Warnings:

  - You are about to drop the column `locationId` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_locationId_fkey";

-- DropIndex
DROP INDEX "properties_locationId_idx";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "locationId";

-- DropTable
DROP TABLE "locations";

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "continent" TEXT NOT NULL DEFAULT 'Asia',
    "description" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_cityCode_key" ON "cities"("cityCode");
