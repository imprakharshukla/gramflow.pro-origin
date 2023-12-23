import { NextResponse } from "next/server";

import { updateOrder, upsertUser } from "@gramflow/db/dbHelper";
import { UpdateUserPutSchema } from "@gramflow/utils/src/schema";
import { sendMessageWithSectionsAndImages } from "@gramflow/utils/src/slackHelper";

import { env } from "~/env.mjs";

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const validated = UpdateUserPutSchema.parse(data);
    console.log({ validated });

    const userReq = await upsertUser({
      state: validated.state,
      name: validated.name,
      instagram_username: validated.instagram_username,
      house_number: validated.house_number,
      locality: validated.locality,
      pincode: validated.pincode,
      landmark: validated.landmark ?? "",
      city: validated.city,
      country: validated.country,
      phone_no: validated.phone_no,
      email: validated.email,
    });
    const addRequest = await updateOrder(validated.id, userReq.id);

    return NextResponse.json({ addRequest });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
