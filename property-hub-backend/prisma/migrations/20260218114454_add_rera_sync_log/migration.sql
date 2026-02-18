-- CreateTable
CREATE TABLE "rera_sync_logs" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "status" TEXT NOT NULL,
    "projectsScraped" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "rera_sync_logs_pkey" PRIMARY KEY ("id")
);
