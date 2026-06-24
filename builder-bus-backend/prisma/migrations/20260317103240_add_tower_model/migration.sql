-- AlterTable
ALTER TABLE "property_units" ADD COLUMN     "towerId" TEXT;

-- CreateTable
CREATE TABLE "towers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalFloors" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "towers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "towers_projectId_idx" ON "towers"("projectId");

-- CreateIndex
CREATE INDEX "property_units_towerId_idx" ON "property_units"("towerId");

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "towers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "towers" ADD CONSTRAINT "towers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
