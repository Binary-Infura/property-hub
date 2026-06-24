/*
  Warnings:

  - You are about to drop the `loans` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BuyerLoanStatus" AS ENUM ('NEW', 'DOC_PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BankStatus" AS ENUM ('APPROVED', 'LIMITED', 'NOT_AVAILABLE');

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_bankId_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_leadId_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_projectId_fkey";

-- DropTable
DROP TABLE "loans";

-- DropEnum
DROP TYPE "LoanStatus";

-- CreateTable
CREATE TABLE "buyer_loan_applications" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assignedLoanPartnerId" TEXT,
    "loanAmount" DECIMAL(15,2) NOT NULL,
    "eligibleAmount" DECIMAL(15,2),
    "bankId" TEXT,
    "status" "BuyerLoanStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_loan_applications" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "assignedLoanPartnerId" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "bankStatus" "BankStatus" NOT NULL DEFAULT 'NOT_AVAILABLE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BuyerLoanDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectLoanDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "buyer_loan_applications_leadId_idx" ON "buyer_loan_applications"("leadId");

-- CreateIndex
CREATE INDEX "buyer_loan_applications_assignedLoanPartnerId_idx" ON "buyer_loan_applications"("assignedLoanPartnerId");

-- CreateIndex
CREATE INDEX "buyer_loan_applications_bankId_idx" ON "buyer_loan_applications"("bankId");

-- CreateIndex
CREATE INDEX "buyer_loan_applications_status_idx" ON "buyer_loan_applications"("status");

-- CreateIndex
CREATE INDEX "project_loan_applications_projectId_idx" ON "project_loan_applications"("projectId");

-- CreateIndex
CREATE INDEX "project_loan_applications_bankId_idx" ON "project_loan_applications"("bankId");

-- CreateIndex
CREATE INDEX "project_loan_applications_assignedLoanPartnerId_idx" ON "project_loan_applications"("assignedLoanPartnerId");

-- CreateIndex
CREATE UNIQUE INDEX "project_loan_applications_projectId_bankId_key" ON "project_loan_applications"("projectId", "bankId");

-- CreateIndex
CREATE UNIQUE INDEX "_BuyerLoanDocuments_AB_unique" ON "_BuyerLoanDocuments"("A", "B");

-- CreateIndex
CREATE INDEX "_BuyerLoanDocuments_B_index" ON "_BuyerLoanDocuments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectLoanDocuments_AB_unique" ON "_ProjectLoanDocuments"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectLoanDocuments_B_index" ON "_ProjectLoanDocuments"("B");

-- AddForeignKey
ALTER TABLE "buyer_loan_applications" ADD CONSTRAINT "buyer_loan_applications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_loan_applications" ADD CONSTRAINT "buyer_loan_applications_assignedLoanPartnerId_fkey" FOREIGN KEY ("assignedLoanPartnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_loan_applications" ADD CONSTRAINT "buyer_loan_applications_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_loan_applications" ADD CONSTRAINT "project_loan_applications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_loan_applications" ADD CONSTRAINT "project_loan_applications_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_loan_applications" ADD CONSTRAINT "project_loan_applications_assignedLoanPartnerId_fkey" FOREIGN KEY ("assignedLoanPartnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuyerLoanDocuments" ADD CONSTRAINT "_BuyerLoanDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "buyer_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuyerLoanDocuments" ADD CONSTRAINT "_BuyerLoanDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "user_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectLoanDocuments" ADD CONSTRAINT "_ProjectLoanDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "project_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectLoanDocuments" ADD CONSTRAINT "_ProjectLoanDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "user_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
