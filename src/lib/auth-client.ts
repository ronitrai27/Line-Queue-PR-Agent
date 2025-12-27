import { createAuthClient } from "better-auth/client";

// export const  {signIn, signUp, useSession, signOut} = createAuthClient({
//     baseURL:process.env.BETTER_AUTH_URL!,
// })

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});
export const { signIn, signUp, signOut } = authClient;
