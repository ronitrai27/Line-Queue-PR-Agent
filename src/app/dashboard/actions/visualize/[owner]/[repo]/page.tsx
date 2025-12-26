"use client";

import RepoVisualizer from "@/module/visualize/repoVisualize";
import { useParams } from "next/navigation";

export default function VisualizePage() {
  const params = useParams();

  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);

  return (
    <div className="flex-1 w-full h-full p-2 relative bg-white rounded-md">
      <RepoVisualizer owner={owner} repo={repo} />
    </div>
  );
}
