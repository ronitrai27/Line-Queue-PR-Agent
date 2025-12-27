import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/module/ai/rag";
import { getRepoFileContents } from "@/module/github/github";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository-connected" },

  // getting these owner , repo , userId from the connectRepo function , where we called this...
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    //=========== FILES =============
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No account found");
      }

      return await getRepoFileContents(account.accessToken, owner, repo);
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files);
    });

    return { success: true, indexedFiles: files.length };
  }
);
