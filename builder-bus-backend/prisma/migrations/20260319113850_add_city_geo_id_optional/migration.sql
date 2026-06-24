/*
  Warnings:

  - You are about to drop the column `cityId` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[geoId]` on the table `cities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_cityId_fkey";

-- DropIndex
DROP INDEX "cities_name_key";

-- DropIndex
DROP INDEX "projects_cityId_idx";

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "geoId" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "cityId",
ADD COLUMN     "cityGeoId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "cities_geoId_key" ON "cities"("geoId");

-- CreateIndex
CREATE INDEX "projects_cityGeoId_idx" ON "projects"("cityGeoId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cityGeoId_fkey" FOREIGN KEY ("cityGeoId") REFERENCES "cities"("geoId") ON DELETE SET NULL ON UPDATE CASCADE;
