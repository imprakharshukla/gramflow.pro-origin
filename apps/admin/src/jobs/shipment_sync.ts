import { cronTrigger } from "@trigger.dev/sdk";
import { z } from "zod";

import { Status } from "@gramflow/db";
import { OrdersModel } from "@gramflow/db/prisma/zod";

import { updateStatusFromDelhivery } from "~/app/api/ship/route";
import { client } from "~/trigger";
import { prisma } from "../lib/prismaClient";

client.defineJob({
  id: "shipment-auto-sync",
  name: "Shipment Sync",
  version: "0.0.1",
  enabled: true,

  trigger: cronTrigger({
    cron: "*/6 * * * *",
  }),
  run: async (_, io, ctx) => {
    await io.logger.info(
      `Starting to Sync orders at ${new Date().toLocaleString()}`,
    );

    const orders: z.infer<typeof OrdersModel>[] = await io.runTask(
      "db-order-fetch",
      async () => {
        return await prisma.orders.findMany({
          where: {
            NOT: {
              status: {
                in: [
                  Status.ACCEPTED,
                  Status.CANCELLED,
                  Status.DELIVERED,
                  Status.HOLD,
                  Status.PENDING,
                ],
              },
            },
          },
          orderBy: {
            created_at: "asc",
          },
        });
      },
      {
        name: "Fetching orders from database.",
        icon: "box",
      },
    );
    await io.logger.info(
      `Trying to Sync ${orders.length} orders at ${new Date()}`,
    );
    // now we will try to update all the orders with the shipping status after dividing them into chunks of 50
    const chunkSize = 50;
    const chunkedOrders = [];
    for (let i = 0; i < orders.length; i += chunkSize) {
      chunkedOrders.push(orders.slice(i, i + chunkSize));
    }
    console.log({ chunkedOrders });

    for (let index = 0; index < chunkedOrders.length; index++) {
      const chunk = chunkedOrders[index];
      await io.runTask(
        `Syncing Chunk ${index}`,
        async () => {
          await io.logger.info(
            `Processing chunk of ${chunk.length} orders at ${new Date()}`,
          );
          const orders = chunk.map((order: z.infer<typeof OrdersModel>) => ({
            id: order.id,
            status: order.status,
          }));
          const shippingRequest = await updateStatusFromDelhivery(orders);
          await io.logger.info(
            `Got response from delhivery for ${
              chunk.length
            } orders at ${new Date()}`,
          );
        },
        {
          name: `Shipment Syncing for orders ${chunk[0].id} to ${
            chunk[chunk.length - 1].id
          }`,
          icon: "box",
        },
      );
    }
    await io.logger.info(`Synced ${orders.length} orders at ${new Date()}`);
    return {
      success: true,
    };
  },
});
