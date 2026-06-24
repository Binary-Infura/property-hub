/*
  Warnings:

  - You are about to drop the column `keycloakId` on the `user_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `keycloakId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `user_metadata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `user_metadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_metadata_keycloakId_idx";

-- DropIndex
DROP INDEX "user_metadata_keycloakId_key";

-- DropIndex
DROP INDEX "users_keycloakId_key";

-- AlterTable
ALTER TABLE "user_metadata" DROP COLUMN "keycloakId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "keycloakId";

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_userId_key" ON "user_metadata"("userId");

-- AddForeignKey
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
