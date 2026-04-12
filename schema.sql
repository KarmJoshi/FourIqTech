-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "website" TEXT,
    "contactEmail" TEXT,
    "competitorName" TEXT,
    "competitorWebsite" TEXT,
    "reviewsSnapshot" TEXT,
    "problemTitle" TEXT,
    "problemDetail" TEXT,
    "businessImpact" TEXT,
    "likelyFix" TEXT,
    "confidence" TEXT,
    "status" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "lastTouchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftEmail" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "sentFrom" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deliveryStatus" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "DraftEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagingItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "summary" JSONB,
    "draftPath" TEXT,
    "codePath" TEXT,
    "diffPath" TEXT,
    "metadata" JSONB,
    "managerReview" JSONB,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "StagingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "emoji" TEXT,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cycle" INTEGER NOT NULL,
    "sitrepSummary" JSONB,
    "decision" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence" INTEGER,
    "agencyHealth" INTEGER,
    "scoredRecommendation" TEXT,
    "recommendedOrders" JSONB,
    "crossDeptOrders" TEXT,
    "qualityAudit" JSONB,
    "dispatchSuccess" BOOLEAN,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DraftEmail_leadId_key" ON "DraftEmail"("leadId");

-- AddForeignKey
ALTER TABLE "DraftEmail" ADD CONSTRAINT "DraftEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

