import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { isTriggerError } from "@trigger.dev/sdk";
import { Slack } from "@trigger.dev/slack";
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
const slack = new Slack({
  id: "slack",
});
client.defineJob({
  id: "s3-post-sync",
  name: "S3 Post Sync",
  enabled: true,
  version: "1.0.0",
  trigger: supabaseTriggers.onInserted({
    schema: "public",
    table: "Posts",
  }),
  integrations: {
    slack,
  },
  run: async (payload, io, ctx) => {
    try {
      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CF_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.CF_SECRET_ACCESS_KEY ?? "",
        },
      });
      const image_urls = payload.record.slides;
      if (image_urls) {
        const newS3Urls = [];

        for (const [index, url] of image_urls.entries()) {
          // This line extracts the file name from the URL by splitting the URL string at each "/" character and then taking the last element of the resulting array.
          const fileName = payload.record.id + "_" + index.toString() + ".jpg";

          //create a task, once this succeeds it will not be called again
          const result = await io.runTask(
            fileName,
            async () => {
              const response = await fetch(url);
              const buffer = await response.arrayBuffer();
              const putObjectCommand = new PutObjectCommand({
                Bucket: env.CF_IMAGES_BUCKET_NAME,
                Key: fileName,
                Body: buffer,
              });
              await S3.send(putObjectCommand);

              return {
                url: `${AppConfig.ImageBaseUrl}/${fileName}`,
              };
            },
            { name: `Upload image to S3 ${fileName}` },
          );

          await io.logger.info(
            `Successfully uploaded image ${index} for post ${payload.record.id} to S3`,
          );

          newS3Urls.push(result.url);
        }

        await io.logger.info(newS3Urls.join(","));

        //update the database
        await prisma.posts.update({
          where: {
            id: payload.record.id,
          },
          data: {
            slides: newS3Urls,
          },
        });
        await io.slack.postMessage("post message", {
          channel: "C061C3H2GV6",
          text: `Instagram post ${payload.record.post_link} is now synced and ready for taking orders ✅`,
        });

        await io.logger.info(
          `Successfully updated images for post ${payload.record.id} in database.`,
        );
      }
      return { status: "success" };
    } catch (error) {
      if (isTriggerError(error)) throw error;
      await io.logger.error(
        `Error uploading images for post ${payload.record.id} to S3: ${error}`,
      );
      return { status: "failed" };
    }
  },
});
