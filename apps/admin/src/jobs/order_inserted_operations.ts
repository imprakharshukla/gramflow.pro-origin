import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SupabaseManagement } from "@trigger.dev/supabase";

import { AppConfig } from "@acme/utils";

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
  id: "order-inserted-operations",
  name: "Order Inserted Operations",
  enabled: true,
  version: "1.0.1",
  trigger: supabaseTriggers.onInserted({
    schema: "public",
    table: "Orders",
  }),
  run: async (payload, io, ctx) => {
    if (!payload.record.id) {
      await io.logger.error("Order ID not available!");
      return;
    }

    try {
      const linkArray = payload.record.instagram_post_urls ?? [];
      let total = 0;
      for (const link of linkArray) {
        const { searchParams } = new URL(link);
        const price = searchParams.get("price");
        total += parseInt(price ?? "0");
      }
      await io.logger.info(
        `The total for order ${payload.record.id} is ${total}`,
      );
      if (total > 0) {
        await prisma.orders.update({
          where: {
            id: payload.record.id,
          },
          data: {
            price: total,
          },
        });
      }
      if (!payload.record.images) {
        await io.logger.info(
          `No images found for order ${payload.record.id} in database.`,
        );
        return { status: "success" };
      }
      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
        },
      });

      const image_urls = payload.record.images;

      if (image_urls) {
        const newS3Urls = [...image_urls];
        for (const [index, url] of image_urls.entries()) {
          // Check if the image URL is from Instagram CDN
          if (!url.includes("cdninstagram.com")) {
            continue;
          }
          // This line extracts the file name from the URL by splitting the URL string at each "/" character and then taking the last element of the resulting array.
          const fileName = payload.record.id + "_" + index.toString() + ".jpg";
          console.log({ fileName });
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const putObjectCommand = new PutObjectCommand({
            Bucket: env.CF_IMAGES_BUCKET_NAME,
            Key: fileName,
            Body: Buffer.from(buffer),
          });
          await S3.send(putObjectCommand);
          await io.logger.info(
            `Successfully uploaded image ${index} for order ${payload.record.id} to S3`,
          );
          newS3Urls[index] = `${AppConfig.ImageBaseUrl}/${fileName}`;
        }
        await prisma.orders.update({
          where: {
            id: payload.record.id,
          },
          data: {
            images: newS3Urls,
          },
        });
        await io.logger.info(
          `Successfully updated images for order ${payload.record.id} in database.`,
        );
      }
      return { status: "success" };
    } catch (e) {
      await io.logger.error(
        `Error uploading images for order ${payload.record.id} to S3: ${e}`,
      );
      return { status: "failed" };
    }
  },
});
