import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/utils/auth-utils";
import { DashboardBreadcrumbs } from "@/components/custom/sidebar-breadcrumbs";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-4 h-6" />
          <DashboardBreadcrumbs />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
