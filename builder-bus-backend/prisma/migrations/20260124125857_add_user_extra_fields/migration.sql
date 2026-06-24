-- AlterTable
ALTER TABLE "users" ADD COLUMN     "agencyName" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reraId" TEXT,
ADD COLUMN     "visitsConducted" INTEGER DEFAULT 0;
