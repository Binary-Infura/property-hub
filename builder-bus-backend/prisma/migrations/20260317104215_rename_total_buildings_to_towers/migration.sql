/*
  Warnings:

  - You are about to drop the column `totalBuildings` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "totalBuildings",
ADD COLUMN     "totalTowers" INTEGER;
