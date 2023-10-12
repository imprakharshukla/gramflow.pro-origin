import { cronTrigger } from "@trigger.dev/sdk";

import { updateStatusFromDelhivery } from "~/app/api/ship/route";
import { client } from "~/trigger";
import { prisma } from "../lib/prismaClient";


client.defineJob({
  id: "shipment-sync",
  name: "Delhivery Sync",
  version: "0.0.1",
  trigger: cronTrigger({
    cron: "*/6 * * * *",
  }),
  run: async (_, io, ctx) => {
    await io.logger.info(
      `Starting to Sync orders at ${new Date().toLocaleString()}`,
    );
    const orders = await prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    });
    await io.logger.info(
      `Trying to Sync ${orders.length} orders at ${new Date()}`,
    );
    // now we will try to update all the orders with the shipping status after dividing them into chunks of 50
    const chunkSize = 50;
    const chunkedOrders = [];
    for (let i = 0; i < orders.length; i += chunkSize) {
      chunkedOrders.push(orders.slice(i, i + chunkSize));
    }
    await io.logger.info(
      `Chunked ${chunkedOrders.length} orders at ${new Date()}`,
    );
    console.log({ chunkedOrders });
    for (const chunk of chunkedOrders) {
      const order_ids = chunk.map((order) => order.id);
      console.log({ order_ids });
      const shippingRequest = await updateStatusFromDelhivery(order_ids);
      console.log({ shippingRequest });
    }
    await io.logger.info(`Synced ${orders.length} orders at ${new Date()}`);
    return {
      success: true,
    };
  },
});
