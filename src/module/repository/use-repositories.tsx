"use client";
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchrepo } from "@/module/repository/index";

// ========================================
// INFINITE SCROLLING OF REPOS
// ========================================
export const useRepositories = () => {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchrepo(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastpage, allpages) => {
      if (lastpage.length < 10) return undefined;
      return allpages.length + 1;
    },
    initialPageParam: 1,
  });
};
