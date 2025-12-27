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
import {
  LuActivity,
  LuChartBarIncreasing,
  LuChevronDown,
} from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const MainPage = () => {
  const { user, session, loading, error } = useAuthUser();

  const userName = user?.name || "GUEST";
  const userEmail = user?.email || "";
  const userFirstName = user?.name.split(" ")[0].toUpperCase() || "GUEST";

  const [range, setRange] = useState<"past" | "current">("past");
  type ViewMode = "normal" | "stacked" | "expand";
  const [viewMode, setViewMode] = useState<ViewMode>("stacked");

  const stackId = viewMode === "normal" ? undefined : "activity";

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
      <h1 className="text-3xl font-bold tracking-wide">
        Welcome {userFirstName}
      </h1>
      {/* CARDS */}
      <div className="grid gap-4 py-4 md:grid-cols-4">
        {/* 1 */}
        <Card className="bg-linear-to-br from-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Repositories</CardTitle>
            <GitBranch className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="pb-1 text-2xl font-semibold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-11 w-9" />
              ) : (
                stats?.totalRepos || 0
              )}
            </p>
            <p className="text-muted-foreground text-xs">Connected Repos</p>
          </CardContent>
        </Card>
        {/* 2 */}
        <Card className="bg-linear-to-br from-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Commits</CardTitle>
            <GitBranchPlus className="text-muted-foreground h-4 w-4" />
          </CardHeader>

          <CardContent className="flex">
            {/* Rolling 12 months */}
            <div>
              <p className="pb-1 text-2xl font-semibold tracking-tight">
                {isLoading ? (
                  <Skeleton className="h-11 w-9" />
                ) : (
                  (stats?.totalCommits ?? 0)
                )}
              </p>
              <p className="text-muted-foreground text-xs tracking-tight">
                Past 12 months
              </p>
            </div>

            {/* Divider */}
            <Separator orientation="vertical" className="mx-4 h-10" />

            {/* Calendar year */}
            <div>
              <p className="pb-1 text-2xl font-semibold">
                {isLoadingCurrent ? (
                  <Skeleton className="h-11 w-9" />
                ) : (
                  (contributionCurrent?.totalContributions ?? 0)
                )}
              </p>
              <p className="text-muted-foreground text-xs tracking-tight">
                Jan {new Date().getFullYear()} – Today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3 */}
        <Card className="bg-linear-to-br from-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pull Request</CardTitle>
            <GitPullRequest className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="pb-1 text-2xl font-semibold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-11 w-9" />
              ) : (
                stats?.totalpr || 0
              )}
            </p>
            <p className="text-muted-foreground text-xs">All time</p>
          </CardContent>
        </Card>
        {/* 4 */}
        <Card className="bg-linear-to-br from-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">AI Reviews</CardTitle>
            <Brain className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="pb-1 text-2xl font-semibold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-11 w-9" />
              ) : (
                stats?.totalReviews || 0
              )}
            </p>
            <p className="text-muted-foreground text-xs">Generate Reviews</p>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-2" />

      <h1 className="my-4 text-xl">
        Contribution HeatMaps{" "}
        <LuChartBarIncreasing className="ml-2 inline h-5 w-5" />
      </h1>
      {/* HEAT MAPS */}
      <div className="my-4 w-full flex-1 px-10">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">
                Contributions{" "}
                {range === "past" ? "Past 12 Months" : "Current Year"}
              </CardTitle>
              <p className="text-muted-foreground text-xs">
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

      {/* CHARTS OVERVIEW */}

      <h1 className="my-5 text-xl">
        Activity Stats <LuActivity className="ml-2 inline h-5 w-5" />
      </h1>
      <div className="mt-4 w-full px-10">
        <Card className="bg-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Activity Overview</CardTitle>
              <p className="text-muted-foreground text-xs">
                Monthly Breakdown of Commits , PR and AI reviews (Last 6 Months
                )
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === "normal" ? "default" : "outline"}
                onClick={() => setViewMode("normal")}
                className="text-xs"
              >
                Normal
              </Button>

              <Button
                size="sm"
                variant={viewMode === "stacked" ? "default" : "outline"}
                onClick={() => setViewMode("stacked")}
                className="text-xs"
              >
                Stacked
              </Button>

              <Button
                size="sm"
                variant={viewMode === "expand" ? "default" : "outline"}
                onClick={() => setViewMode("expand")}
                className="text-xs"
              >
                Expand
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingActivity ? (
              <p className="text-muted-foreground text-xs">
                Loading activity data...
              </p>
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    commits: { label: "Commits", color: "hsl(217, 91%, 60%)" },
                    prs: {
                      label: "Pull Requests",
                      color: "hsl(271, 91%, 65%)",
                    },
                    reviews: {
                      label: "AI Reviews",
                      color: "hsl(160, 84%, 39%)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <AreaChart
                    data={monthlyActivity || []}
                    stackOffset={viewMode === "expand" ? "expand" : "none"}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCommits"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(217, 91%, 60%)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(217, 91%, 60%)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="colorPrs" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(271, 91%, 65%)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(271, 91%, 65%)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorReviews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(160, 84%, 39%)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(160, 84%, 39%)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/20"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-[10px]"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent className="w-40" />}
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="commits"
                      stackId={stackId}
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      fill="url(#colorCommits)"
                      dot={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="prs"
                      stackId={stackId}
                      stroke="hsl(271, 91%, 65%)"
                      strokeWidth={2}
                      fill="url(#colorPrs)"
                      dot={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="reviews"
                      stackId={stackId}
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={2}
                      fill="url(#colorReviews)"
                      dot={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      domain={[
                        0,
                        (dataMax: number) => Math.ceil(dataMax * 1.2),
                      ]}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[hsl(217,91%,60%)]" />
                    <span className="text-muted-foreground text-xs">
                      Commits
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[hsl(271,91%,65%)]" />
                    <span className="text-muted-foreground text-xs">
                      Pull Requests
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[hsl(160,84%,39%)]" />
                    <span className="text-muted-foreground text-xs">
                      AI Reviews
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainPage;
