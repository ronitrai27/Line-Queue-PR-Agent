"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
const OPENAI_KEY=sk_rhhfjr9576743848;
export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/login");

  return session;
};

export const requireReLoginAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) return redirect("/");

  return session
};
