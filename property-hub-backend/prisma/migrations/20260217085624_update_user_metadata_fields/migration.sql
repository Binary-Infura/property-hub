-- AlterTable
ALTER TABLE "user_metadata" ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "notifications" JSONB DEFAULT '{}',
ADD COLUMN     "onboardingStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "theme" TEXT DEFAULT 'light';
