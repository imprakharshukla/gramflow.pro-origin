import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs";
import { render } from "@jsx-email/render";
import { Status } from "@prisma/client";
import { Resend } from "resend";
import { z } from "zod";

import {
  addOrder,
  checkIfAnyOrderContainsProducts,
} from "@gramflow/db/dbHelper";
import { fetchImageUrls } from "@gramflow/db/instagramHelper";
import { OrderShippedEmail, SendEmailViaResend } from "@gramflow/email";
import { AppConfig } from "@gramflow/utils";
import { AddOrderPostSchema } from "@gramflow/utils/src/schema";
import { sendMessageWithSectionsAndImages } from "@gramflow/utils/src/slackHelper";

import { env } from "~/env.mjs";
import { prisma } from "../../../lib/prismaClient";

const resend = new Resend(env.RESEND_API_KEY);
export async function GET(req: Request) {


  const { searchParams } = new URL(req.url);
  console.log(req.url);
  const schema = z.object({
    order_id: z.string().uuid(),
  });
  const order_id = searchParams.get("order_ids") ?? "";
  const orderArray = order_id.split(",");
  console.log({ orderArray });

  try {
    // @ts-ignore
    const orderResponse = [];
    for (let i = 0; i < orderArray.length; i++) {
      const id = orderArray[i];
      schema.parse({ order_id: id });
      const order = await prisma.orders.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
        },
      });
      orderResponse.push(order);
    }
    console.log({ orderResponse: orderResponse.length });
    // @ts-ignore
    return NextResponse.json({ data: orderResponse });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export function DELETE(req: Request) {


  const { searchParams } = new URL(req.url);
  const schema = z.object({
    id: z.string().uuid(),
  });

  const id = searchParams.get("id") ?? "";
  console.log({ id });
  try {
    const validated = schema.parse({ id });
    prisma.orders.delete({
      where: {
        id: validated.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export async function PUT(req: Request) {


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
      await prisma.orders.deleteMany({
        where: {
          id: {
            in: validated.order_ids,
          },
        },
      });
      return NextResponse.json({ success: true });
    } else {
      await prisma.orders.updateMany({
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

export async function POST(req: Request) {

  try {
    // @ts-ignore
    const data = await req.json();
    const headers = req.headers;
    // check if user is authenticated

    console.log({ data });
    const validated = AddOrderPostSchema.parse(data);
    console.log({ validated });

    //checking if any order contains that product. reject them if they do
    const request = await checkIfAnyOrderContainsProducts(validated);
    if (request) {
      console.log("Already ordered");
      console.log({ Product: request.id });
      return NextResponse.json(
        { error: "Product already ordered" },
        { status: 409 },
      );
    }

    const order = await addOrder(validated, validated.images ?? []);
    if (env.ENV === "prod") {
      await sendMessageWithSectionsAndImages(
        `
    *Order Id*: ${order.id}
    *Status*: ${order.status}
    *Created At*: ${order.created_at}
    `,
        "",
        [...order.images],
        env.SLACK_WEBHOOK_URL_CREATED ?? "",
      );
    }
    return new Response(order.id, {
      status: 200,
    });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export async function OPTIONS(req: Request) {

  //send emails to the selected users
  try {
    //get data from request as url params
    const { searchParams } = new URL(req.url);
    const orderIds = searchParams.get("order_ids") ?? "";
    const orderIdArray = orderIds.split(",");
    console.log({ orderIdArray });
    const validRes = z.array(z.string().uuid()).parse(orderIdArray);
    console.log({ validRes });
    const orders = await prisma.orders.findMany({
      where: {
        id: {
          in: validRes,
        },
      },
      include: {
        user: true,
      },
    });
    console.log({ orders });
    const emails = orders.map((order) => order.user?.email);
    console.log({ emails });

    //send emails to the users
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (order && order.user?.email) {
        const data = await resend.emails.send({
          from: `${AppConfig.StoreName} <no-reply@${env.RESEND_DOMAIN}>`,
          to: [order?.user?.email],
          subject: "Order Shipped",
          react: OrderShippedEmail({
            awb: order.awb ?? "",
            name: order.user.name,
            house_number: order.user.house_number,
            pincode: order.user.pincode,
            landmark: order.user.landmark ?? "",
            locality: order.user.locality,
            city: order.user.city,
            state: order.user.state,
            country: order.user.country,
            courier: order.courier,
          }),
        });
        console.log({ data });
        console.log(`Email sent to ${order.user?.email}`);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}
