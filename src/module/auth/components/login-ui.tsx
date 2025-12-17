"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { se } from "date-fns/locale";
import { GithubIcon, Loader2 } from "lucide-react";
import { useState } from "react";
const LoginUi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen w-screen p-12">
      <h1>this is the login page</h1>
      <p>welcome back </p>
      <Button
        onClick={handleGithubLogin}
        disabled={isLoading}
        // variant="outline"
        className="w-fit gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to GitHub...
          </>
        ) : (
          <>
            <GithubIcon className="h-4 w-4" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  );
};

export default LoginUi;
