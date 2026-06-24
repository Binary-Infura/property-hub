-- CreateEnum
CREATE TYPE "InstagramStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "property_partner_profiles" ADD COLUMN     "instagramAccessToken" TEXT,
ADD COLUMN     "instagramConnectedAt" TIMESTAMP(3),
ADD COLUMN     "instagramUserId" TEXT,
ADD COLUMN     "instagramUsername" TEXT;

-- AlterTable
ALTER TABLE "reels" ADD COLUMN     "instagramCaption" TEXT,
ADD COLUMN     "instagramPostUrl" TEXT,
ADD COLUMN     "instagramStatus" "InstagramStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "officialInstagramModerationNote" TEXT,
ADD COLUMN     "publishToOfficialInstagram" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishToPartnerInstagram" BOOLEAN NOT NULL DEFAULT false;
