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
    return <div>Loading... contribution data</div>;
  }

  if (!data || !data?.contributions.length) {
    return (
      <div>
        <h1>No contribution data available</h1>
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-sm text-muted-foreground">
        <span>{data?.totalContributions} in the last year</span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-4">
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
