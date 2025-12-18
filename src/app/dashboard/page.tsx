/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/userAuthSession";
import Logout from "@/module/auth/components/logout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  getCurrentContributionStats,
  getDahboardStats,
  getMonthlyActivity,
} from "@/module/dashboard";
import React, { useState } from "react";
import ContributionGraph from "@/module/dashboard/contribution-graph";
import ContributionGraphCurrent from "@/module/dashboard/contribution-current";
import { Brain, GitBranch, GitBranchPlus, GitPullRequest } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LuChartBarIncreasing, LuChevronDown } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MainPage = () => {
  const { user, session, loading, error } = useAuthUser();

  const userName = user?.name || "GUEST";
  const userEmail = user?.email || "";
  const userFirstName = user?.name.split(" ")[0].toUpperCase() || "GUEST";

  const [range, setRange] = useState<"past" | "current">("past");

  //=============== QUERY1================
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => await getDahboardStats(),
    refetchOnWindowFocus: false,
  });

  // =============== QUERY2================
  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => await getMonthlyActivity(),
  });

  // =============== QUERY3==================

  const { data: contributionCurrent, isLoading: isLoadingCurrent } = useQuery<{
    contributionCurrent: any[];
    totalContributions: number;
  }>({
    queryKey: ["current-contribution-graph"],
    queryFn: getCurrentContributionStats as any,
  });

  if (error) {
    return <p className="">Error: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-bold tracking-wide text-3xl">
        Welcome {userFirstName}
      </h1>
      <div className="grid md:grid-cols-4 gap-4 py-4">
        {/* 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm ">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight pb-1">
              {isLoading ? "..." : stats?.totalRepos || 0}
            </p>
            <p className="text-xs text-muted-foreground">Connected Repos</p>
          </CardContent>
        </Card>
        {/* 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Commits</CardTitle>
            <GitBranchPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent className="flex">
            {/* Rolling 12 months */}
            <div>
              <p className="text-2xl font-semibold tracking-tight pb-1">
                {isLoading ? "..." : stats?.totalCommits ?? 0}
              </p>
              <p className="text-xs text-muted-foreground tracking-tight">
                Past 12 months
              </p>
            </div>

            {/* Divider */}
            <Separator orientation="vertical" className="mx-4 h-10" />

            {/* Calendar year */}
            <div>
              <p className="text-2xl font-semibold pb-1">
                {isLoadingCurrent
                  ? "..."
                  : contributionCurrent?.totalContributions ?? 0}
              </p>
              <p className="text-xs tracking-tight text-muted-foreground">
                Jan {new Date().getFullYear()} – Today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm ">Pull Request</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight pb-1">
              {isLoading ? "..." : stats?.totalpr || 0}
            </p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        {/* 4 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm ">AI Reviews</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight pb-1">
              {isLoading ? "..." : stats?.totalReviews || 0}
            </p>
            <p className="text-xs text-muted-foreground">Generate Reviews</p>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-2" />
      <h1 className="text-xl">
        Contribution HeatMaps{" "}
        <LuChartBarIncreasing className="inline ml-2 w-5 h-5" />
      </h1>
      <div className="flex-1 w-full px-10 my-4">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">
                Contributions{" "}
                {range === "past" ? "Past 12 Months" : "Current Year"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                View your GitHub commits.
              </p>
            </div>

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs">
                  {range === "past" ? "Past Year" : "Current Year"} 
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRange("past")}>
                  Past Year
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("current")}>
                  Current Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent>
            {range === "past" ? (
              <ContributionGraph />
            ) : (
              <ContributionGraphCurrent />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainPage;
