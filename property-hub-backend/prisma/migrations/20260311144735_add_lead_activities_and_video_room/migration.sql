/*
  Warnings:

  - You are about to drop the column `agencyName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `defaultRole` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `visitsConducted` on the `users` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `roles` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `broker_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `buyer_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `central_authority_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consultant_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `influencer_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketing_manager_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `property_partner_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_metadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CENTRAL_AUTHORITY', 'PROPERTY_PARTNER', 'BROKER', 'BUYER', 'CONSULTANT', 'INFLUENCER', 'MARKETING_MANAGER', 'LOAN_ADVISOR', 'ONBOARDING_MANAGER', 'VISIT_EXECUTIVE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "ConsultantType" AS ENUM ('PLATFORM', 'PROPERTY_PARTNER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PLATFORM', 'BUILDER', 'BROKERAGE', 'MARKETING_AGENCY');

-- DropForeignKey
ALTER TABLE "broker_profiles" DROP CONSTRAINT "broker_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "buyer_profiles" DROP CONSTRAINT "buyer_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "central_authority_profiles" DROP CONSTRAINT "central_authority_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "consultant_profiles" DROP CONSTRAINT "consultant_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "influencer_profiles" DROP CONSTRAINT "influencer_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "marketing_manager_profiles" DROP CONSTRAINT "marketing_manager_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "property_partner_profiles" DROP CONSTRAINT "property_partner_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_metadata" DROP CONSTRAINT "user_metadata_userId_fkey";

-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "leadId" TEXT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "videoCallRoom" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "agencyName",
DROP COLUMN "defaultRole",
DROP COLUMN "rating",
DROP COLUMN "visitsConducted",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "notifications" JSONB DEFAULT '{}',
ADD COLUMN     "onboardingStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "primaryRole" "UserRole",
ADD COLUMN     "profileData" JSONB DEFAULT '{}',
ADD COLUMN     "regionPreference" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "theme" TEXT DEFAULT 'light',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "roles",
ADD COLUMN     "roles" "UserRole"[];

-- DropTable
DROP TABLE "broker_profiles";

-- DropTable
DROP TABLE "buyer_profiles";

-- DropTable
DROP TABLE "central_authority_profiles";

-- DropTable
DROP TABLE "consultant_profiles";

-- DropTable
DROP TABLE "influencer_profiles";

-- DropTable
DROP TABLE "marketing_manager_profiles";

-- DropTable
DROP TABLE "property_partner_profiles";

-- DropTable
DROP TABLE "user_metadata";

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "licenseNumber" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionMode" "SubscriptionMode" NOT NULL DEFAULT 'PAID',
    "instagramAccessToken" TEXT,
    "instagramUserId" TEXT,
    "instagramUsername" TEXT,
    "instagramConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");

-- CreateIndex
CREATE INDEX "ads_requests_requestedById_idx" ON "ads_requests"("requestedById");

-- CreateIndex
CREATE INDEX "ads_requests_status_idx" ON "ads_requests"("status");

-- CreateIndex
CREATE INDEX "follows_followerId_idx" ON "follows"("followerId");

-- CreateIndex
CREATE INDEX "follows_followingId_idx" ON "follows"("followingId");

-- CreateIndex
CREATE INDEX "leads_projectId_idx" ON "leads"("projectId");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns"("status");

-- CreateIndex
CREATE INDEX "projects_cityId_idx" ON "projects"("cityId");

-- CreateIndex
CREATE INDEX "projects_projectType_idx" ON "projects"("projectType");

-- CreateIndex
CREATE INDEX "reels_userId_idx" ON "reels"("userId");

-- CreateIndex
CREATE INDEX "reels_projectId_idx" ON "reels"("projectId");

-- CreateIndex
CREATE INDEX "reviews_isApproved_idx" ON "reviews"("isApproved");

-- CreateIndex
CREATE INDEX "user_documents_userId_idx" ON "user_documents"("userId");

-- CreateIndex
CREATE INDEX "user_documents_category_idx" ON "user_documents"("category");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_primaryRole_idx" ON "users"("primaryRole");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_onboardedById_idx" ON "users"("onboardedById");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
