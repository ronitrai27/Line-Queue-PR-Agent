/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getConnectedRepositories } from "@/module/settings";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { LuPlay } from "react-icons/lu";
import { RepositoryCardSkeleton } from "@/components/custom/RepoSkeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getRepoIssues } from "@/module/github/github";

type SelectedRepo = {
  id: string; // githubId
  fullName: string;
  url: string;
};

const ActionPage = () => {
  const { data: repo, isLoading } = useQuery({
    queryKey: ["connect-repo"],
    queryFn: async () => await getConnectedRepositories(),
    refetchOnMount: true,
  });

  const [open, setOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);

  const { data: issues, isLoading: isLoadingIssues } = useQuery({
    queryKey: ["repo-issues", selectedRepo?.id],
    queryFn: async () =>
      selectedRepo ? getRepoIssues(selectedRepo.id, "all") : [],
    enabled: !!selectedRepo?.id,
  });

  if (isLoading)
    return (
      <div>
        (<h1 className="font-bold tracking-wide text-3xl">Actions </h1>
        <h3 className="text-base text-muted-foreground mt-1 mb-5">
          Manage Your Workflows & Tasks Here
          <Play className="inline ml-2 w-4 h-4" />
        </h3>
        <RepositoryCardSkeleton />)
      </div>
    );
  return (
    <div className="">
      <h1 className="font-bold tracking-wide text-3xl">Actions </h1>
      <h3 className="text-base text-muted-foreground mt-1 mb-5">
        Manage Your Workflows & Tasks Here
        <Play className="inline ml-2 w-4 h-4" />
      </h3>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-medium mb-2">
                Connected Repositories
              </CardTitle>
              <CardDescription>
                Manage your connected Github Repo
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!repo || repo.length == 0 ? (
            <div className="text-sm text-muted-foreground">
              No repositories connected
            </div>
          ) : (
            <div className="space-y-4">
              {repo.map((repo) => (
                <div className="bg-white/10 p-4 rounded-lg" key={repo.id}>
                  <div className="flex justify-between">
                    <div className="flex gap-6 mb-2">
                      <h2 className=" capitalize">{repo?.fullName}</h2>
                      <a
                        href={repo?.url}
                        target="_blank"
                        rel="noreferrer"
                        className=""
                      >
                        <ExternalLink className="inline ml-2 w-4 h-4" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setSelectedRepo({
                            id: repo.githubId.toString(),
                            fullName: repo.fullName,
                            url: repo.url,
                          });
                          setOpen(true);
                        }}
                      >
                        Action <LuPlay className="inline ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================== */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="min-w-132 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedRepo?.fullName}
              <a
                href={selectedRepo?.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </SheetTitle>

            <SheetDescription>Issues for selected repository</SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading issues…</p>
            ) : issues?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues found</p>
            ) : (
              issues &&
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-lg border border-white/10 p-3 space-y-2"
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <span
                      className={`text-xs ${
                        issue.state === "open"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {issue.state}
                    </span>
                  </div>

                  {issue.body ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-blue-400">
                        View description
                      </summary>
                      <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                        {issue.body}
                      </p>
                    </details>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      No description provided
                    </p>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Created: {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                    <span>💬 {issue.comments} comments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ActionPage;
