import { intervalTrigger, isTriggerError } from "@trigger.dev/sdk";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { AppConfig } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { client } from "~/trigger";

const instagramResponseSchema = z.object({
  media_count: z.number(),
  id: z.string(),
});

const redis = new Redis({
  url: env.UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
});

client.defineJob({
  id: "instagram-post-sync",
  name: "Insta Posts sync",
  version: "0.0.1",
  enabled: true,
  trigger: intervalTrigger({
    seconds: 60,
  }),
  run: async (_, io, ctx) => {
    try {
      const instagramResponse = await io.runTask(
        "Fetching data from instagram",
        async () => {
          const response = await fetch(
            `https://graph.instagram.com/v11.0/me?fields=media_count,username&access_token=${env.INSTAGRAM_TOKEN}`,
          );
          if (!response.ok) return Error("Instagram response not ok");
          return response.json();
        },
      );

      const validatedData = instagramResponseSchema.parse(instagramResponse);
      await io.logger.info(
        `Total posts From Instagram: ${validatedData.media_count}`,
      );

      const totalPosts = await io.runTask(
        "Fetching data from reddis",
        async () => {
          return await redis.get<number>("total_posts");
        },
      );

      await io.logger.info(`Total posts From KV: ${totalPosts}`);

      if (totalPosts && totalPosts < validatedData.media_count) {
        const diff = validatedData.media_count - totalPosts;
        await io.logger.info(`Difference in posts: ${diff}`);
        await io.runTask(
          `Syncing Posts ${totalPosts} ${validatedData.media_count}`,
          async () => {
            await fetch(
              `${AppConfig.BaseAdminUrl}/api/instagram?count=${diff}`,
              {
                headers: {
                  Authorization: `Bearer ${
                    env.ENV === "dev" ? env.CLERK_DEV_JWT : env.CLERK_PROD_JWT
                  }`,
                },
              },
            );
          },
        );
      }
      await io.runTask("Updating KV", async () => {
        return await redis.set("total_posts", validatedData.media_count);
      });
      return { status: "success" };
    } catch (error) {
      if (isTriggerError(error)) throw error;
      return { status: "error" };
    }
  },
});
