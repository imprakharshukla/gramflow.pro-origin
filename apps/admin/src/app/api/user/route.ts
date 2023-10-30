import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import { prisma } from "../../../lib/prismaClient";

export async function GET(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  console.log(req.url);
  const email = searchParams.get("email");
  console.log({ email });

  try {
    // @ts-ignore
    if (!email)
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    console.log({ user });
    return NextResponse.json({ user });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
