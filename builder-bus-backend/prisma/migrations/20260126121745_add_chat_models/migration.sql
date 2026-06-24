-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "mattermostChannelId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL DEFAULT 'DIRECT',
    "contextType" TEXT,
    "contextId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" TEXT NOT NULL,
    "chatSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mattermost_user_mappings" (
    "id" TEXT NOT NULL,
    "propertyHubUserId" TEXT NOT NULL,
    "mattermostUserId" TEXT NOT NULL,
    "mattermostUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mattermost_user_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_sessions_mattermostChannelId_key" ON "chat_sessions"("mattermostChannelId");

-- CreateIndex
CREATE INDEX "chat_sessions_contextType_contextId_idx" ON "chat_sessions"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "chat_participants_userId_idx" ON "chat_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_chatSessionId_userId_key" ON "chat_participants"("chatSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "mattermost_user_mappings_propertyHubUserId_key" ON "mattermost_user_mappings"("propertyHubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "mattermost_user_mappings_mattermostUserId_key" ON "mattermost_user_mappings"("mattermostUserId");

-- CreateIndex
CREATE INDEX "mattermost_user_mappings_mattermostUserId_idx" ON "mattermost_user_mappings"("mattermostUserId");

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
