-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'DISBURSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeadNoteCategory" AS ENUM ('GENERAL', 'PREFERENCE', 'BUDGET', 'LEGAL', 'FOLLOW_UP');

-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'FOLLOW_UP_STARTED';

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "LeadNoteCategory" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "tenureYears" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "documents" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "sid" TEXT,
    "leadId" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "status" TEXT,
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_notes_leadId_idx" ON "lead_notes"("leadId");

-- CreateIndex
CREATE INDEX "lead_notes_authorId_idx" ON "lead_notes"("authorId");

-- CreateIndex
CREATE INDEX "loans_leadId_idx" ON "loans"("leadId");

-- CreateIndex
CREATE INDEX "loans_projectId_idx" ON "loans"("projectId");

-- CreateIndex
CREATE INDEX "loans_bankId_idx" ON "loans"("bankId");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_sid_key" ON "call_logs"("sid");

-- CreateIndex
CREATE INDEX "call_logs_leadId_idx" ON "call_logs"("leadId");

-- CreateIndex
CREATE INDEX "call_logs_consultantId_idx" ON "call_logs"("consultantId");

-- CreateIndex
CREATE INDEX "call_logs_sid_idx" ON "call_logs"("sid");

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
