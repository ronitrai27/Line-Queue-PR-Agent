"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCollaborators } from "@/module/github/github";
import { useQuery } from "@tanstack/react-query";
import { GitCommit, TrendingUp, Users } from "lucide-react";
import { useParams } from "next/navigation";

export default function StatsPage() {
  const params = useParams();

  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);

  const { data, isLoading, error } = useQuery({
    queryKey: ["collaborators", owner, repo],
    queryFn: () => getCollaborators(owner, repo),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Stats
            </CardTitle>
            <CardDescription>{(error as Error).message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { collaborators = [], totalCommits = 0 } = data || {};
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Repository Statistics
      </h1>
      <p className="text-muted-foreground mt-2">
        {owner}/{repo}
      </p>

      <div className="my-6 grid gap-6 px-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCommits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaborators.length}</div>
          </CardContent>
        </Card>

        <Card></Card>
      </div>

      <div className="px-6">
        <Card>
          <CardHeader>
            <CardTitle>Collaborators</CardTitle>
            <CardDescription>
              Team members and their contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collaborators
                .sort((a, b) => b.commits - a.commits)
                .map((collab) => (
                  <div
                    key={collab.username}
                    className="bg-card hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={collab.avatar}
                          alt={collab.username}
                        />
                        <AvatarFallback>
                          {collab.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <a
                          href={collab.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                        >
                          {collab.username}
                        </a>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {collab.commits.toLocaleString()} commits
                          </span>
                          <span className="text-muted-foreground text-sm">
                            •
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {collab.contributionPercentage}% of total
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {collab.permissions?.admin && (
                        <Badge variant="destructive">Admin</Badge>
                      )}
                      {collab.permissions?.maintain && (
                        <Badge variant="secondary">Maintain</Badge>
                      )}
                      {collab.permissions?.push && (
                        <Badge variant="outline">Push</Badge>
                      )}
                      {collab.permissions?.pull && (
                        <Badge variant="outline">Pull</Badge>
                      )}
                    </div>
                  </div>
                ))}

              {collaborators.length === 0 && (
                <p className="text-muted-foreground py-8 text-center">
                  No collaborators found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
