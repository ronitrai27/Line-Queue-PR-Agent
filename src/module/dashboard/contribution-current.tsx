/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { getCurrentContributionStats } from "@/module/dashboard/index";
import { useQuery } from "@tanstack/react-query";

const ContributionGraphCurrent = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery<{
    contributionCurrent: any[];
    totalContributions: number;
  }>({
    queryKey: ["current-contribution-graph"],
    queryFn: getCurrentContributionStats as any,
  });

  if (isLoading) {
    return <div>Loading current year contributions…</div>;
  }

  if (!data || !data?.contributionCurrent?.length) {
    return (
      <div>
        <h1>No contribution data available</h1>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="text-muted-foreground text-sm">
        <span>{data.totalContributions} contributions this year</span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max justify-center px-4">
          <ActivityCalendar
            data={data.contributionCurrent}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={5}
            fontSize={14}
            showWeekdayLabels
            showMonthLabels
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraphCurrent;
