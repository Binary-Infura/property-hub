-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "onboardedById" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardedById" TEXT;

-- CreateTable
CREATE TABLE "service_provider_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "availabilityDays" TEXT[],
    "availabilityHours" TEXT NOT NULL,
    "rates" TEXT,
    "portfolio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_provider_profiles_userId_key" ON "service_provider_profiles"("userId");

-- CreateIndex
CREATE INDEX "properties_onboardedById_idx" ON "properties"("onboardedById");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_onboardedById_fkey" FOREIGN KEY ("onboardedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_onboardedById_fkey" FOREIGN KEY ("onboardedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
