-- CreateEnum
CREATE TYPE "EmployeeRange" AS ENUM ('SOLO', 'MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "RevenueRange" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "HamburgDistrict" AS ENUM ('MITTE', 'ALTONA', 'EIMSBUETTEL', 'NORD', 'WANDSBEK', 'BERGEDORF', 'HARBURG', 'HAFENCITY', 'SPEICHERSTADT', 'UMLAND_NORD', 'UMLAND_SUED');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('B2B', 'B2C', 'B2B2C', 'B2G');

-- CreateEnum
CREATE TYPE "CustomerCountRange" AS ENUM ('VERY_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "MarketReach" AS ENUM ('LOCAL', 'REGIONAL', 'NATIONAL', 'EU', 'GLOBAL');

-- CreateEnum
CREATE TYPE "Seasonality" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "LeadershipStructure" AS ENUM ('OWNER_LED', 'FAMILY_BUSINESS', 'PROFESSIONAL_MANAGEMENT', 'PARTNERSHIP', 'COOPERATIVE');

-- CreateEnum
CREATE TYPE "DecisionSpeed" AS ENUM ('VERY_FAST', 'FAST', 'MODERATE', 'SLOW', 'VERY_SLOW');

-- CreateEnum
CREATE TYPE "GrowthPhase" AS ENUM ('STARTUP', 'GROWTH', 'SCALING', 'ESTABLISHED', 'MATURE', 'TRANSFORMATION');

-- CreateEnum
CREATE TYPE "ExpansionType" AS ENUM ('NEW_LOCATIONS', 'NEW_PRODUCTS', 'NEW_MARKETS', 'DIGITALIZATION', 'ACQUISITIONS', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SUPPLIER_CUSTOMER', 'PARTNERSHIP', 'SERVICE_PROVIDER', 'COLLABORATION', 'NETWORKING', 'KNOWLEDGE_EXCHANGE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CONNECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('PROFILE_VIEW', 'MATCH_SENT', 'MATCH_RECEIVED', 'MATCH_ACCEPTED', 'MATCH_DECLINED', 'MESSAGE_SENT', 'MESSAGE_READ', 'CONTACT_SHARED', 'MEETING_SCHEDULED', 'BUSINESS_CARD_EXCHANGED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROFILE_UPDATED', 'MATCH_CREATED', 'MATCH_SUCCESSFUL', 'NEW_CONNECTION', 'PROFILE_COMPLETED', 'INDUSTRY_UPDATED', 'LOCATION_CHANGED', 'GROWTH_MILESTONE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalForm" TEXT,
    "foundedYear" INTEGER NOT NULL,
    "registrationNumber" TEXT,
    "employeeCount" INTEGER NOT NULL DEFAULT 1,
    "employeeRange" "EmployeeRange" NOT NULL DEFAULT 'SOLO',
    "annualRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueRange" "RevenueRange" NOT NULL DEFAULT 'MICRO',
    "street" TEXT,
    "zipCode" TEXT,
    "district" "HamburgDistrict",
    "customerType" "CustomerType" NOT NULL DEFAULT 'B2B',
    "customerCount" "CustomerCountRange" NOT NULL DEFAULT 'VERY_SMALL',
    "exportQuota" INTEGER NOT NULL DEFAULT 0,
    "marketReach" "MarketReach" NOT NULL DEFAULT 'LOCAL',
    "seasonality" "Seasonality" NOT NULL DEFAULT 'NONE',
    "leadershipStructure" "LeadershipStructure" NOT NULL DEFAULT 'OWNER_LED',
    "decisionSpeed" "DecisionSpeed" NOT NULL DEFAULT 'MODERATE',
    "decisionMakers" INTEGER NOT NULL DEFAULT 1,
    "growthPhase" "GrowthPhase" NOT NULL DEFAULT 'ESTABLISHED',
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sustainabilityFocus" INTEGER NOT NULL DEFAULT 5,
    "branchDescription" TEXT,
    "companyDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profileCompleteness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastMatchingUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationAdvantage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "LocationAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTag" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "IndustryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecondaryNaceCode" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "SecondaryNaceCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpansionPlan" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "ExpansionType" NOT NULL,

    CONSTRAINT "ExpansionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceNeed" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ComplianceNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityStandard" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,

    CONSTRAINT "QualityStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainPoint" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "point" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "PainPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchingFor" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "SearchingFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingTo" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "OfferingTo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxDistance" INTEGER NOT NULL DEFAULT 50,
    "preferredDistricts" "HamburgDistrict"[],
    "minEmployees" INTEGER,
    "maxEmployees" INTEGER,
    "preferredSizes" "EmployeeRange"[],
    "preferredCustomerTypes" "CustomerType"[],
    "preferredMarketReach" "MarketReach"[],
    "minGrowthRate" DOUBLE PRECISION,
    "preferredGrowthPhases" "GrowthPhase"[],
    "minSustainabilityFocus" INTEGER NOT NULL DEFAULT 1,
    "autoMatch" BOOLEAN NOT NULL DEFAULT true,
    "weeklyMatches" INTEGER NOT NULL DEFAULT 5,
    "matchingActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "receiverUserId" TEXT NOT NULL,
    "senderCompanyId" TEXT NOT NULL,
    "receiverCompanyId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchType" "MatchType" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "matchReasons" JSONB NOT NULL,
    "commonInterests" JSONB NOT NULL,
    "potentialSynergies" JSONB NOT NULL,
    "message" TEXT,
    "response" TEXT,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "matchId" TEXT,
    "type" "InteractionType" NOT NULL,
    "details" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "Company_district_idx" ON "Company"("district");

-- CreateIndex
CREATE INDEX "Company_employeeRange_idx" ON "Company"("employeeRange");

-- CreateIndex
CREATE INDEX "Company_revenueRange_idx" ON "Company"("revenueRange");

-- CreateIndex
CREATE INDEX "Company_customerType_idx" ON "Company"("customerType");

-- CreateIndex
CREATE INDEX "Company_marketReach_idx" ON "Company"("marketReach");

-- CreateIndex
CREATE INDEX "Company_growthPhase_idx" ON "Company"("growthPhase");

-- CreateIndex
CREATE INDEX "Company_matchingScore_idx" ON "Company"("matchingScore");

-- CreateIndex
CREATE INDEX "Company_profileCompleteness_idx" ON "Company"("profileCompleteness");

-- CreateIndex
CREATE INDEX "LocationAdvantage_companyId_idx" ON "LocationAdvantage"("companyId");

-- CreateIndex
CREATE INDEX "IndustryTag_companyId_idx" ON "IndustryTag"("companyId");

-- CreateIndex
CREATE INDEX "IndustryTag_value_idx" ON "IndustryTag"("value");

-- CreateIndex
CREATE INDEX "SecondaryNaceCode_companyId_idx" ON "SecondaryNaceCode"("companyId");

-- CreateIndex
CREATE INDEX "SecondaryNaceCode_code_idx" ON "SecondaryNaceCode"("code");

-- CreateIndex
CREATE INDEX "ExpansionPlan_companyId_idx" ON "ExpansionPlan"("companyId");

-- CreateIndex
CREATE INDEX "ExpansionPlan_type_idx" ON "ExpansionPlan"("type");

-- CreateIndex
CREATE INDEX "Certification_companyId_idx" ON "Certification"("companyId");

-- CreateIndex
CREATE INDEX "Certification_name_idx" ON "Certification"("name");

-- CreateIndex
CREATE INDEX "ComplianceNeed_companyId_idx" ON "ComplianceNeed"("companyId");

-- CreateIndex
CREATE INDEX "QualityStandard_companyId_idx" ON "QualityStandard"("companyId");

-- CreateIndex
CREATE INDEX "PainPoint_companyId_idx" ON "PainPoint"("companyId");

-- CreateIndex
CREATE INDEX "PainPoint_point_idx" ON "PainPoint"("point");

-- CreateIndex
CREATE INDEX "SearchingFor_companyId_idx" ON "SearchingFor"("companyId");

-- CreateIndex
CREATE INDEX "SearchingFor_category_idx" ON "SearchingFor"("category");

-- CreateIndex
CREATE INDEX "OfferingTo_companyId_idx" ON "OfferingTo"("companyId");

-- CreateIndex
CREATE INDEX "OfferingTo_category_idx" ON "OfferingTo"("category");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingPreferences_userId_key" ON "MatchingPreferences"("userId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_matchScore_idx" ON "Match"("matchScore");

-- CreateIndex
CREATE INDEX "Match_matchedAt_idx" ON "Match"("matchedAt");

-- CreateIndex
CREATE INDEX "Match_expiresAt_idx" ON "Match"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_senderUserId_receiverUserId_key" ON "Match"("senderUserId", "receiverUserId");

-- CreateIndex
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");

-- CreateIndex
CREATE INDEX "Interaction_type_idx" ON "Interaction"("type");

-- CreateIndex
CREATE INDEX "Interaction_createdAt_idx" ON "Interaction"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAdvantage" ADD CONSTRAINT "LocationAdvantage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTag" ADD CONSTRAINT "IndustryTag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecondaryNaceCode" ADD CONSTRAINT "SecondaryNaceCode_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpansionPlan" ADD CONSTRAINT "ExpansionPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceNeed" ADD CONSTRAINT "ComplianceNeed_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityStandard" ADD CONSTRAINT "QualityStandard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPoint" ADD CONSTRAINT "PainPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchingFor" ADD CONSTRAINT "SearchingFor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingTo" ADD CONSTRAINT "OfferingTo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingPreferences" ADD CONSTRAINT "MatchingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_senderCompanyId_fkey" FOREIGN KEY ("senderCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_receiverCompanyId_fkey" FOREIGN KEY ("receiverCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
