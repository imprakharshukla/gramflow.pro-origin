import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "~/lib/prismaClient";

export async function GET(req: Request) {
  // we have to handle infinite scroll with react query and fetch the posts from here
  // we can also use the cursor based pagination to fetch the posts

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const results = Number(searchParams.get("results")) || 10;

  const validatedPage = z.number().parse(page);
  const validatedResults = z.number().parse(results);

  try {
    const posts = await prisma.posts.findMany({
      skip: (validatedPage - 1) * validatedResults,
      take: validatedResults,
      orderBy: {
        post_created_at: "desc",
      },
    });
  
    return NextResponse.json(posts);
  } catch (e) {
    console.log(e);
    return NextResponse.error(e);
  }
}
