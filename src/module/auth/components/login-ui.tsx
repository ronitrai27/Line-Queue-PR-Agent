"use client";
import { signIn } from "@/lib/auth-client";
import { se } from "date-fns/locale";
import { GithubIcon } from "lucide-react";
import { useState } from "react";
const LoginUi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGithubLogin = async ()=>{
    setIsLoading(true);
    
  }
  return <div></div>;
};

export default LoginUi;
