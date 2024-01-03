import { NextResponse } from "next/server";
import { z } from "zod";

import {
  GetOtp,
  deleteOtp,
  updateOrder,
  upsertUser,
} from "@gramflow/db/dbHelper";
import { UpdateUserPutSchema } from "@gramflow/utils/src/schema";
import { sendMessageWithSectionsAndImages } from "@gramflow/utils/src/slackHelper";
import { env } from "~/env.mjs";

export async function PUT(req: Request) {
  try {
    // get the token from the header
    const token = req.headers.get("authorization");
    // This token is the id of the otp row in the db. So we can use it fetch the order ID
    // verify if the order is the same as authenticated
    if (!token) {
      throw new Error("No token found");
    }

    const otp = await GetOtp(token);
    if (!otp) {
      throw new Error("Invalid token");
    }

    const data = await req.json();
    const validated = UpdateUserPutSchema.parse(data);
    console.log({ validated });
    if (otp.order_id !== validated.id) {
      throw new Error("Invalid token");
    }
    console.log(`Order verified ${otp.order_id} with token ${otp.id}`);
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
    await deleteOtp(token);
    return NextResponse.json({ addRequest });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
