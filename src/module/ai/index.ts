"use server";

import prisma from "@/lib/db";
import { getPullReqDiff } from "../github/github";
import { inngest } from "@/inngest/client";

export async function reveiewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(`Repository not found: ${owner}/${repo} sorry !`);
    }

    const githubAccount = repository.user.accounts[0];

    if (!githubAccount) {
      throw new Error("No GitHub account found for the user.");
    }

    const token = githubAccount.accessToken;

    const { title } = await getPullReqDiff(token!, owner, repo, prNumber);

    //   BACKGROUND JOB-------
    await inngest.send({
      name: "pr.review-requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.user.id,
      },
    });

    return { success: true, message: "Reviewed Queued" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });
      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "Failed to fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `Error: ${error}`,
            status: "failed",
          },
        });
      }
    } catch (dberror) {
      console.log(dberror);
    }
  }
}
