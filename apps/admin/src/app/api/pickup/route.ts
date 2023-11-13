import { NextResponse } from "next/server";
import { format } from "date-fns";
import { z } from "zod";

import { AppConfig } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { prisma } from "~/lib/prismaClient";

export const PickupSuccessResponseSchema = z.object({
  client_name: z.string(),
  expected_package_count: z.string(),
  incoming_center_name: z.string(),
  pickup_date: z.string(),
  pickup_id: z.number(),
  pickup_location_name: z.string(),
  pickup_time: z.string(),
});

export const PickupErrorResponseSchema = z.object({
  status: z.boolean(),
  success: z.boolean(),
  pickup_id: z.number(),
  pr_exist: z.boolean(),
  error: z.object({ message: z.string(), code: z.number() }),
  data: z.object({ message: z.string() }),
});

export const PickupRequestSchema = z.object({
  pickup_location: z.string().default(AppConfig.WarehouseDetails.name),
  expected_package_count: z.number(),
  pickup_date: z.string(),
  order_ids: z.string().uuid().array(),
  pickup_time: z.string().default("13:54:00"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = PickupRequestSchema.parse(body);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${env.DELHIVERY_API_KEY}`,
      },
      body: JSON.stringify({
        pickup_location: AppConfig.WarehouseDetails.name,
        expected_package_count: validated.expected_package_count.toString(),
        pickup_date: format(
          new Date(validated.pickup_date),
          "yyyy-MM-dd",
        ).toString(),
        pickup_time: validated.pickup_time,
      }),
    };
    const response = await fetch(
      "https://track.delhivery.com/fm/request/new/",
      options,
    );

    if (!response.ok) {
      console.log({ status: response.status });

      const text = await response.text();
      console.log("Error while requesting pickup from Delhivery. ", text);
      return NextResponse.json(
        { error: `Error requesting pickup: ${text}` },
        { status: 400 },
      );
    }
    const json = await response.json();
    console.log({ json });

    await prisma.pickups.upsert({
      where: {
        pickup_id: json.pickup_id,
      },
      update: {
        pickup_location: validated.pickup_location,
        order_id: validated.order_ids,
        pickup_date: format(
          new Date(validated.pickup_date),
          "yyyy-MM-dd",
        ).toString(),
      },
      create: {
        pickup_id: json.pickup_id,
        pickup_location: validated.pickup_location,
        order_id: validated.order_ids,
        ordersId: validated.order_ids,
        pickup_date: format(
          new Date(validated.pickup_date),
          "yyyy-MM-dd",
        ).toString(),
      },
    });
    return NextResponse.json({
      pickup_id: json.pickup_id,

      pickup_location: validated.pickup_location,
      pickup_date: format(
        new Date(validated.pickup_date),
        "yyyy-MM-dd",
      ).toString(),
    });
  } catch (e) {
    console.log(e);
    return NextResponse.error(e);
  }
}
