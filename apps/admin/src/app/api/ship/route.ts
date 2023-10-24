import fs from "fs";
import { url } from "inspector";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth, currentUser } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { z } from "zod";

import { AppConfig } from "@acme/utils";
import { type CSVSchema, type OrderSchemaCSV } from "@acme/utils/src/schema";
import {
  sendFileToTelegram,
  sendMessageToSlackWithFileLink,
} from "@acme/utils/src/slackHelper";

import { env } from "~/env.mjs";
import { createShipments, getPostIdAndImageIndex } from "~/lib/shippingHelper";
import { prisma } from "../../../lib/prismaClient";

const fsp = fs.promises;
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

export const DelhiveryTrackingSchema = z.object({
  ShipmentData: z.array(
    z.object({
      Shipment: z.object({
        PickUpDate: z.string(),
        Destination: z.string(),
        DestRecieveDate: z.string().nullish(),
        Scans: z.array(
          z.object({
            ScanDetail: z.object({
              ScanDateTime: z.string(),
              ScanType: z.string(),
              Scan: z.string(),
              StatusDateTime: z.string(),
              ScannedLocation: z.string(),
              Instructions: z.string(),
              StatusCode: z.string(),
            }),
          }),
        ),
        Status: z.object({
          Status: z.string(),
          StatusLocation: z.string(),
          StatusDateTime: z.string(),
          RecievedBy: z.string(),
          Instructions: z.string(),
          StatusType: z.string(),
          StatusCode: z.string(),
        }),
        ReturnPromisedDeliveryDate: z.string().nullish(),
        Ewaybill: z.array(z.unknown()),
        InvoiceAmount: z.number(),
        ChargedWeight: z.string().nullish(),
        PickedupDate: z.string().nullish(),
        DeliveryDate: z.string().nullish(),
        SenderName: z.string(),
        AWB: z.string(),
        DispatchCount: z.number(),
        OrderType: z.string(),
        ReturnedDate: z.string().nullish(),
        ExpectedDeliveryDate: z.string().nullish(),
        RTOStartedDate: z.string().nullish(),
        Extras: z.string(),
        FirstAttemptDate: z.string().nullish(),
        ReverseInTransit: z.boolean(),
        Quantity: z.string(),
        Origin: z.string(),
        Consignee: z.object({
          City: z.string(),
          Name: z.string(),
          Country: z.string(),
          Address2: z.array(z.unknown()),
          Address3: z.string(),
          PinCode: z.number(),
          State: z.string(),
          Telephone2: z.string(),
          Telephone1: z.string(),
          Address1: z.array(z.unknown()),
        }),
        ReferenceNo: z.string(),
        OutDestinationDate: z.string().nullish(),
        CODAmount: z.number(),
        PromisedDeliveryDate: z.string().nullish(),
        PickupLocation: z.string(),
        OriginRecieveDate: z.string().nullish(),
      }),
    }),
  ),
});

