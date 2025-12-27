/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};

type Session = {
  user: User;
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

type AuthError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};

export function useAuthUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        setError(error);
      } else {
        setSession(data);
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  return {
    session,
    user: session?.user,
    error,
    loading,
  };
}
