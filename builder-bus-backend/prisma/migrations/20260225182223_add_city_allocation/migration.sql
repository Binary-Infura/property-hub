/*
  Warnings:

  - You are about to drop the column `regionId` on the `ads_requests` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `postal_codes` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_CampaignToRegion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RegionToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `channel_partner_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `regional_manager_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `regions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CampaignToRegion" DROP CONSTRAINT "_CampaignToRegion_A_fkey";

-- DropForeignKey
ALTER TABLE "_CampaignToRegion" DROP CONSTRAINT "_CampaignToRegion_B_fkey";

-- DropForeignKey
ALTER TABLE "_RegionToUser" DROP CONSTRAINT "_RegionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RegionToUser" DROP CONSTRAINT "_RegionToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "ads_requests" DROP CONSTRAINT "ads_requests_regionId_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_regionId_fkey";

-- DropForeignKey
ALTER TABLE "postal_codes" DROP CONSTRAINT "postal_codes_regionId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_regionId_fkey";

-- DropForeignKey
ALTER TABLE "regions" DROP CONSTRAINT "regions_locationId_fkey";

-- DropIndex
DROP INDEX "leads_regionId_idx";

-- DropIndex
DROP INDEX "postal_codes_regionId_idx";

-- DropIndex
DROP INDEX "properties_regionId_idx";

-- AlterTable
ALTER TABLE "ads_requests" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "postal_codes" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "metadata";

-- DropTable
DROP TABLE "_CampaignToRegion";

-- DropTable
DROP TABLE "_RegionToUser";

-- DropTable
DROP TABLE "channel_partner_profiles";

-- DropTable
DROP TABLE "regional_manager_profiles";

-- DropTable
DROP TABLE "regions";

-- CreateTable
CREATE TABLE "influencer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socialMediaLinks" JSONB,
    "reach" INTEGER,
    "niche" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dsa_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyBusinessName" TEXT NOT NULL,
    "reraNumber" TEXT,
    "officeAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsa_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_allocations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencer_profiles_userId_key" ON "influencer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dsa_profiles_userId_key" ON "dsa_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "city_allocations_userId_stateCode_cityName_key" ON "city_allocations"("userId", "stateCode", "cityName");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "central_authority_profiles" ADD CONSTRAINT "central_authority_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_partner_profiles" ADD CONSTRAINT "property_partner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsa_profiles" ADD CONSTRAINT "dsa_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_manager_profiles" ADD CONSTRAINT "commission_manager_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_manager_profiles" ADD CONSTRAINT "marketing_manager_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_profiles" ADD CONSTRAINT "consultant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "service_provider_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_allocations" ADD CONSTRAINT "city_allocations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
