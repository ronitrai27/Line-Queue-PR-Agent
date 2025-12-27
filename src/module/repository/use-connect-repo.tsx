/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepo } from ".";
import { toast } from "sonner";

export const UseConnectRepo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => {
      return await connectRepo(owner, repo, githubId);
    },

    onSuccess: () => {
      toast.success("Repository Connected Successfully");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error: any) => {
      toast.error("Failed to connect repository");
      console.log(error);
    },
  });
};
