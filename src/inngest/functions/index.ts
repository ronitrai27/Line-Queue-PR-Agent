import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/module/ai/rag";
import { getRepoFileContents } from "@/module/github/github";
import { success } from "better-auth";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository-connected" },

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
