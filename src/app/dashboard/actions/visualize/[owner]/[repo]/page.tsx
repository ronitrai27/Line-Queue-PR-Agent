"use client";

import RepoVisualizer from "@/module/visualize/repoVisualize";
import RepoVisualizer2 from "@/module/visualize/Store";
import { useParams } from "next/navigation";

export default function VisualizePage() {
  const params = useParams();

  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden rounded-md p-1">
      {/* <RepoVisualizer owner={owner} repo={repo} /> */}
      <RepoVisualizer2 owner={owner} repo={repo} />
    </div>
  );
}
