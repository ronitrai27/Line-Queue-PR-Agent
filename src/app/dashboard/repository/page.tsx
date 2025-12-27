/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRepositories } from "@/module/repository/use-repositories";
import { RiGitRepositoryLine } from "react-icons/ri";
import { ExternalLink, GhostIcon, GithubIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LuStar } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { RepositoryCardSkeleton } from "@/components/custom/RepoSkeleton";
import { UseConnectRepo } from "@/module/repository/use-connect-repo";
import { toast } from "sonner";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepoPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { mutate: connectRepo } = UseConnectRepo();

  const [searchQuery, setSearchQuery] = useState("");

  const allRepos = data?.pages.flatMap((page) => page) || [];

  const filteredRepos = allRepos.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null
  );

  const handleConnect = async (repo: Repository) => {
    setLocalConnectingId(repo.id);
    toast.loading("Connecting repository...", {
      id: "connect-repo",
    });
    connectRepo(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => {
          setLocalConnectingId(null);
          toast.dismiss("connect-repo");
        },
      }
    );
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-wide">Repositories</h1>
        <h3 className="text-muted-foreground mt-1 text-base">
          Manage your all Github Repositories{" "}
          <GithubIcon className="ml-2 inline h-4 w-4" />
        </h3>

        <div className="mx-auto mt-10 grid w-full max-w-[90%] gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <RepositoryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold tracking-wide">Repositories</h1>
      <h3 className="text-muted-foreground mt-1 text-base">
        Manage your all Github Repositories{" "}
        <GithubIcon className="ml-2 inline h-4 w-4" />
      </h3>

      <div className="mt-8 flex w-full items-center justify-between px-4">
        <div className="relative mx-auto w-full max-w-[80%]">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search repositories"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button size="sm" className="text-xs">
          All
        </Button>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-[90%] gap-4">
        {filteredRepos.map((repo: Repository) => (
          <Card
            key={repo.id}
            className="px-2 py-4 transition-all duration-300 hover:-translate-x-3 hover:bg-linear-to-br hover:from-white/10 hover:to-transparent hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm leading-none font-medium">
                    {repo.name}
                  </p>
                  {repo.isConnected && (
                    <Badge variant="secondary">Connected</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 max-w-180">
                  {repo.description
                    ? repo.description
                    : "No description provided..."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="text-xs tracking-tight">
                  {repo.language ? repo.language : "Unknown"}
                </Badge>
                <p>
                  <LuStar className="ml-2 inline h-4 w-4 fill-yellow-400 text-yellow-400" />{" "}
                  {repo.stargazers_count}
                </p>
              </div>
            </CardHeader>
            <CardContent className="-mt-1 grid gap-4">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <Button
                  onClick={() => handleConnect(repo)}
                  size="sm"
                  disabled={localConnectingId === repo.id || repo.isConnected}
                  variant={repo.isConnected ? "outline" : "secondary"}
                  className="text-xs"
                >
                  {localConnectingId === repo.id
                    ? "Connecting..."
                    : repo.isConnected
                      ? "Connected"
                      : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[90%] py-4" ref={observerTarget}>
        {isFetchingNextPage && <RepositoryCardSkeleton />}
        {!hasNextPage ||
          (allRepos.length === 0 && (
            <p className="text-muted-foreground text-center">
              No More Repositories Found{" "}
              <GhostIcon className="ml-2 inline h-4 w-4" />
            </p>
          ))}
      </div>
    </div>
  );
};

export default RepoPage;
