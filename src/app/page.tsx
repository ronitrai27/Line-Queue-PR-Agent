import { Button } from "@/components/ui/button";
import Logout from "@/module/auth/components/logout";
import { requireAuth } from "@/utils/auth-utils";
import React from "react";

export default async function Home() {
  await requireAuth();
  return (
    <div>
      hello this is home page
      <Logout>
        <Button>logout</Button>
      </Logout>
    </div>
  );
}
