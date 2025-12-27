/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import {
  getContributionStats,
  getCurrentContributionStats,
} from "@/module/dashboard/index";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const ContributionGraph = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery<{
    contributions: any[];
    totalContributions: number;
  }>({
    queryKey: ["contribution-graph"],
    queryFn: getContributionStats as any,
  });

  if (isLoading) {
    return (
      <div>
        {" "}
        <Skeleton className="h-40 w-full" />{" "}
      </div>
    );
  }

  if (!data || !data?.contributions.length) {
    return (
      <div>
        <h1>No contribution data available</h1>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="text-muted-foreground text-sm">
        <span>{data?.totalContributions} in the last year</span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max justify-center px-4">
          <ActivityCalendar
            data={data?.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={5}
            fontSize={14}
            showWeekdayLabels
            showColorLegend
            showTotalCount
            showMonthLabels
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
