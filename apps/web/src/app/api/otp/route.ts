import { NextResponse } from "next/server";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { z } from "zod";

import { AppConfig } from "@acme/utils";

import { prisma } from "../../../lib/prismaClient";
import { env } from "~/env.mjs";

// @ts-ignore
const mailgun = new Mailgun(formData);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") ?? "";
    const order_id = searchParams.get("order_id") ?? "";

    const otpSchema = z.object({
      email: z.string().email(),
      order_id: z.string().uuid(),
    });

    otpSchema.parse({ email, order_id });

    // Generate a 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log({ otp });

    await prisma.otp.create({
      data: {
        email: email,
        otp: otp,
        order_id,
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
      },
    });

    const mg = mailgun.client({
      username: "api",
      key: env.MAILGUN_API_KEY ?? "",
    });
    const Domain = env.MAILGUN_DOMAIN ?? "";
    const data = {
      from: `${AppConfig.StoreName} Verification <no-reply@${env.MAILGUN_DOMAIN}>`,
      to: email,  
      subject: `${otp} is your ${AppConfig.StoreName} verification code`,
      template: "Otp Verfication",
      "h:X-Mailgun-Variables": JSON.stringify({
        otp: otp,
      }),
    };
    const emailReq = await mg.messages.create(Domain, data);
    console.log({ emailReq });
    return NextResponse.json({ success: "Email sent" });
  } catch (error) {
    console.log({ error });
    return new Response("Invalid OTP or email", { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    //verify the otp by taking it from the query params
    const { searchParams } = new URL(req.url);
    const otp = searchParams.get("otp") ?? "";
    const email = searchParams.get("email") ?? "";
    const otpSchema = z.object({
      otp: z.string().length(4),
      email: z.string().email(),
    });
    otpSchema.parse({ otp, email });
    console.log({ otp, email });
    //check if the otp is valid
    const otpCheck = await prisma.otp.findFirst({
      where: {
        email: email,
        otp: otp,
        expires: {
          gt: new Date(),
        },
      },
    });
    console.log({ otpCheck });
    if (!otpCheck) {
      throw new Error("Invalid OTP or email");
    }

    //fetching the user
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    console.log({ user });
    console.log(`Found user ${user?.id} with email ${user?.email}`);

    return NextResponse.json({ user: user, success: true, token: otpCheck.id });
  } catch (error) {
    console.log({ error });
    return new Response("Invalid OTP or email", { status: 400 });
  }
}
