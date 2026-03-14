-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "visitExecutiveId" TEXT;

-- CreateIndex
CREATE INDEX "visits_visitExecutiveId_idx" ON "visits"("visitExecutiveId");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visitExecutiveId_fkey" FOREIGN KEY ("visitExecutiveId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
