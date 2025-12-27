/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

// ===============================
// GETTING THE GITHUB ACCESS TOKEN.
// ================================
export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("No session found");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account) {
    throw new Error("No account found");
  }

  return account.accessToken;
};

// ===============================
// GETTING THE USER CONTRIBUTIONS.
// ================================
export async function fetchUserContributions(token: string, username: string) {
  const octokit = new Octokit({
    auth: token,
  });

  const query = `
    query($username:String!){
        user(login:$username){
            contributionsCollection{
                contributionCalendar{
                    totalContributions
                    weeks{
                        contributionDays{
                            contributionCount
                            date
                            color
                        }
                    }
                }
            }
        }
    }`;

  interface contributiondata {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              contributionCount: number;
              date: string;
              color: string;
            }[];
          }[];
        };
      };
    };
  }

  try {
    const response: any = await octokit.graphql(query, {
      username: username,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ===========================
// GETTING THE CURRENT YEAR CONTRIBUTIONS
// ===========================
export async function fetchCurrentYearContributions(
  token: string,
  username: string
) {
  const octokit = new Octokit({ auth: token });

  const currentYear = new Date().getFullYear();
  const from = new Date(`${currentYear}-01-01T00:00:00Z`).toISOString();
  const to = new Date().toISOString();

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: any = await octokit.graphql(query, {
      username,
      from,
      to,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ==============================
// GETTING THE REPOSITORIES
// ==============================
export const getRepositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  const token = await getGithubToken();

  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    page: page,
    per_page: perPage,
  });

  return data;
};

// ============================
// CREATING WEBHOOK
// ============================
export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();

  const octokit = new Octokit({ auth: token });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const exisitingHook = hooks.find((hook) => hook.config.url === webhookUrl);
  if (exisitingHook) {
    return exisitingHook;
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
    },
    events: ["pull_request", "push", "issues"],
  });

  return data;
};

// ===========================
// GETTING THE ISSUES
// ===========================
export const getRepoIssues = async (
  githubId: string,
  state: "open" | "closed" | "all" = "all"
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Find repo by GitHub ID
  const repo = await prisma.repository.findUnique({
    where: {
      githubId: BigInt(githubId),
    },
  });

  if (!repo || repo.userId !== session.user.id) {
    throw new Error("Repository not found or unauthorized");
  }

  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner: repo.owner,
    repo: repo.name,
    state,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  return issues;
};

// ==================================
// DELETING WEBHOOK
// ==================================
export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();

  const octokit = new Octokit({ auth: token });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    // delete only our webhook , no other platforms....
    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

    if (hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookToDelete.id,
      });

      return true;
    }

    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};

// =================================
// GETTING REPO ALL FILES (TEXT PART)
// =================================

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<{ path: string; content: string }[]> {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  // JUST A CHECK
  if (!Array.isArray(data)) {
    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }
    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of data) {
    if (item.type === "file") {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      });

      // CHECKING
      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        // FILTER OUT NON-CODE FILES IF NEEDD (IMAGES ETC)
        if (!item.path.match(/\.(png|jpg|jpeg|gif|ico|tar|gz|pdf|zip|svg)$/i)) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents(token, owner, repo, item.path);

      files = files.concat(subFiles);
    }
  }

  return files;
}

// ================================
// TESTING FOLDER STRUCTURE && Latest COMMIT SHA
// ================================
interface FolderNode {
  path: string;
  name: string;
  fileCount: number;
  githubUrl: string;
  children: FolderNode[];
}

