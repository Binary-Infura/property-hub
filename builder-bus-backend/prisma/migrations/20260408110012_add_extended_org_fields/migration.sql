-- AlterTable
ALTER TABLE "marketing_campaigns" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "about" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tagline" TEXT;

-- CreateIndex
CREATE INDEX "marketing_campaigns_projectId_idx" ON "marketing_campaigns"("projectId");

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
