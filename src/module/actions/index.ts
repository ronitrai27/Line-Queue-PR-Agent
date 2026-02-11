"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

// ===============================
// RECENT COMMITS SAVED TO DB
// ===============================

export async function handlePushEvent(body: any) {
  const commits = body.commits || [];
  const repo = body.repository.full_name;
  const [owner, repoName] = repo.split("/");
  const branch = body.ref.replace("refs/heads/", "");
  const pusher = body.pusher;

  console.log(`📦 Processing ${commits.length} commit(s) to ${repo}/${branch}`);
  console.log("commits by owner and on reponame", owner, repoName);

  const commitActivities = commits.map((commit: any) => {
    return {
      // Owner/Author info
      authorName: commit.author.name,
      authorEmail: commit.author.email,
      authorUsername: commit.author.username || pusher.name,
      authorAvatar: `https://github.com/${commit.author.username || pusher.name}.png`,

      // Commit details
      commitId: commit.id,
      commitMessage: commit.message,
      commitUrl: commit.url,
      timestamp: new Date(commit.timestamp),

      // Repo info
      repoOwner: owner,
      repoName: repoName,
      repoFullName: repo,
      branch: branch,
      repoUrl: body.repository.html_url,

      // Changes
      addedFiles: commit.added || [],
      modifiedFiles: commit.modified || [],
      removedFiles: commit.removed || [],
      totalFilesChanged:
        (commit.added?.length || 0) +
        (commit.modified?.length || 0) +
        (commit.removed?.length || 0),
    };
  });

  //   SAVING TO DB
  try {
    const savedCommits = await Promise.all(
      commitActivities.map((activity: any) =>
        prisma.commitActivity.create({
          data: {
            // Author
            authorName: activity.authorName,
            authorEmail: activity.authorEmail,
            authorUsername: activity.authorUsername,
            authorAvatar: activity.authorAvatar,

            // Commit
            commitId: activity.commitId,
            commitMessage: activity.commitMessage,
            commitUrl: activity.commitUrl,
            timestamp: activity.timestamp,

            // Repo
            repoOwner: activity.repoOwner,
            repoName: activity.repoName,
            repoFullName: activity.repoFullName,
            branch: activity.branch,
            repoUrl: activity.repoUrl,

            // Files
            filesChanged: activity.totalFilesChanged,
            changes: {
              added: activity.addedFiles,
              modified: activity.modifiedFiles,
              removed: activity.removedFiles,
            },
          },
        })
      )
    );

    console.log(`✅ Saved ${savedCommits.length} commit(s) to database`);
    console.log(savedCommits);
    return savedCommits;
  } catch (error) {
    console.error("❌ Error saving commits to database:", error);
    throw error;
  }
}

// ===============================
// RECENT COMMITS FROM ALL REPO global
// ===============================

export async function getRecentCommits(limit: number = 8) {
  try {
    const commits = await prisma.commitActivity.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
      select: {
        id: true,
        authorName: true,
        authorUsername: true,
        authorAvatar: true,
        commitMessage: true,
        commitUrl: true,
        timestamp: true,
        repoFullName: true,
        repoName: true,
        branch: true,
        filesChanged: true,
        repoUrl: true,
      },
    });

    return commits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error("Failed to fetch commits");
  }
}

// ===============================
// RECENT COMMITS FROM SPECIFIC REPO
// ===============================

export async function getRecentCommitsByRepo(
  repoFullName: string,
  limit: number = 8
) {
  try {
    const commits = await prisma.commitActivity.findMany({
      where: { repoFullName },
      orderBy: { timestamp: "desc" },
      take: limit,
      select: {
        id: true,
        authorName: true,
        authorUsername: true,
        authorAvatar: true,
        commitMessage: true,
        commitUrl: true,
        timestamp: true,
        repoFullName: true,
        repoName: true,
        branch: true,
        filesChanged: true,
        repoUrl: true,
      },
    });

    return commits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error("Failed to fetch commits");
  }
}