export async function getRepoFolderStructure(
  token: string,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<{ folderTree: FolderNode; latestCommitSHA: string }> {
  const octokit = new Octokit({ auth: token });
  console.log("Owner:", owner);
  console.log("Repo:", repo);
  console.log("Branch:", branch);

  const { data: branchData } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch,
  });
  const latestCommitSHA = branchData.commit.sha;

  console.log("📌 Latest Commit SHA:", latestCommitSHA);

  const root: FolderNode = {
    path: "",
    name: repo,
    fileCount: 0,
    githubUrl: `https://github.com/${owner}/${repo}`,
    children: [],
  };

  // Recursive function to build folder tree
  async function buildFolderTree(
    currentPath: string,
    parentNode: FolderNode
  ): Promise<void> {
    console.log(
      `📂 Fetching path: "${currentPath === "" ? "/" : currentPath}"`
    );
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: currentPath,
      });

      if (!Array.isArray(data)) {
        console.log("⚠️ Not a directory:", currentPath);
        return;
      }

      if (Array.isArray(data)) {
        // Count files in this directory
        const filesInThisDir = data.filter((item) => item.type === "file");
        parentNode.fileCount = filesInThisDir.length;

        // Get all subdirectories
        const folders = data.filter((item) => item.type === "dir");

        // Process each folder
        for (const folder of folders) {
          const folderNode: FolderNode = {
            path: folder.path,
            name: folder.name,
            fileCount: 0,
            githubUrl: `https://github.com/${owner}/${repo}/tree/${branch}/${folder.path}`,
            children: [],
          };

          parentNode.children.push(folderNode);

          // Recursively get subfolders
          await buildFolderTree(folder.path, folderNode);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${currentPath}:`, error);
    }
  }

  await buildFolderTree("", root);
  console.log("✅ FINAL ROOT TREE DONE");

  return {
    folderTree: root,
    latestCommitSHA,
  };
}
// ===============================
// Get Latest Repo Commit SHA
// ==============================
export async function getLatestCommitSHA(
  token: string,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<string> {
  const octokit = new Octokit({ auth: token });

  //  Get branch info (includes latest commit SHA)
  const { data } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch,
  });

  return data.commit.sha;
}
// ===============================
// PULL REQ DIFFERENCE (WHAT IS CHNAGED/ADDED)
// ================================

export async function getPullReqDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
) {
  const octokit = new Octokit({ auth: token });
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
}

// ===============================
// POST COMMENT
// ===============================

export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string
) {
  const octokit = new Octokit({ auth: token });
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## AI CODE REVIEW \n\n${review} \n\n -------\n *Powered By Line-Queue*`,
  });
}

// ===============================
// GET COLLABORATORS
// ===============================
export async function getCollaborators(owner: string, repo: string) {
  try {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: collaborators } = await octokit.rest.repos.listCollaborators({
      owner,
      repo,
      per_page: 100,
    });

    // Get contributor stats (includes commit counts)
    const { data: stats } = await octokit.rest.repos.getContributorsStats({
      owner,
      repo,
    });

    // Calculate total commits
    const totalCommits =
      stats?.reduce((sum, contributor) => sum + contributor.total, 0) || 0;

    // Merge data
    const collaboratorsWithStats = collaborators.map((collab) => {
      const stat = stats?.find((s) => s.author?.login === collab.login);
      const commits = stat?.total || 0;
      const percentage =
        totalCommits > 0 ? ((commits / totalCommits) * 100).toFixed(2) : "0";

      return {
        username: collab.login,
        avatar: collab.avatar_url,
        profileUrl: collab.html_url,
        permissions: collab.permissions,
        commits,
        contributionPercentage: percentage,
      };
    });

    console.log(
      "collaboratorsWithStats and totalCommits---------->",
      collaboratorsWithStats,
      totalCommits
    );
    return {
      collaborators: collaboratorsWithStats,
      totalCommits,
    };
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch collaborators"
    );
  }
}

// ===============================
// ADD A COLLABORATORS
// ===============================
export async function addCollaborator(
  owner: string,
  repo: string,
  username: string,
  permission: "pull" | "push" | "admin" | "maintain" | "triage" = "push"
) {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  try {
    await octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
      permission,
    });

    return { success: true, message: `Added ${username} as collaborator` };
  } catch (error: any) {
    console.error("Error adding collaborator:", error);
    return { success: false, error: error.message };
  }
}

// ===============================
// REMOVE A COLLABORATORS
// ===============================
export async function removeCollaborator(
  owner: string,
  repo: string,
  username: string
) {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  try {
    await octokit.rest.repos.removeCollaborator({
      owner,
      repo,
      username,
    });

    return { success: true, message: `Removed ${username} from collaborators` };
  } catch (error: any) {
    console.error("Error removing collaborator:", error);
    return { success: false, error: error.message };
  }
}
