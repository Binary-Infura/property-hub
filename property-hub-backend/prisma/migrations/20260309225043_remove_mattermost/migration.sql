/*
  Warnings:

  - You are about to drop the column `mattermostChannelId` on the `chat_sessions` table. All the data in the column will be lost.
  - You are about to drop the `mattermost_user_mappings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "chat_sessions_mattermostChannelId_key";

-- AlterTable
ALTER TABLE "chat_sessions" DROP COLUMN "mattermostChannelId";

-- DropTable
DROP TABLE "mattermost_user_mappings";
