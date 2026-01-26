-- CreateTable
CREATE TABLE "central_authority_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "accessLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "central_authority_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_partner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT,
    "taxId" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_partner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyBusinessName" TEXT NOT NULL,
    "reraNumber" TEXT,
    "officeAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_manager_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "territory" TEXT,
    "kpiTargets" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_manager_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentAuthorityLimit" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_manager_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignBudgetLimit" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_lead_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_lead_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_executive_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platformSpecialty" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_executive_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_executive_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creative_executive_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT[],
    "experienceYears" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetMin" DECIMAL(15,2),
    "budgetMax" DECIMAL(15,2),
    "preferredLocations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "central_authority_profiles_userId_key" ON "central_authority_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "property_partner_profiles_userId_key" ON "property_partner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "channel_partner_profiles_userId_key" ON "channel_partner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "regional_manager_profiles_userId_key" ON "regional_manager_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "commission_manager_profiles_userId_key" ON "commission_manager_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_manager_profiles_userId_key" ON "marketing_manager_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_lead_profiles_userId_key" ON "marketing_lead_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ads_executive_profiles_userId_key" ON "ads_executive_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "creative_executive_profiles_userId_key" ON "creative_executive_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "consultant_profiles_userId_key" ON "consultant_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_profiles_userId_key" ON "buyer_profiles"("userId");
