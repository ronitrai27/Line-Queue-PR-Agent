/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Logout from "@/module/auth/components/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
// import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useAuthUser } from "@/lib/userAuthSession";
import {
  GitBranch,
  Github,
  GithubIcon,
  LogOutIcon,
  LucideWandSparkles,
  Moon,
  Play,
  Settings2,
  Sun,
} from "lucide-react";
import { LuGrip, LuListTodo, LuRocket } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { RiGitForkLine } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { getUserGithubDetails } from "@/module/dashboard";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, session, loading, error } = useAuthUser();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-github-data"],
    queryFn: async () => await getUserGithubDetails(),
    refetchOnWindowFocus: false,
  });
  // const { data: session } = useSession();
  // const sessionState = useAtomValue(useSession);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LuGrip,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: GithubIcon,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: LuListTodo,
    },
    {
      title: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: LuRocket,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Actions",
      url: "/dashboard/actions",
      icon: Play,
    },
  ];

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashbaord");
  };

  if (!mounted || !session) return null;

  const users = session.user;
  const userName = user?.name || "GUEST";
  const userEmail = user?.email || "";
  const userFirstName = user?.name.split(" ")[0].toUpperCase() || "GUEST";

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 px-2 py-2">
          <h2 className="text-center text-lg font-bold">
            <RiGitForkLine className="mr-2 inline h-5 w-5" /> Line-
            <span className="italic">queue</span>
          </h2>
          <div className="bg-sidebar-accent/30 flex items-center gap-4 rounded-lg px-2 py-2">
            <div className="bg-primary text-primary-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
              <Github className="h-6 w-6" />
            </div>
            <h2 className="text-sm">
              Connected Acount <br />{" "}
              <span className="text-sidebar-accent-foreground font-semibold">
                @{stats?.github_username ? stats.github_username : userName}
              </span>
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-col gap-1 px-3 py-4">
        <div className="mb-2"></div>
        <SidebarMenu className="gap-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 rounded-lg px-4 transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-sidebar-accent/50 text-sidebar-foreground font-semibold"
                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 h-10 rounded-lg px-4 py-8 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>{userFirstName}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-relaxed">
                    <span className="truncate text-base font-semibold">
                      {userName}
                    </span>
                    <span className="text-sidebar-foreground/70 truncate text-xs">
                      {userEmail}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 rounded-lg"
                align="end"
                side="right"
                sideOffset={8}
              >
                <DropdownMenuLabel className="flex justify-between gap-4">
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>{userFirstName}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-relaxed">
                    <span className="truncate text-base font-semibold">
                      {userName}
                    </span>
                    <span className="text-sidebar-foreground/70 truncate text-xs">
                      {userEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <div className="border-t border-b px-2 py-3">
                  <DropdownMenuItem asChild>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="hover:bg-sidebar-accent/50 mb-2 flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4 shrink-0" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 shrink-0" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="my-1 cursor-pointer rounded-md border-t px-3 py-2 font-medium transition-colors hover:bg-red-500/10 hover:text-red-500">
                    <LogOutIcon className="h-4 w-4 shrink-0" />
                    <Logout>
                      <span>Logout</span>
                    </Logout>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
