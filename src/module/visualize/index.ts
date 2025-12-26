"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRepoFolderStructure } from "@/module/github/github";
import { folderTreeToReactFlow } from "@/lib/visulaizer";
import { Node, Edge } from "@xyflow/react";

/**
 * Generate visualization data for a GitHub repository
 * @param owner - Repository owner (username or organization)
 * @param repo - Repository name
 * @param branch - Branch name (defaults to "main")
 * @returns React Flow nodes and edges
 */
interface VisualizationData {
  nodes: Node[];
  edges: Edge[];
}

export async function generateRepoVisualization(
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<VisualizationData> {
  try {
    console.log("▶️ generateRepoVisualization called");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("No session found. Please login to continue.");
    }
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "github",
      },
    });

    if (!account) {
      throw new Error(
        "GitHub account not connected. Please connect your GitHub account."
      );
    }

    if (!account.accessToken) {
      throw new Error(
        "GitHub access token not found. Please reconnect your GitHub account."
      );
    }

    console.log("📦 Fetching repository folder structure from GitHub...");

    const { folderTree, latestCommitSHA } = await getRepoFolderStructure(
      account.accessToken,
      owner,
      repo,
      branch
    );

    const commitSHA = latestCommitSHA;
    console.log("🧾 Latest Commit SHA:", commitSHA);

    console.log("✅ Folder tree received from GitHub:");

    if (!folderTree.children.length) {
      throw new Error("Repository appears empty or inaccessible");
    }

    // 4. Convert to React Flow format
    const visualizationData = folderTreeToReactFlow(folderTree, owner, repo);

    // console.log("React Flow visualization data generated:", visualizationData);

    //============= SAVE TO DATABASE FOR PERSISTENCE==================

    return visualizationData;
  } catch (error) {
    console.error("Error generating repository visualization:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to generate visualization: ${error.message}`);
    }

    throw new Error("Failed to generate visualization. Please try again.");
  }
}

// await prisma.repoVisualization.upsert({
//   where: {
//     repoId: `${owner}/${repo}`,
//   },
//   update: {
//     nodes: JSON.stringify(visualizationData.nodes),
//     edges: JSON.stringify(visualizationData.edges),
//     updatedAt: new Date(),
//   },
//   create: {
//     repoId: `${owner}/${repo}`,
//     owner,
//     repo,
//     nodes: JSON.stringify(visualizationData.nodes),
//     edges: JSON.stringify(visualizationData.edges),
//   },
// });
