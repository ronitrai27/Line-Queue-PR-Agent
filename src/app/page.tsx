import { Button } from "@/components/ui/button";
import Logout from "@/module/auth/components/logout";
import { requireAuth } from "@/utils/auth-utils";
import { redirect } from "next/navigation";
import React from "react";

export default async function Home() {
  await requireAuth();
  return redirect("/dashboard");
}