export async function GET(req: Request) {
  // todo implement delivery rate calculation
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  try {
    //get data from request
    // @ts-ignore
    const data = await req.json();
    const validated = z
      .object({
        order_ids: z.array(z.string().uuid()),
      })
      .parse(data);
    console.log({ validated });

    const orders = await prisma.orders.findMany({
      where: {
        id: {
          in: validated.order_ids,
        },
      },
      include: {
        user: true,
      },
    });

    //create a csv file with the data following the OrderSchema
    //send the csv file to the shipping api

    const csvArray: z.infer<typeof CSVSchema> = [];
    orders.forEach((order) => {
      const products: string[] = [];
      let totalPrice = 0;
      order.instagram_post_urls.map((url) => {
        const { postId, imageIndex } = getPostIdAndImageIndex(url);
        products.push(`${postId}(${imageIndex})`);
        const uri = new URL(url);
        const priceValue = uri.searchParams.get("price");
        const parsedPrice = Number(priceValue);
        totalPrice += parsedPrice;
      });

      const csvFormattedOrder: z.infer<typeof OrderSchemaCSV> = {
        "Sale Order Number": order.id,
        "Pickup Location Name": AppConfig.WarehouseDetails.name,
        "Transport Mode": "Surface",
        "Payment Mode": "Prepaid",
        "COD Amount": "",
        "Customer Name": order.user?.name ?? "",
        "Customer Phone": order.user?.phone_no ?? "",
        "Shipping Address Line1": `${order.user?.house_number}, ${order.user?.locality}`,
        "Shipping Address Line2": "",
        "Shipping City": order.user?.city ?? "",
        "Shipping State": order.user?.state ?? "",
        "Shipping Pincode": order.user?.pincode ?? "",
        "Item Sku Code": products.join(" & "),
        "Item Sku Name": products.join(" & "),
        "Quantity Ordered": "1",
        "Unit Item Price": totalPrice.toString() ?? "100",
        "Length (cm)": "25",
        "Breadth (cm)": "20",
        "Height (cm)": "5",
        "Weight (gm)": "500",
        "Fragile Shipment": "No",
        "Discount Type": "",
        "Discount Value": "",
        "Tax Class Code": "",
        "Customer Email": order.user?.email,
        "Billing Address same as Shipping Address": "Yes",
        "Billing Address Line1": "",
        "Billing Address Line2": "",
        "Billing City": "",
        "Billing State": "",
        "Billing Pincode": "",
        "e-Way Bill Number": "",
        "Seller Name": "",
        "Seller GST Number": "",
        "Seller Address Line1": "",
        "Seller Address Line2": "",
      };

      csvArray.push(csvFormattedOrder);
    });

    console.log({ csvArray });
    const tempDir = os.tmpdir(); // Get the system's temporary directory
    const tempFilePath = path.join(
      tempDir,
      `${new Date().getMilliseconds()}.csv`,
    ); // Define the temporary file path
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const csvWriter = createCsvWriter({
      path: tempFilePath,
      header: [
        { id: "Sale Order Number", title: "*Sale Order Number" },
        { id: "Pickup Location Name", title: "*Pickup Location Name" },
        { id: "Transport Mode", title: "*Transport Mode" },
        { id: "Payment Mode", title: "*Payment Mode" },
        { id: "COD Amount", title: "COD Amount" },
        { id: "Customer Name", title: "*Customer Name" },
        { id: "Customer Phone", title: "*Customer Phone" },
        { id: "Shipping Address Line1", title: "*Shipping Address Line1" },
        { id: "Shipping Address Line2", title: "Shipping Address Line2" },
        { id: "Shipping City", title: "*Shipping City" },
        { id: "Shipping State", title: "*Shipping State" },
        { id: "Shipping Pincode", title: "*Shipping Pincode" },
        { id: "Item Sku Code", title: "*Item Sku Code" },
        { id: "Item Sku Name", title: "*Item Sku Name" },
        { id: "Quantity Ordered", title: "*Quantity Ordered" },
        { id: "Unit Item Price", title: "*Unit Item Price" },
        { id: "Length (cm)", title: "Length (cm)" },
        { id: "Breadth (cm)", title: "Breadth (cm)" },
        { id: "Height (cm)", title: "Height (cm)" },
        { id: "Weight (gm)", title: "Weight (gm)" },
        { id: "Fragile Shipment", title: "Fragile Shipment" },
        { id: "Discount Type", title: "Discount Type" },
        { id: "Discount Value", title: "Discount Value" },
        { id: "Tax Class Code", title: "Tax Class Code" },
        { id: "Customer Email", title: "Customer Email" },
        {
          id: "Billing Address same as Shipping Address",
          title: "Billing Address same as Shipping Address",
        },
        { id: "Billing Address Line1", title: "Billing Address Line1" },
        { id: "Billing Address Line2", title: "Billing Address Line2" },
        { id: "Billing City", title: "Billing City" },
        { id: "Billing State", title: "Billing State" },
        { id: "Billing Pincode", title: "Billing Pincode" },
        { id: "e-Way Bill Number", title: "e-Way Bill Number" },
        { id: "Seller Name", title: "Seller Name" },
        { id: "Seller GST Number", title: "Seller GST Number" },
        { id: "Seller Address Line1", title: "Seller Address Line1" },
        { id: "Seller Address Line2", title: "Seller Address Line2" },
        { id: "Seller City", title: "Seller City" },
        { id: "Seller State", title: "Seller State" },
        { id: "Seller Pincode", title: "Seller Pincode" },
      ],
    });

    await csvWriter.writeRecords(csvArray);
    console.log(`CSV file written to ${tempFilePath}`);
    // const url = await sendFileToTelegram(
    //   tempFilePath,
    //   env.TELEGRAM_API_KEY ?? "",
    //   env.TELEGRAM_CHAT_ID ?? "",
    // );
    // console.log({ url });

    //upload the file to s3 cloudflare r2
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
      },
    });
    const response = await fsp.readFile(tempFilePath);
    const putObjectCommand = new PutObjectCommand({
      Bucket: env.CF_FILES_BUCKET_NAME,
      Key: `bulk-order-csv-files/${path.basename(tempFilePath)}`,
      Body: response,
    });
    await S3.send(putObjectCommand);
    //generate a signed url for the file with an expiry of 1 hour
    console.log({
      path: `bulk-order-csv-files/${path.basename(tempFilePath)}`,
    });
    const signedURL = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: env.CF_FILES_BUCKET_NAME,
        Key: `bulk-order-csv-files/${path.basename(tempFilePath)}`,
      }),
      { expiresIn: 3600 },
    );
    console.log({ signedURL });
    //send the signed url to slack
    await sendMessageToSlackWithFileLink(
      signedURL,
      `Bulk Order CSV File for orders ${validated.order_ids.join(",")}`,
    );
    return new Response(signedURL, {
      status: 200,
    });
  } catch (e) {
    console.log({ error: e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    //get data from request
    // @ts-ignore
    const data = await req.json();
    const validated = z
      .object({
        order_ids: z.array(z.string().uuid()),
      })
      .parse(data);

    console.log({ validated });
    const shippingRequest = await createShipments(validated.order_ids);
    console.log({ shippingRequest });
    return NextResponse.json({ success: true });
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

  try {
    //get data from request as url params
    const { searchParams } = new URL(req.url);
    const orderIds = searchParams.get("order_ids") ?? "";
    const orderIdArray = orderIds.split(",");
    console.log({ orderIdArray });
    const validRes = z.array(z.string().uuid()).safeParse(orderIdArray);
    console.log({ validRes });
    if (validRes.success) {
      //chunk the order ids into chunks of 50
      const chunkSize = 50;
      const chunkedOrderIds = [];
      for (let i = 0; i < orderIdArray.length; i += chunkSize) {
        chunkedOrderIds.push(orderIdArray.slice(i, i + chunkSize));
      }

      //loop through the chunks and update
      for (const chunk of chunkedOrderIds) {
        const chunkWithStatus = chunk.map((id) => ({
          id,
          status: Status.PENDING,
        }));
        const shippingRequest = await updateStatusFromDelhivery(
          chunkWithStatus,
        );
        console.log({ shippingRequest });
      }
    } else {
      //get all the orders in the last 2 weeks or 14 days
      const orders = await prisma.orders.findMany({
        where: {
          created_at: {
            gte: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000),
          },
        },
      });
      // now we will try to update all the orders with the shipping status after dividing them into chunks of 50
      const chunkSize = 50;
      const chunkedOrders = [];
      for (let i = 0; i < orders.length; i += chunkSize) {
        chunkedOrders.push(orders.slice(i, i + chunkSize));
      }
      console.log({ chunkedOrders });
      for (const chunk of chunkedOrders) {
        const order_ids = chunk.map((order) => ({
          id: order.id,
          status: order.status,
        }));
        console.log({ order_ids });
        const shippingRequest = await updateStatusFromDelhivery(order_ids);
        console.log({ shippingRequest });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ error: "Something went wrong", status: 500 });
  }
}

export const updateStatusFromDelhivery = async (
  order_ids: {
    id: string;
    status: Status;
  }[],
) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${env.DELHIVERY_API_KEY}`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    };
    fetch(
      `https://track.delhivery.com/api/v1/packages/json/?ref_ids=${order_ids
        .map((order) => order.id)
        .join(",")}`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        try {
          console.log({ response });
          if (response && response.ShipmentData) {
            const validated = DelhiveryTrackingSchema.parse(response);
            console.log({ validated });
            const shipments = validated.ShipmentData;
            shipments.map(async (shipment) => {
              const status = shipment.Shipment.Status.Status;
              const order_id = shipment.Shipment.ReferenceNo;
              let statusToBeUpdated;
              if (status === "Delivered") {
                statusToBeUpdated = Status.DELIVERED;
              } else if (status === "In Transit") {
                statusToBeUpdated = Status.SHIPPED;
              } else if (status === "Manifested") {
                statusToBeUpdated = Status.MANIFESTED;
              } else if (status === "Out for Delivery") {
                statusToBeUpdated = Status.OUT_FOR_DELIVERY;
              }

              console.log({ order_ids });

              //check if the order alrteady has the status
              if (
                statusToBeUpdated ===
                order_ids.find((order) => order.id === order_id)?.status
              ) {
                console.log(
                  `The order ${order_id} already has the status ${statusToBeUpdated}`,
                );
              } else {
                await prisma.orders.update({
                  where: {
                    id: order_id,
                  },
                  data: {
                    status: statusToBeUpdated,
                    awb: shipment.Shipment.AWB,
                  },
                });
                console.log(
                  `The order ${order_id} is now ${statusToBeUpdated}`,
                );
              }
            });
            resolve("OK");
          } else {
            resolve("NOK");
          }
        } catch (e) {
          console.log({ e });
          throw e;
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
