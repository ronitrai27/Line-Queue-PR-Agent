import LoginUi from "@/module/auth/components/login-ui";
import { requireReLoginAuth } from "@/utils/auth-utils";
import React from "react";

const LoginPage = async () => {
  await requireReLoginAuth(); // auto login if header(session) present...
  return (
    <div>
      <LoginUi />
    </div>
  );
};

export default LoginPage;
