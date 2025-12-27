/* eslint-disable @next/next/no-img-element */
// components/repo-issues.tsx
"use client";

import { useState, useEffect } from "react";
import { getRepoIssues } from "@/module/github/github";

type Issue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  comments: number;
  html_url: string;
};

export function RepoIssues({ githubId }: { githubId: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = await getRepoIssues(githubId, filter);
        setIssues(data as Issue[]);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [githubId, filter]);

  const openCount = issues.filter((i) => i.state === "open").length;
  const closedCount = issues.filter((i) => i.state === "closed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setFilter("open")}
          className={`px-2 pb-3 font-medium transition-colors ${
            filter === "open"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-2 pb-3 font-medium transition-colors ${
            filter === "closed"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Closed ({closedCount})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-2 pb-3 font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({issues.length})
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No {filter} issues found</p>
          </div>
        ) : (
          issues.map((issue) => (
            <a
              key={issue.id}
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-4 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                {/* Status Badge */}
                <span
                  className={`mt-1 rounded px-2 py-1 text-xs font-semibold ${
                    issue.state === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {issue.state === "open" ? "🟢 Open" : "🟣 Closed"}
                </span>

                {/* Issue Details */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    #{issue.number} {issue.title}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <img
                        src={issue.user.avatar_url}
                        alt={issue.user.login}
                        className="h-5 w-5 rounded-full"
                      />
                      <span>{issue.user.login}</span>
                    </div>

                    <span>•</span>
                    <span>💬 {issue.comments}</span>

                    <span>•</span>
                    <span>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
