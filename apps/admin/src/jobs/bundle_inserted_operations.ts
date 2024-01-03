import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { isTriggerError } from "@trigger.dev/sdk";
import { Slack } from "@trigger.dev/slack";
import { SupabaseManagement } from "@trigger.dev/supabase";

import { AppConfig } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { client } from "~/trigger";
import { type Database } from "../../types/supabase";
import { prisma } from "../lib/prismaClient";

const slack = new Slack({
  id: "slack",
});

// Use OAuth to authenticate with Supabase Management API
const supabaseManagement = new SupabaseManagement({
  id: env.TRIGGER_SUPABASE_ID,
});
const supabaseTriggers = supabaseManagement.db<Database>(env.SUPABASE_URL);

client.defineJob({
  id: "bundle-inserted-operations",
  name: "Bundle Inserted Operations",
  version: "1.0.1",
  trigger: supabaseTriggers.onInserted({
    schema: "public",
    table: "Bundles",
  }),
  integrations: {
    slack,
  },
  run: async (payload, io, ctx) => {
    if (!payload.record.id) {
      await io.logger.error("Bundle ID not available!");
      return;
    }

    try {
      const user = await prisma.users.findUnique({
        where: {
          id: payload.record.user_id,
        },
      });
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
          if (!url.includes("cdninstagram.com") && !url.includes("utfs.io")) {
            continue;
          }
          // This line extracts the file name from the URL by splitting the URL string at each "/" character and then taking the last element of the resulting array.
          await io.runTask(`Uploading file ${index} to S3`, async () => {
            const fileName =
              payload.record.id + "_" + index.toString() + ".jpg";
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
              `Successfully uploaded image ${index} for bundle ${payload.record.id} to S3`,
            );
            newS3Urls[index] = `${AppConfig.ImageBaseUrl}/${fileName}`;
          });
        }
        await io.runTask("Updating Bundle Images", async () => {
          return await prisma.bundles.update({
            where: {
              id: payload.record.id,
            },
            data: {
              images: newS3Urls,
            },
          });
        });
        await io.logger.info(
          `Successfully updated images for bundle ${payload.record.id} in database.`,
        );
      }
      await io.runTask("send-slack-message", async () => {
        await io.slack.postMessage("post message", {
          channel: "C06CB21DLMS",
          text: `New bundle created with id ${payload.record.id} 🎁. \n Here are the details:
          \n Name: ${user.name}
          \n Instagram Username: ${user.instagram_username}
          \n Phone Number: ${user.phone_no}
          \n Email: ${user.email}
          \n Bundle Size: ${payload.record.bundle_size}
          \n Bundle Description: ${payload.record.bundle_description}
          \n Aesthetics: ${payload.record.aesthetics}
          \n Other Aesthetics: ${payload.record.other_aesthetics}
          \n Fashion Dislikes: ${payload.record.fashion_dislikes}
          \n Link Input: ${payload.record.link_input}
          \n Top Size: ${payload.record.top_size}
          \n Waist: ${payload.record.waist}
          \n Length: ${payload.record.length}
          \n Images: ${payload.record.images}
          \n Created At: ${payload.record.created_at}
          `,
        });
      });
      return { status: "success" };
    } catch (e) {
      await io.logger.error(
        `Error uploading images for bundle ${payload.record.id} to S3: ${e}`,
      );
      if (isTriggerError(e)) throw e;
      return { status: "failed" };
    }
  },
});
