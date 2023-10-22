import process from "process";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { AppConfig } from "@acme/utils";

import { env } from "~/env.mjs";

const prisma = new PrismaClient();
export const pincodePriceRequestSchema = z.object({
  from_pincode: z.string().default("201305"),
  to_pincode: z.string().min(6).max(6),
  shipping_length_cms: z.string().default("25"),
  shipping_width_cms: z.string().default("20"),
  shipping_height_cms: z.string().default("5"),
  shipping_weight_kg: z.string().default("0.50"),
  order_type: z.string().default("forward"),
  payment_method: z.string().default("prepaid"),
  product_mrp: z.string().default("100"),
  access_token: z.string().default(process.env.ITL_ACCESS_KEY ?? ""),
  secret_key: z.string().default(process.env.ITL_SECRET_KEY ?? ""),
});

export const pincodePriceResponseSchema = z.object({
  status: z.string(),
  status_code: z.number(),
  data: z.array(
    z.object({
      logistic_name: z.string(),
      logistic_service_type: z.string(),
      logistic_id: z.string(),
      rto_charges: z.number(),
      prepaid: z.string(),
      cod: z.string(),
      pickup: z.string(),
      rev_pickup: z.string(),
      weight_slab: z.string(),
      rate: z.number(),
    }),
  ),
  zone: z.string(),
  expected_delivery_date: z.string(),
});

const delhiveryShipmentSchema = z.object({
  name: z.string(),
  add: z.string(),
  pin: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  phone: z.string(),
  order: z.string(),
  payment_mode: z.string(),
  return_pin: z.string(),
  return_city: z.string(),
  return_phone: z.string(),
  return_add: z.string(),
  return_state: z.string(),
  return_country: z.string(),
  products_desc: z.string(),
  hsn_code: z.string(),
  cod_amount: z.string(),
  order_date: z.date(),
  total_amount: z.string(),
  seller_add: z.string(),
  seller_name: z.string(),
  seller_inv: z.string(),
  quantity: z.string(),
  waybill: z.string(),
  shipment_width: z.string(),
  shipment_height: z.string(),
  weight: z.string(),
  seller_gst_tin: z.string(),
  shipping_mode: z.string(),
  address_type: z.string(),
});

const delhiveryRequestSchema = z.object({
  shipments: z.array(delhiveryShipmentSchema),
  pickup_location: z.object({
    name: z.string().default(AppConfig.WarehouseDetails.name),
    add: z
      .string()
      .default(
        `${AppConfig.WarehouseDetails.house_number}, ${AppConfig.WarehouseDetails.locality}`,
      ),
    city: z.string().default(AppConfig.WarehouseDetails.city),
    pin_code: z.string().default(AppConfig.WarehouseDetails.pincode),
    country: z.string().default(AppConfig.WarehouseDetails.country),
    phone: z.string().default(AppConfig.WarehouseDetails.phone_no),
  }),
});

const delhiveryPackageSchema = z.object({
  client: z.string(),
  cod_amount: z.number(),
  payment: z.string(),
  refnum: z.string(),
  remarks: z.array(z.string()),
  serviceable: z.boolean(),
  sort_code: z.null().or(z.string()), // Allows for null or string
  status: z.string(),
  waybill: z.string(),
});

const delhiveryResponseSchema = z.object({
  cash_pickups: z.number(),
  cash_pickups_count: z.number(),
  cod_amount: z.number(),
  cod_count: z.number(),
  package_count: z.number(),
  packages: z.array(delhiveryPackageSchema),
  pickups_count: z.number(),
  prepaid_count: z.number(),
  replacement_count: z.number(),
  rmk: z.string(),
  success: z.boolean(),
  upload_wbn: z.string(),
});

const responseSchema = z.object({
  status: z.string(),
  status_code: z.number(),
  html_message: z.string(),
  data: z.record(
    z.object({
      status: z.string(),
      remark: z.string(),
      waybill: z.string(),
      refnum: z.string(),
      logistic_name: z.string(),
      tracking_url: z.string(),
    }),
  ),
});

