-- CreateTable
CREATE TABLE "marketing_managers" (
    "id" TEXT NOT NULL,
    "keycloakId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketing_managers_keycloakId_key" ON "marketing_managers"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_managers_email_key" ON "marketing_managers"("email");
