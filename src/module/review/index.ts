"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getReviews() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const reviews = await prisma.review.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
      include: {
        repository: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return reviews;
  } catch (error) {
    console.log(error);
    return [];
  }
}
