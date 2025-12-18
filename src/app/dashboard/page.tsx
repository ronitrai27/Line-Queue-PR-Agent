"use client";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/userAuthSession";
import Logout from "@/module/auth/components/logout";
import React from "react";

const MainPage = () => {
  const { user, session, loading, error } = useAuthUser();
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }
  if (loading) {
    return <p>Loading session...</p>;
  }
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Hello 👋</h1>

      <p>
        <strong>Name:</strong> {user?.name}
      </p>

      <p>
        <strong>Email:</strong> {user?.email}
      </p>

      <p>
        <strong>User ID:</strong> {user?.id}
      </p>

      <p>
        <strong>IP Address:</strong> {session?.session.ipAddress ?? "Unknown"}
      </p>

      <Logout classname="cursor-pointer">
        <Button>Logout</Button>
      </Logout>
    </div>
  );
};

export default MainPage;
