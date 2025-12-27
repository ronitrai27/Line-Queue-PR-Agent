-- CreateTable
CREATE TABLE "CommitActivity" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL,
    "commitId" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "commitUrl" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repoOwner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "filesChanged" INTEGER NOT NULL,
    "changes" JSONB NOT NULL,

    CONSTRAINT "CommitActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitActivity_commitId_key" ON "CommitActivity"("commitId");

-- CreateIndex
CREATE INDEX "CommitActivity_repoFullName_timestamp_idx" ON "CommitActivity"("repoFullName", "timestamp");

-- CreateIndex
CREATE INDEX "CommitActivity_authorUsername_timestamp_idx" ON "CommitActivity"("authorUsername", "timestamp");

-- CreateIndex
CREATE INDEX "CommitActivity_branch_idx" ON "CommitActivity"("branch");
