/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "../github/github";
import { inngest } from "@/inngest/client";

export const fetchrepo = async (page: number = 1, perPage: number = 10) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No session found || Unauthorized , Sorry");
  }

  const githubRepos = await getRepositories(page, perPage);

  const dbRepos = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo: any) => ({
    ...repo,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));
};

export const connectRepo = async (
  owner: string,
  repo: string,
  githubid: number
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No session found || Unauthorized , Sorry");
  }

  //  CEHCKING IF USER CAN CONNECT  MORE REPO (PAYMENTS REQUIRED)

  // ========================================================
  // Adiing to Db , particular repos which user wants to Connect.
  // and On connection we created Webhook so to listen for EVENTS on that REPO.
  // ==========================================================

  const webhook = await createWebhook(owner, repo);

  if (webhook) {
    await prisma.repository.create({
      data: {
        githubId: BigInt(githubid),
        name: repo,
        owner,
        fullName: `${owner}/${repo}`,
        userId: session.user.id,
        url: `https://github.com/${owner}/${repo}`,
      },
    });
  }

  // INDEXING OF REPO FOR RAG=====================
  try {
    await inngest.send({
      name: "repository-connected",
      data: {
        owner,
        repo,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.log("Failed to trigger Indexing, error: ", error);
  }

  return webhook;
};
