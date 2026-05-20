node.exe : Loaded Prisma config from prisma.config.ts.
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program 
Files\nodejs/node_mo ...
+ 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Loaded Prisma c...isma.c 
   onfig.ts.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "AgencyConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isAutoPilot" BOOLEAN NOT NULL DEFAULT false,
    "isAutoCommit" BOOLEAN NOT NULL DEFAULT false,
    "apiMode" TEXT NOT NULL DEFAULT 'free',
    "startTime" TEXT NOT NULL DEFAULT '10:00',
    "cyclesPerDay" INTEGER NOT NULL DEFAULT 1,
    "lastRunAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentModels" JSONB,

    CONSTRAINT "AgencyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentState" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "currentOrders" JSONB,
    "activeTasks" JSONB,
    "lastCycleAt" TIMESTAMP(3),
    "lastDecision" TEXT,
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentState_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT NOT NULL,
    "playbook" TEXT NOT NULL,
    "targetSlug" TEXT,
    "targetUrl" TEXT,
    "description" TEXT,
    "baseline" JSONB,
    "score" DOUBLE PRECISION,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionOutcome" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metricsCurrent" JSONB,
    "delta" JSONB,
    "successScore" DOUBLE PRECISION NOT NULL,
    "verdict" TEXT NOT NULL,

    CONSTRAINT "ActionOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- CreateTable
