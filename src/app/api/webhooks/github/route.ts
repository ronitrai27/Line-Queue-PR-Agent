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

    if (event === "pull_request") {

      const action = body.action;
      const repo = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repoName] = repo.split("/");

      if(action === "opened" || action === "synchronize"){

        reveiewPullRequest(owner, repoName, prNumber)
        .then(()=>console.log(`reviewed pull request ${prNumber} and repo ${repo}`))
        .catch((err:any)=>console.log(`error while reviewing pull request ${prNumber} and repo ${repo}`));
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
