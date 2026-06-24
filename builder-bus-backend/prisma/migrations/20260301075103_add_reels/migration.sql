/*
  Warnings:

  - You are about to drop the column `propertyId` on the `ads_requests` table. All the data in the column will be lost.
  - You are about to drop the column `cityCode` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `city_allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsa_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `properties` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `cities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,officeName]` on the table `postal_codes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `commissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED', 'UNDER_CONSTRUCTION', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD');

-- CreateEnum
CREATE TYPE "SubscriptionMode" AS ENUM ('PAID', 'FREE');

-- DropForeignKey
ALTER TABLE "ads_requests" DROP CONSTRAINT "ads_requests_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "city_allocations" DROP CONSTRAINT "city_allocations_userId_fkey";

-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "dsa_profiles" DROP CONSTRAINT "dsa_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_onboardedById_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_postalCodeId_fkey";

-- DropIndex
DROP INDEX "cities_cityCode_key";

-- DropIndex
DROP INDEX "commissions_propertyId_idx";

-- AlterTable
ALTER TABLE "ads_requests" DROP COLUMN "propertyId",
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "cities" DROP COLUMN "cityCode",
DROP COLUMN "continent",
DROP COLUMN "country",
DROP COLUMN "description",
DROP COLUMN "tags",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "commissions" DROP COLUMN "propertyId",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "propertyId",
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "property_partner_profiles" ADD COLUMN     "subscriptionMode" "SubscriptionMode" NOT NULL DEFAULT 'PAID';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "defaultRole" TEXT,
ADD COLUMN     "roles" TEXT[];

-- DropTable
DROP TABLE "city_allocations";

-- DropTable
DROP TABLE "dsa_profiles";

-- DropTable
DROP TABLE "properties";

-- DropEnum
DROP TYPE "PropertyStatus";

-- DropEnum
DROP TYPE "PropertyType";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" DECIMAL(15,2) NOT NULL,
    "area" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "projectType" "ProjectType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardedById" TEXT,
    "category" TEXT,
    "cityId" TEXT,
    "videoUrl" TEXT,
    "postalCodeId" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_units" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "floor" INTEGER,
    "type" TEXT,
    "area" DECIMAL(10,2),
    "price" DECIMAL(15,2) NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buyerName" TEXT,
    "buyerPhone" TEXT,
    "salePrice" DECIMAL(15,2),
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "property_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reels" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyBusinessName" TEXT NOT NULL,
    "reraNumber" TEXT,
    "officeAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rera_district_counts" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "projectCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rera_district_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postal_code_sync_logs" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "lastOffset" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "postal_code_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectAssignment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "projects_postalCodeId_idx" ON "projects"("postalCodeId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_onboardedById_idx" ON "projects"("onboardedById");

-- CreateIndex
CREATE INDEX "property_units_projectId_idx" ON "property_units"("projectId");

-- CreateIndex
CREATE INDEX "property_units_status_idx" ON "property_units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "property_units_projectId_unitNumber_key" ON "property_units"("projectId", "unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "broker_profiles_userId_key" ON "broker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_key" ON "banks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rera_district_counts_state_district_key" ON "rera_district_counts"("state", "district");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectAssignment_AB_unique" ON "_ProjectAssignment"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectAssignment_B_index" ON "_ProjectAssignment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE INDEX "commissions_projectId_idx" ON "commissions"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "postal_codes_code_officeName_key" ON "postal_codes"("code", "officeName");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_onboardedById_fkey" FOREIGN KEY ("onboardedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_postalCodeId_fkey" FOREIGN KEY ("postalCodeId") REFERENCES "postal_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reels" ADD CONSTRAINT "reels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_profiles" ADD CONSTRAINT "broker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_requests" ADD CONSTRAINT "ads_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAssignment" ADD CONSTRAINT "_ProjectAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAssignment" ADD CONSTRAINT "_ProjectAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
