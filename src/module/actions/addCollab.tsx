"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCollaborator } from "@/module/github/github";

interface AddCollaboratorDialogProps {
  owner: string;
  repo: string;
}

export function AddCollaboratorDialog({
  owner,
  repo,
}: AddCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<
    "pull" | "push" | "admin" | "maintain" | "triage"
  >("push");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addCollaborator(owner, repo, username, permission),
    onMutate: () => {
      return toast.loading(`Adding ${username}...`);
    },
    onSuccess: (data, _, toastId) => {
      toast.dismiss(toastId);

      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["collaborators", owner, repo],
        });
        setOpen(false);
        setUsername("");
        setPermission("push");
      } else {
        toast.error(data.error || "Failed to add collaborator");
      }
    },
    onError: (error: any, _, toastId) => {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to add collaborator");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a GitHub username");
      return;
    }

    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Collaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
            <DialogDescription>
              Invite a GitHub user to collaborate on {repo}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">GitHub Username</Label>
              <Input
                id="username"
                placeholder="e.g., ritesh-sinha29"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="permission">Permission Level</Label>
              <Select
                value={permission}
                onValueChange={(value: any) => setPermission(value)}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pull">
                    <div>
                      <div className="font-medium">Read</div>
                      <div className="text-muted-foreground text-xs">
                        Can pull, but not push
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="triage">
                    <div>
                      <div className="font-medium">Triage</div>
                      <div className="text-muted-foreground text-xs">
                        Can manage issues and pull requests
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="push">
                    <div>
                      <div className="font-medium">Write</div>
                      <div className="text-muted-foreground text-xs">
                        Can push to the repository
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="maintain">
                    <div>
                      <div className="font-medium">Maintain</div>
                      <div className="text-muted-foreground text-xs">
                        Can manage without access to sensitive actions
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-muted-foreground text-xs">
                        Full access to the repository
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Collaborator"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
