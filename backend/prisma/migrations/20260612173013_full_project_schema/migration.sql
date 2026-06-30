-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'PDF', 'AUDIO', 'VIDEO', 'DOC', 'OTHER');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'APPROVED', 'SENT');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'CLOSED');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "aiConfidence" DOUBLE PRECISION,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "sourceChannel" TEXT NOT NULL DEFAULT 'WEB',
ADD COLUMN     "translatedDescription" TEXT;

-- AlterTable
ALTER TABLE "Jurisdiction" ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "CitizenProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "address" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "aadhaarLast4" TEXT,

    CONSTRAINT "CitizenProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "designation" TEXT,
    "jurisdictionId" INTEGER,
    "workloadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfficerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" "AttachmentType" NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentExtraction" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "attachmentId" INTEGER NOT NULL,
    "extractedText" TEXT,
    "detectedLanguage" TEXT,
    "extractionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceTranscript" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "attachmentId" INTEGER,
    "transcriptText" TEXT NOT NULL,
    "language" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAnalysis" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "detectedLanguage" TEXT,
    "translatedText" TEXT,
    "summary" TEXT,
    "categorySuggestion" TEXT,
    "prioritySuggestion" TEXT,
    "departmentSuggestion" TEXT,
    "locationSuggestion" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAgentRun" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "agentName" TEXT NOT NULL,
    "inputJson" JSONB,
    "outputJson" JSONB,
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutingDecision" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "officerId" INTEGER,
    "reason" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "isAiDecided" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutingDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isFinalResponse" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResolutionDraft" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "officerId" INTEGER,
    "draftText" TEXT NOT NULL,
    "generatedByAi" BOOLEAN NOT NULL DEFAULT true,
    "editedText" TEXT,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResolutionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintStatusHistory" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "oldStatus" "ComplaintStatus",
    "newStatus" "ComplaintStatus" NOT NULL,
    "changedBy" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaPolicy" (
    "id" SERIAL NOT NULL,
    "priority" "Priority" NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "responseTimeHours" INTEGER NOT NULL,
    "resolutionTimeHours" INTEGER NOT NULL,

    CONSTRAINT "SlaPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escalation" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "escalatedBy" INTEGER,
    "escalatedTo" INTEGER,
    "escalationLevel" INTEGER NOT NULL DEFAULT 1,
    "status" "EscalationStatus" NOT NULL DEFAULT 'OPEN',
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Escalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenFeedback" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "citizenId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CitizenProfile_userId_key" ON "CitizenProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficerProfile_userId_key" ON "OfficerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentExtraction_attachmentId_key" ON "DocumentExtraction"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceTranscript_attachmentId_key" ON "VoiceTranscript"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenFeedback_complaintId_key" ON "CitizenFeedback"("complaintId");

-- AddForeignKey
ALTER TABLE "CitizenProfile" ADD CONSTRAINT "CitizenProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerProfile" ADD CONSTRAINT "OfficerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerProfile" ADD CONSTRAINT "OfficerProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerProfile" ADD CONSTRAINT "OfficerProfile_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentExtraction" ADD CONSTRAINT "DocumentExtraction_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentExtraction" ADD CONSTRAINT "DocumentExtraction_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysis" ADD CONSTRAINT "AiAnalysis_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgentRun" ADD CONSTRAINT "AiAgentRun_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingDecision" ADD CONSTRAINT "RoutingDecision_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResolutionDraft" ADD CONSTRAINT "ResolutionDraft_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintStatusHistory" ADD CONSTRAINT "ComplaintStatusHistory_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaPolicy" ADD CONSTRAINT "SlaPolicy_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escalation" ADD CONSTRAINT "Escalation_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenFeedback" ADD CONSTRAINT "CitizenFeedback_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
