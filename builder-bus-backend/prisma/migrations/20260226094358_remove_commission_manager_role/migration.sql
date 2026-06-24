/*
  Warnings:

  - You are about to drop the `commission_manager_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "commission_manager_profiles" DROP CONSTRAINT "commission_manager_profiles_userId_fkey";

-- DropTable
DROP TABLE "commission_manager_profiles";
