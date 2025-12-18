"use client";

import React, { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const Logout = ({
  children,
  classname,
}: {
  children?: React.ReactNode;
  classname?: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(true);

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <>
      <span className={classname} onClick={handleLogout}>
        {children}
      </span>

      <Dialog open={open}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-base">Logging out</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Please wait…
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Logout;
