import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { Status } from "@gramflow/db";
import { AppConfig } from "@gramflow/utils/config.mjs";

import { env } from "~/env.mjs";
import { prisma } from "~/lib/prismaClient";

const redis = new Redis({
  url: env.UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
});
const areBundlesAvailable = await redis.get<boolean>("bundles");
const baseUrl =
  env.ENV === "dev" ? "http://localhost:3000" : AppConfig.BaseAdminUrl;

export async function POST(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const schema = z.object({
    id: z.string().uuid(),
    price: z.string(),
  });

  const id = searchParams.get("id") ?? "";
  const price = searchParams.get("price") ?? "";
  console.log({ id, price });
  const validated = schema.parse({
    id,
    price,
  });
  console.log({ validated });

  try {
    const bundle = await prisma.bundles.findUnique({
      where: {
        id: validated.id,
      },
    });
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const randomString = Math.random().toString(36).substring(2, 6);
    const fakeOrderUrl = `https://www.instagram.com/p/bundles${randomString}/?img_index=0&price=${validated.price}`;

    // Transform the orders array into the format expected by your API
    const requestBody = {
      instagram_post_urls: [fakeOrderUrl],
      images: ["https://reskinn.store/bundle_og.png"],
      prebook: false,
      bundle: true,
      bundle_id: validated.id,
      size: {
        length: "10",
        breadth: "10",
        height: "10",
        weight: "500",
      },
    };
    console.log({ requestBody });
    const authHeader =
      env.ENV === "dev" ? env.CLERK_DEV_JWT : env.CLERK_PROD_JWT;
    console.log({ authHeader });
    //todo change the URL
    const req = await fetch(baseUrl + "/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    if (!req.ok) {
      return NextResponse.json({ error: "Something went wrong", status: 500 });
    } else {
      const res = await req.text();
      console.log({ res });
      await prisma.bundles.update({
        where: {
          id: validated.id,
        },
        data: {
          status: Status.ACCEPTED,
        },
      });
      return NextResponse.json({ success: true });
    }
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const schema = z.object({
    order_ids: z.string().array(),
    status: z.nativeEnum(Status),
    delete: z.boolean().optional(),
  });

  const order_ids = searchParams.get("order_ids") ?? "";
  const status = searchParams.get("status") ?? "";
  const deleteOrder = searchParams.get("delete") ?? "false";
  const del = deleteOrder === "true";
  console.log({ order_ids, status, deleteOrder });
  const validated = schema.parse({
    order_ids: order_ids.split(","),
    status,
    delete: del,
  });
  console.log({ validated });

  try {
    if (validated.delete) {
      await prisma.bundles.deleteMany({
        where: {
          id: {
            in: validated.order_ids,
          },
        },
      });
      return NextResponse.json({ success: true });
    } else {
      await prisma.bundles.updateMany({
        where: {
          id: {
            in: validated.order_ids,
          },
        },
        data: {
          status: validated.status,
        },
      });
      return NextResponse.json({ success: true });
    }
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export async function OPTIONS(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const areBundlesEnabled = searchParams.get("bundles_enabled") ?? "";
  console.log({ areBundlesEnabled });
  const bundlesEnabled = areBundlesEnabled === "true";
  try {
    await redis.set("bundles", bundlesEnabled);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
