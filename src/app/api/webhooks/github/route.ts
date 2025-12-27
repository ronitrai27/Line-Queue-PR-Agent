import { reveiewPullRequest } from "@/module/ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // console.log("WEBHOOK-GITHUB", body);
    const event = req.headers.get("X-gitHub-Event");
    console.log("----------------EVENT --->", event);

    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }
    // ===============================
    // PUSH
    // ===============================
    if (event === "push") {
      // console.log("push event", body);
      console.log("Push event received:", {
        repo: body.repository.full_name,
        pusher: body.pusher.name,
        commits: body.commits.length,
      });
    }
    // ===============================
    // ISSUES
    // ===============================
    if (event === "issues") {
      // console.log("issues event", body);
      const action = body.action;
      const issue = body.issue;
      const repo = body.repository.full_name;
      const [owner, repoName] = repo.split("/");

      console.log("Issue event received:", {
        action,
        issueNumber: issue.number,
        title: issue.title,
        author: issue.user.login,
        repo,
      });
    }

    // =================================
    // PR
    // =================================

    if (event === "pull_request") {
      const action = body.action;
      const repo = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repoName] = repo.split("/");

      // if (action === "opened" || action === "synchronize") {
      //   reveiewPullRequest(owner, repoName, prNumber)
      //     .then(() =>
      //       console.log(`reviewed pull request ${prNumber} and repo ${repo}`)
      //     )
      //     .catch((err: any) =>
      //       console.log(
      //         `error while reviewing pull request ${prNumber} and repo ${repo}`
      //       )
      //     );
      // }

      if (action === "opened") {
        console.log("🤖 Triggering AI review for new PR...");
        reveiewPullRequest(owner, repoName, prNumber)
          .then(() =>
            console.log(`✅ Reviewed pull request #${prNumber} in ${repo}`)
          )
          .catch((err: any) =>
            console.error(
              `❌ Error reviewing PR #${prNumber} and repo ${repo}:`,
              err
            )
          );
      }
    }
    return NextResponse.json({ message: "Event Processed" }, { status: 200 });
  } catch (e) {
    console.log("error==========>", e);
    return NextResponse.json(
      { message: "Server Error, Sorry!" },
      { status: 500 }
    );
  }
}
