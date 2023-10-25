import { cronTrigger, eventTrigger } from "@trigger.dev/sdk";

import { fetchImageUrls } from "@gramflow/db/instagramHelper";

import { client } from "~/trigger";
import { prisma } from "../lib/prismaClient";

// Your first job
// This Job will be triggered by an event, log a joke to the console, and then wait 5 seconds before logging the punchline
client.defineJob({
  // This is the unique identifier for your Job, it must be unique across all Jobs in your project
  id: "instagram-photo-refresh",
  name: "Insta Photo Refresh",
  version: "0.0.1",
  enabled: false,
  // This is triggered by an event using eventTrigger. You can also trigger Jobs with webhooks, on schedules, and more: https://trigger.dev/docs/documentation/concepts/triggers/introduction
  trigger: cronTrigger({
    cron: "0 0 */3 * *",
  }),
  run: async (_, io, ctx) => {
    // fetch all the orders and update the images by refetching the instagram images
    //get 10 orders at a time and update the images and then move to the next 10
    // get orders four days old atleast
    const orders = await prisma.orders.findMany({
      where: {
        created_at: {
          lte: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
        },
      },
    });
    console.log(`Found ${orders.length} orders!`);
    for (const order of orders) {
      const mediaUrls = await fetchImageUrls(order.instagram_post_urls);
      console.log({ mediaUrls });
      //replace the images with the new images
      await prisma.orders.update({
        where: {
          id: order.id,
        },
        data: {
          images: mediaUrls,
        },
      });
      await io.logger.info(`Updated order ${order.id} with new images`);
    }
    return { status: "success" };
  },
});
