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
  Github,
  GithubIcon,
  LogOutIcon,
  LucideWandSparkles,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";
import { LuGrip, LuListTodo, LuRocket } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { RiGitForkLine } from "react-icons/ri";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, session, loading, error } = useAuthUser();
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
      url: "/repository",
      icon: GithubIcon,
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: LuListTodo,
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: LuRocket,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
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
          <h2 className="font-bold text-lg text-center">
            <RiGitForkLine  className="w-5 h-5 inline mr-2" /> Line-
            <span className="italic">queue</span>
          </h2>
          <div className="flex items-center gap-4 px-2 rounded-lg bg-sidebar-accent/30 py-2  ">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <h2 className="text-sm">
              Connected Acount <br />{" "}
              <span className="font-semibold text-sidebar-accent-foreground">
                @{userName}
              </span>
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4 px-3 flex-col gap-1">
        <div className="mb-2"></div>
        <SidebarMenu className="gap-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 px-4 rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-sidebar-accent/50 text-sidebar-foreground font-semibold"
                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
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
                  className="h-10 px-4 py-8 rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-colors"
                >
                  <Avatar className="h-10 w-10 rounded-lg shrink-0">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>{userFirstName}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                    <span className="truncate font-semibold text-base">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
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
                <DropdownMenuLabel className="flex justify-between gap-4 ">
                  <Avatar className="h-10 w-10 rounded-lg shrink-0">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>{userFirstName}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                    <span className="truncate font-semibold text-base">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {userEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <div className="px-2 py-3 border-t border-b">
                  <DropdownMenuItem asChild>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="w-full px-2 py-2 flex items-center gap-3 cursor-pointer rounded-md hover:bg-sidebar-accent/50 transition-colors text-sm font-medium mb-2"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="w-4 h-4 shrink-0" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 shrink-0" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer border-t px-3 py-2 my-1 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium">
                    <LogOutIcon className="w-4 h-4 shrink-0" />
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
