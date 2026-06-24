/*
  Warnings:

  - You are about to drop the `_RegionToRegionalManager` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `global_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketing_managers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `regional_managers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RegionToRegionalManager" DROP CONSTRAINT "_RegionToRegionalManager_A_fkey";

-- DropForeignKey
ALTER TABLE "_RegionToRegionalManager" DROP CONSTRAINT "_RegionToRegionalManager_B_fkey";

-- DropTable
DROP TABLE "_RegionToRegionalManager";

-- DropTable
DROP TABLE "global_users";

-- DropTable
DROP TABLE "marketing_managers";

-- DropTable
DROP TABLE "regional_managers";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "keycloakId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RegionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloakId_key" ON "users"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RegionToUser_AB_unique" ON "_RegionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RegionToUser_B_index" ON "_RegionToUser"("B");

-- AddForeignKey
ALTER TABLE "_RegionToUser" ADD CONSTRAINT "_RegionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToUser" ADD CONSTRAINT "_RegionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