CREATE TABLE "GscDailySnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalClicks" INTEGER NOT NULL,
    "totalImpressions" INTEGER NOT NULL,
    "avgPosition" DOUBLE PRECISION NOT NULL,
    "avgCtr" DOUBLE PRECISION NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "topPages" JSONB,
    "topQueries" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GscDailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscPageMetric" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 100,

    CONSTRAINT "GscPageMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscQueryMetric" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "query" TEXT NOT NULL,
    "pageUrl" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 100,

    CONSTRAINT "GscQueryMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscInsight" (
    "id" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "pageUrl" TEXT,
    "query" TEXT,
    "insightText" TEXT NOT NULL,
    "metricsBefore" JSONB,
    "metricsAfter" JSONB,
    "changePeriod" TEXT,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "GscInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchPerformance" (
    "id" TEXT NOT NULL,
    "dateRangeStart" TEXT NOT NULL,
    "dateRangeEnd" TEXT NOT NULL,
    "totalClicks" INTEGER NOT NULL,
    "totalImpressions" INTEGER NOT NULL,
    "avgPosition" DOUBLE PRECISION NOT NULL,
    "avgCtr" DOUBLE PRECISION NOT NULL,
    "page1Count" INTEGER NOT NULL,
    "fullReport" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookStat" (
    "id" TEXT NOT NULL,
    "playbook" TEXT NOT NULL,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "avgSuccessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestResult" JSONB,
    "worstResult" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnedPattern" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "evidence" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timesProven" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LearnedPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordMemory" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "firstTargeted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTargeted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesTargeted" INTEGER NOT NULL DEFAULT 1,
    "bestPosition" DOUBLE PRECISION,
    "currentPosition" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "department" TEXT,
    "cluster" TEXT,
    "notes" TEXT,

    CONSTRAINT "KeywordMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySummary" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "articlesPublished" INTEGER NOT NULL DEFAULT 0,
    "pagesCreated" INTEGER NOT NULL DEFAULT 0,
    "techFixesApplied" INTEGER NOT NULL DEFAULT 0,
    "directorCycles" INTEGER NOT NULL DEFAULT 0,
    "topWin" TEXT,
    "topLoss" TEXT,
    "keyInsights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blacklist" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyContext" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'FourIQ Tech',
    "website" TEXT NOT NULL DEFAULT 'https://www.fouriqtech.com',
    "about" TEXT,
    "services" JSONB,
    "targetAudience" JSONB,
    "brandVoice" TEXT,
    "goals" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCluster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pillarPage" TEXT,
    "pillarKeyword" TEXT,
    "supportingPages" JSONB,
    "status" TEXT NOT NULL DEFAULT 'growing',
    "authority" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "readTime" TEXT NOT NULL DEFAULT '5 min read',
    "category" TEXT NOT NULL DEFAULT 'Engineering',
    "author" TEXT NOT NULL DEFAULT 'FouriqTech Engineering',
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "schemaJson" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "targetKeyword" TEXT,
    "cluster" TEXT,
    "qaScore" INTEGER,
    "structure" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "schemaJson" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "targetKeyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechAuditReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" INTEGER NOT NULL,
    "perfScore" INTEGER,
    "seoScore" INTEGER,
    "patchesApplied" INTEGER NOT NULL DEFAULT 0,
    "qaVerdict" TEXT,
    "modules" JSONB,
    "recommendations" JSONB,

    CONSTRAINT "TechAuditReport_pkey" PRIMARY KEY ("id")
);

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
    "auditScore" INTEGER,
    "lighthouseScores" JSONB,
    "seoIssues" JSONB,
    "competitorScore" INTEGER,
    "competitorGaps" JSONB,
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
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "topicPillar" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "caption" TEXT,
    "hashtags" TEXT,
    "visualPrompt" TEXT,
    "reelScript" JSONB,
    "quizData" JSONB,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "externalPostId" TEXT,
    "engagementStats" JSONB,
    "estimatedCost" DOUBLE PRECISION DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_source_idx" ON "ActivityLog"("source");

-- CreateIndex
CREATE INDEX "AgentAction_timestamp_idx" ON "AgentAction"("timestamp");

-- CreateIndex
CREATE INDEX "AgentAction_department_idx" ON "AgentAction"("department");

-- CreateIndex
CREATE INDEX "AgentAction_targetSlug_idx" ON "AgentAction"("targetSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ActionOutcome_actionId_key" ON "ActionOutcome"("actionId");

-- CreateIndex
CREATE INDEX "ActionOutcome_verdict_idx" ON "ActionOutcome"("verdict");

-- CreateIndex
CREATE INDEX "ActionOutcome_evaluatedAt_idx" ON "ActionOutcome"("evaluatedAt");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "GscDailySnapshot_date_idx" ON "GscDailySnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "GscDailySnapshot_date_key" ON "GscDailySnapshot"("date");

-- CreateIndex
CREATE INDEX "GscPageMetric_pageUrl_idx" ON "GscPageMetric"("pageUrl");

-- CreateIndex
CREATE INDEX "GscPageMetric_date_idx" ON "GscPageMetric"("date");

-- CreateIndex
CREATE INDEX "GscPageMetric_position_idx" ON "GscPageMetric"("position");

-- CreateIndex
CREATE UNIQUE INDEX "GscPageMetric_date_pageUrl_key" ON "GscPageMetric"("date", "pageUrl");

-- CreateIndex
CREATE INDEX "GscQueryMetric_query_idx" ON "GscQueryMetric"("query");

-- CreateIndex
CREATE INDEX "GscQueryMetric_date_idx" ON "GscQueryMetric"("date");

-- CreateIndex
CREATE INDEX "GscQueryMetric_position_idx" ON "GscQueryMetric"("position");

-- CreateIndex
CREATE UNIQUE INDEX "GscQueryMetric_date_query_key" ON "GscQueryMetric"("date", "query");

-- CreateIndex
CREATE INDEX "GscInsight_type_idx" ON "GscInsight"("type");

-- CreateIndex
CREATE INDEX "GscInsight_generatedAt_idx" ON "GscInsight"("generatedAt");

-- CreateIndex
CREATE INDEX "GscInsight_pageUrl_idx" ON "GscInsight"("pageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookStat_playbook_key" ON "PlaybookStat"("playbook");

-- CreateIndex
CREATE INDEX "PlaybookStat_avgSuccessScore_idx" ON "PlaybookStat"("avgSuccessScore");

-- CreateIndex
CREATE INDEX "LearnedPattern_type_idx" ON "LearnedPattern"("type");

-- CreateIndex
CREATE INDEX "LearnedPattern_department_idx" ON "LearnedPattern"("department");

-- CreateIndex
CREATE INDEX "LearnedPattern_confidence_idx" ON "LearnedPattern"("confidence");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordMemory_keyword_key" ON "KeywordMemory"("keyword");

-- CreateIndex
CREATE INDEX "KeywordMemory_status_idx" ON "KeywordMemory"("status");

-- CreateIndex
CREATE INDEX "KeywordMemory_cluster_idx" ON "KeywordMemory"("cluster");

-- CreateIndex
CREATE INDEX "KeywordMemory_bestPosition_idx" ON "KeywordMemory"("bestPosition");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySummary_month_key" ON "MonthlySummary"("month");

-- CreateIndex
CREATE INDEX "MonthlySummary_month_idx" ON "MonthlySummary"("month");

-- CreateIndex
CREATE INDEX "Blacklist_type_idx" ON "Blacklist"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_type_value_key" ON "Blacklist"("type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCluster_name_key" ON "TopicCluster"("name");

-- CreateIndex
CREATE INDEX "TopicCluster_status_idx" ON "TopicCluster"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_cluster_idx" ON "BlogPost"("cluster");

-- CreateIndex
CREATE INDEX "BlogPost_targetKeyword_idx" ON "BlogPost"("targetKeyword");

-- CreateIndex
CREATE INDEX "BlogPost_isLive_idx" ON "BlogPost"("isLive");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePage_slug_key" ON "ServicePage"("slug");

-- CreateIndex
CREATE INDEX "ServicePage_isLive_idx" ON "ServicePage"("isLive");

-- CreateIndex
CREATE INDEX "TechAuditReport_date_idx" ON "TechAuditReport"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DraftEmail_leadId_key" ON "DraftEmail"("leadId");

-- AddForeignKey
ALTER TABLE "ActionOutcome" ADD CONSTRAINT "ActionOutcome_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "AgentAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftEmail" ADD CONSTRAINT "DraftEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

