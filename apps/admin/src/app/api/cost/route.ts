import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { env } from "~/env.mjs";
import { ShippingCostResponseSchema } from "@gramflow/utils/src/schema";

export async function GET(req: Request) {
  try {
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const schema = z.object({
      delivery_pincode: z.string().length(6),
      origin_pincode: z.string().length(6),
      weight: z.string(),
    });
    const delivery_pincode = searchParams.get("delivery_pincode");
    const origin_pincode = searchParams.get("origin_pincode");
    const weight = searchParams.get("weight");
    const validate = schema.parse({
      delivery_pincode,
      origin_pincode,
      weight,
    });

    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${env.DELHIVERY_API_KEY}`,
      },
    };

    const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${validate.delivery_pincode}&o_pin=${validate.origin_pincode}&cgm=${validate.weight}&pt=Pre-paid&cod=0`;
  
    const response = await fetch(url, options);
    if (!response.ok) {
      console.log("Error while requesting shipping data from Delhivery.", {
        response: JSON.stringify(response),
      });
      return NextResponse.json(
        { error: "Error generating shipping cost." },
        { status: 400 },
      );
    }
    const json = await response.json();
    const validated = ShippingCostResponseSchema.parse(json);

    if (!validated[0] || !validated[0]?.total_amount) {
      console.log("Error while validating shipping response from Delhivery.", {
        response: JSON.stringify(response),
      });
      return NextResponse.json(
        { error: "Error validating shipping cost" },
        { status: 400 },
      );
    }
    return NextResponse.json({ cost: validated[0]?.total_amount });
  } catch (e) {
    console.log({ e });
    return NextResponse.json(
      { error: "Error generating shipping cost." },
      { status: 400 },
    );
  }
}
