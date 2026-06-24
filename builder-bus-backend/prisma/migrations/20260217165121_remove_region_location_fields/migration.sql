/*
  Warnings:

  - You are about to drop the column `city` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `regions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "regions" DROP COLUMN "city",
DROP COLUMN "continent",
DROP COLUMN "country",
DROP COLUMN "state";
