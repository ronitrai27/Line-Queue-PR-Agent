// "use server";
// import { getRepoIssues } from "../github/github";
// import { auth } from "@/lib/auth";
// import prisma from "@/lib/db";
// import { headers } from "next/headers";

// export async function getIssues(
//   githubId: string,
//   state?: "open" | "closed" | "all"
// ) {
//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       throw new Error("Unauthorized");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
