import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SupabaseManagement } from "@trigger.dev/supabase";

import { AppConfig } from "@gramflow/utils";

import { shippingCostResponseSchema } from "~/app/api/cost/route";
import { env } from "~/env.mjs";
import { client } from "~/trigger";
import { type Database } from "../../types/supabase";
import { prisma } from "../lib/prismaClient";

// Use OAuth to authenticate with Supabase Management API
const supabaseManagement = new SupabaseManagement({
  id: env.TRIGGER_SUPABASE_ID,
});

const supabaseTriggers = supabaseManagement.db<Database>(env.SUPABASE_URL);

client.defineJob({
  id: "order-updated-operations",
  name: "Order Updated Operations",
  enabled: true,
  version: "1.0.1",
  trigger: supabaseTriggers.onUpdated({
    schema: "public",
    table: "Orders",
    filter: {
      old_record: {
        user_id: [{ $isNull: true }],
      },
      record: {
        user_id: [{ $isNull: false }],
      },
    },
  }),
  run: async (payload, io, ctx) => {
    try {
      if (!payload.record.id) {
        await io.logger.error("Order ID not available!");
        return;
      }

      const order = payload.record;
      if (!order || !order.user_id) {
        await io.logger.error(`Order ${payload.record.id} not found.`);
        return { status: "failed" };
      }
      const user = await prisma.users.findUnique({
        where: {
          id: order.user_id,
        },
      });
      if (!user) {
        await io.logger.error(
          `Order ${payload.record.id} does not have a user.`,
        );
        return { status: "failed" };
      }
      const { weight } = order;
      if (!weight || weight === "") {
        await io.logger.info(
          `Order ${payload.record.id} does not have dimensions.`,
        );
        return { status: "success" };
      }

      const options = {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${env.DELHIVERY_API_KEY}`,
        },
      };

      const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${user.pincode}&o_pin=${AppConfig.WarehouseDetails.pincode}&cgm=${order.weight}&pt=Pre-paid&cod=0`;

      const response = await fetch(url, options);
      if (!response.ok) {
        console.log("Error while requesting shipping data from Delhivery.", {
          response: JSON.stringify(response),
        });
        await io.logger.error(
          `Error while requesting shipping data from Delhivery.`,
        );
        return { status: "failed" };
      }
      const json = await response.json();
      const validated = shippingCostResponseSchema.parse(json);
      io.logger.info(
        `Updating the shipping cost for order ${payload.record.id} to ${validated[0]?.total_amount}`,
      );
      await prisma.orders.update({
        where: {
          id: payload.record.id,
        },
        data: {
          shipping_cost: validated[0]?.total_amount,
        },
      });
      return { status: "success" };
    } catch (e) {
      await io.logger.error(
        `Error uploading images for order ${payload.record.id} to S3: ${e}`,
      );
      return { status: "failed" };
    }
  },
});
