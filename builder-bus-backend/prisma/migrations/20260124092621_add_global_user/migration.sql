-- CreateTable
CREATE TABLE "global_users" (
    "id" TEXT NOT NULL,
    "keycloakId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'central-authority',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_users_keycloakId_key" ON "global_users"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "global_users_email_key" ON "global_users"("email");
