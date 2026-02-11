"use client";

import { useState } from "react";
import { Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCollaborator } from "@/module/github/github";

interface RemoveButtonProps {
  owner: string;
  repo: string;
  username: string;
}

export function RemoveButton({ owner, repo, username }: RemoveButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => removeCollaborator(owner, repo, username),
    onMutate: () => {
      return toast.loading(`Removing ${username} from ${repo}`);
    },
    onSuccess: (data, _, toastId) => {
      toast.dismiss(toastId);

      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["collaborators", owner, repo],
        });
        setOpen(false);
      } else {
        toast.error(data.error || "Failed to remove collaborator");
      }
    },
    onError: (error: any, _, toastId) => {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to remove collaborator");
    },
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive cursor-pointer hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">{username}</span> from{" "}
            <span className="font-semibold">{repo}</span>? They will immediately
            lose access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
