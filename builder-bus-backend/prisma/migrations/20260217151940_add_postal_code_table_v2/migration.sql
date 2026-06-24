-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "postalCodeId" TEXT;

-- CreateTable
CREATE TABLE "postal_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "circleName" TEXT,
    "regionName" TEXT,
    "divisionName" TEXT,
    "officeName" TEXT,
    "officeType" TEXT,
    "delivery" TEXT,
    "district" TEXT,
    "stateName" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "regionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "postal_codes_code_idx" ON "postal_codes"("code");

-- CreateIndex
CREATE INDEX "postal_codes_regionId_idx" ON "postal_codes"("regionId");

-- CreateIndex
CREATE INDEX "postal_codes_district_idx" ON "postal_codes"("district");

-- CreateIndex
CREATE INDEX "properties_postalCodeId_idx" ON "properties"("postalCodeId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_postalCodeId_fkey" FOREIGN KEY ("postalCodeId") REFERENCES "postal_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postal_codes" ADD CONSTRAINT "postal_codes_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