async function createShipmentWithApi(
  shipments: z.infer<typeof delhiveryRequestSchema>,
): Promise<z.infer<typeof delhiveryResponseSchema> | null> {
  console.log("To be shipped", JSON.stringify(shipments));
  const requestOptions = {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${env.DELHIVERY_API_KEY}`,
    }),
    body: "format=json&data=" + JSON.stringify(shipments),
  };
  console.log({ requestOptions });

  const response = await fetch(
    "https://staging-express.delhivery.com/api/cmu/create.json ",
    requestOptions,
  );

  if (!response.ok) {
    throw new Error("Failed to create orders");
  }

  try {
    const res = await response.json();
    console.log({ res: JSON.stringify(res) });
    return delhiveryResponseSchema.parse(res);
  } catch (e) {
    console.log({ validationError: e });
    return null;
  }
}

async function findAllOrders(orderIds: string[]) {
  const orderArray = await prisma.orders.findMany({
    where: {
      id: {
        in: orderIds,
      },
    },
    include: {
      user: true,
    },
  });
  console.log({ orderArray });
  return orderArray;
}

//for delhivery
export async function createShipments(orderIds: string[]) {
  return new Promise(async (resolve, reject) => {
    const chunkSize = 10;
    const ordersArray = await findAllOrders(orderIds);

    const chunkedOrders = chunkArray(ordersArray, chunkSize);
    console.log({ chunkedOrders });

    chunkedOrders.map(async (orders) => {
      try {
        // shipments array of shipmentSchema
        const shipments: z.infer<typeof delhiveryShipmentSchema>[] = [];
        orders.map(async (order, index) => {
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
          console.log({ order }, index);

          const shipment = delhiveryShipmentSchema.parse({
            order: order.id,
            order_date: order.created_at,
            name: order.user?.name,
            add: `${order.user?.house_number}, ${order.user?.locality}`,
            pin: order.user?.pincode,
            country: order.user?.country,
            state: order.user?.state,
            city: order.user?.city,
            cod_amount: "",
            total_amount: totalPrice.toString(),
            phone: order.user?.phone_no,
            payment_mode: AppConfig.DefaultPaymentMode,
            return_pin: "",
            return_city: "",
            return_phone: "",
            return_add: "",
            return_state: "",
            return_country: "",
            products_desc: products.join(", "),
            hsn_code: "",
            seller_add: "",
            seller_name: AppConfig.StoreName,
            seller_inv: "",
            quantity: "",
            waybill: "",
            shipment_width: order.breadth,
            shipment_length: order.length,
            shipment_height: order.height,
            weight: order.weight,
            seller_gst_tin: "",
            shipping_mode: "Surface",
            address_type: "home",
          });
          console.log({ shipment: JSON.stringify(shipment) });
          shipments.push(shipment);
        });

        //remove

        const validatedOrder = delhiveryRequestSchema.parse({
          shipments: shipments,
          pickup_location: {
            name: AppConfig.WarehouseDetails.name,
            add: `${AppConfig.WarehouseDetails.house_number}, ${AppConfig.WarehouseDetails.locality}`,
            city: AppConfig.WarehouseDetails.city,
            pin_code: AppConfig.WarehouseDetails.pincode,
            country: AppConfig.WarehouseDetails.country,
            phone: AppConfig.WarehouseDetails.phone_no,
          },
        });
        console.log({ validatedOrder });
        const response = await createShipmentWithApi(validatedOrder);
        console.log(response);
        if (response) {
          console.log("Successfully created shipments");
          // if (json.status !== "success") {
          //   console.log(json)
          //   return;
          // }
          const shipmentResponse = delhiveryResponseSchema.parse(response);

          shipmentResponse.packages.map(async (packageData) => {
            const orderId = packageData.refnum;
            const trackingId = packageData.waybill;
            await prisma.orders.update({
              where: {
                id: orderId,
              },
              data: {
                awb: trackingId,
                courier: "DELHIVERY",
              },
            });
          });
          resolve({
            status: "success",
            message: "Successfully created shipments",
          });
        }
      } catch (e) {
        console.log("Failed to create shipments");
        console.log({ e });
        reject(e);
      }
    });
  });
}

export const getPostIdAndImageIndex = (
  url: string,
): {
  postId: string;
  imageIndex: string;
} => {
  const regex = /\/p\/([A-Za-z0-9-_]+)\/\?img_index=(\d+)/;
  const match = url.match(regex);
  console.log({ match, url });
  if (match) {
    const postID = match[1];
    const imageIndex = match[2];

    console.log({ postID, imageIndex });
    return {
      postId: postID ?? "P",
      imageIndex: imageIndex ?? "(0)",
    };
  } else {
    return {
      postId: "",
      imageIndex: "",
    };
  }
};

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}
