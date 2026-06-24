-- CreateTable
CREATE TABLE "regional_managers" (
    "id" TEXT NOT NULL,
    "keycloakId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RegionToRegionalManager" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "regional_managers_keycloakId_key" ON "regional_managers"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "regional_managers_email_key" ON "regional_managers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RegionToRegionalManager_AB_unique" ON "_RegionToRegionalManager"("A", "B");

-- CreateIndex
CREATE INDEX "_RegionToRegionalManager_B_index" ON "_RegionToRegionalManager"("B");

-- AddForeignKey
ALTER TABLE "_RegionToRegionalManager" ADD CONSTRAINT "_RegionToRegionalManager_A_fkey" FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToRegionalManager" ADD CONSTRAINT "_RegionToRegionalManager_B_fkey" FOREIGN KEY ("B") REFERENCES "regional_managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
