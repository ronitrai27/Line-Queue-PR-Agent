"use client";

import { RepositoryListPage } from "@/components/custom/Repo-list";
import { Settings } from "lucide-react";
import React from "react";

const SettingPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-wide">Settings</h1>
      <h3 className="text-muted-foreground mt-1 text-base">
        Manage your Settings and Connected Repos
        <Settings className="ml-2 inline h-4 w-4" />
      </h3>
      <div className="my-6 px-6">
        <RepositoryListPage />
      </div>
    </div>
  );
};

export default SettingPage;
