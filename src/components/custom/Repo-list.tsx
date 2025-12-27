"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  disconnectRepo,
  disconnectAllRepo,
  getConnectedRepositories,
} from "@/module/settings/index";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";

export function RepositoryListPage() {
  const queryClient = useQueryClient();

  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);

  const { data: repo, isLoading } = useQuery({
    queryKey: ["connected-repo"],
    queryFn: async () => await getConnectedRepositories(),
    // staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repoId: string) => {
      return await disconnectRepo(repoId);
    },
    onMutate: () => {
      toast.loading("Disconnecting repository...", {
        id: "disconnect-repo",
      });
    },
    onSuccess: (result) => {
      toast.dismiss("disconnect-repo");

      if (result) {
        queryClient.invalidateQueries({ queryKey: ["connected-repo"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success("Repository Disconnected Successfully");
      } else {
        toast.error("Something went wrong, try again later");
      }
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepo();
    },
    onMutate: () => {
      toast.loading("Disconnecting all repositories...", {
        id: "disconnect-all-repo",
      });
    },
    onSuccess: (result) => {
      toast.dismiss("disconnect-all-repo");
      if (result) {
        queryClient.invalidateQueries({ queryKey: ["connected-repo"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success(`Disconnected ${result.count} repositories`);
      } else {
        toast.error("Something went wrong, try again later");
      }
    },
  });

  if (isLoading) {
    return <div>Loading Connected Repos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="mb-2 font-medium">
              Connected Repositories
            </CardTitle>
            <CardDescription>Manage your connected Github Repo</CardDescription>
          </div>
          {repo && repo?.length > 0 && (
            <AlertDialog
              open={disconnectAllOpen}
              onOpenChange={setDisconnectAllOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="cursor-pointer text-sm"
                >
                  Disconnect All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>
                  Are you sure? to disconnect all
                </AlertDialogTitle>
                <AlertDialogDescription>
                  this will disconnect all ${repo.length} repositories and
                  delete all AI reviews.
                </AlertDialogDescription>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectAllMutation.mutate()}
                    className="bg-destructive cursor-pointer"
                    disabled={disconnectAllMutation.isPending}
                  >
                    {disconnectAllMutation.isPending
                      ? "Disconnecting..."
                      : "Disconnect All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!repo || repo.length == 0 ? (
          <div className="text-muted-foreground text-sm">
            No repositories connected
          </div>
        ) : (
          <div className="space-y-4">
            {repo.map((repo) => (
              <div className="rounded-lg bg-white/10 p-4" key={repo.id}>
                <div className="flex justify-between">
                  <div className="mb-2 flex gap-6">
                    <h2 className="capitalize">{repo?.fullName}</h2>
                    <a
                      href={repo?.url}
                      target="_blank"
                      rel="noreferrer"
                      className=""
                    >
                      <ExternalLink className="ml-2 inline h-4 w-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => disconnectMutation.mutate(repo.id)}
                      disabled={disconnectMutation.isPending}
                      className="cursor-pointer text-xs"
                    >
                      {disconnectMutation.isPending
                        ? "Disconnecting..."
                        : "Disconnect"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
