-- CreateTable
CREATE TABLE "rera_projects" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "reraNumber" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "promoterName" TEXT NOT NULL,
    "status" TEXT,
    "district" TEXT,
    "address" TEXT,
    "registrationDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rera_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rera_projects_reraNumber_key" ON "rera_projects"("reraNumber");
