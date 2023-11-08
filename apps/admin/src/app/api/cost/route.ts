import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { env } from "~/env.mjs";

export const shippingCostResponseSchema = z.array(
  z.object({
    charge_ROV: z.number(),
    charge_REATTEMPT: z.number(),
    charge_RTO: z.number(),
    charge_MPS: z.number(),
    charge_pickup: z.number(),
    charge_CWH: z.number(),
    tax_data: z.object({
      swacch_bharat_tax: z.number(),
      IGST: z.number(),
      SGST: z.number(),
      service_tax: z.number(),
      krishi_kalyan_cess: z.number(),
      CGST: z.number(),
    }),
    charge_DEMUR: z.number(),
    charge_AWB: z.number(),
    zone: z.string(),
    wt_rule_id: z.null(),
    charge_AIR: z.number(),
    charge_FSC: z.number(),
    charge_LABEL: z.number(),
    charge_COD: z.number(),
    status: z.string(),
    charge_POD: z.number(),
    adhoc_data: z.object({}),
    charge_CCOD: z.number(),
    gross_amount: z.number(),
    charge_DTO: z.number(),
    charge_COVID: z.number(),
    zonal_cl: z.null(),
    charge_DL: z.number(),
    total_amount: z.number(),
    charge_DPH: z.number(),
    charge_FOD: z.number(),
    charge_DOCUMENT: z.number(),
    charge_WOD: z.number(),
    charge_INS: z.number(),
    charge_FS: z.number(),
    charge_CNC: z.number(),
    charge_FOV: z.number(),
    charge_QC: z.number(),
    charged_weight: z.number(),
  }),
);

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
    const validated = shippingCostResponseSchema.parse(json);

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
