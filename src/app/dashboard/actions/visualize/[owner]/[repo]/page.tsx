"use client";

import RepoVisualizer from "@/module/visualize/repoVisualize";
import { useParams } from "next/navigation";

export default function VisualizePage() {
  const params = useParams();

  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);

  return (
    <div className="relative h-full w-full flex-1 rounded-md p-1 overflow-hidden">
      <RepoVisualizer owner={owner} repo={repo} />
    </div>
  );
}
