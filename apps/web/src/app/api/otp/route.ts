import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { OtpEmail } from "@acme/email";
import { AppConfig } from "@acme/utils";

import { env } from "~/env.mjs";
import { prisma } from "../../../lib/prismaClient";

const resend = new Resend(env.RESEND_API_KEY);

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

    const data = await resend.emails.send({
      from: `${AppConfig.StoreName.replace(" ", "")} <no-reply@${
        env.RESEND_DOMAIN
      }>`,
      to: [email],
      subject: `${AppConfig.StoreName} OTP is ${otp}`,
      //@ts-ignore
      react: OtpEmail({ otp: otp }),
    });
    console.log({ data });
    console.log(`Email sent to ${email}`);
    console.log({ data });
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
