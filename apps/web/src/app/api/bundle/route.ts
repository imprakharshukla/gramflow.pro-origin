import { NextResponse } from "next/server";

import { db } from "@gramflow/db";
import { upsertUser } from "@gramflow/db/dbHelper";
import { bundleFormSchema } from "@gramflow/utils/src/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log({ body });
    const validated = bundleFormSchema.parse(body);
    console.log({ validated });

    const userReq = await upsertUser({
      state: "",
      name: validated.name,
      instagram_username: validated.instagramUsername,
      house_number: "",
      locality: "",
      pincode: "",
      landmark: "",
      city: "",
      country: "",
      phone_no: validated.phoneNumber,
      email: validated.email,
    });
    console.log({
      user_id: userReq.id,
    })
    const bundle = await db.bundles.create({
      data: {
        user_id: userReq.id,
        bundle_size: validated.bundleSize,
        bundle_description: validated.bundleDescription,
        aesthetics: validated.aesthetics,
        other_aesthetics: validated.otherAesthetic,
        images: validated.pictures,
        fashion_dislikes: validated.fashionDislikes,
        link_input: validated.linkInput,
        top_size: validated.topSize,
        waist: validated.bottomSize.waist.toString(),
        length: validated.bottomSize.length.toString(),
      },
    });
    console.log({ bundle });
    return NextResponse.json({ response: bundle.id });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
