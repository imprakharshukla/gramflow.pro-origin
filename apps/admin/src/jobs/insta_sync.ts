import { intervalTrigger } from "@trigger.dev/sdk";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { AppConfig } from "@acme/utils";

import { env } from "~/env.mjs";
import { client } from "~/trigger";

const instagramResponseSchema = z.object({
  media_count: z.number(),
  id: z.string(),
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
      const req = await fetch(
        `https://graph.instagram.com/v11.0/me?fields=media_count,username&access_token=${env.INSTAGRAM_TOKEN}`,
      );
      if (!req.ok) {
        return { status: "error" };
      }
      const data = (await req.json()) as z.infer<
        typeof instagramResponseSchema
      >;
      console.log({ data });
      const validatedData = instagramResponseSchema.parse(data);
      await io.logger.info(`Total posts From Instagram: ${data.media_count}`);

      const totalPosts = await kv.get<number>("total_posts");
      await io.logger.info(`Total posts From KV: ${totalPosts}`);

      if (totalPosts && totalPosts < validatedData.media_count) {
        const diff = validatedData.media_count - totalPosts;
        await io.logger.info(`Difference in posts: ${diff}`);
        await fetch(`${AppConfig.BaseAdminUrl}/api/instagram?count=${diff}`, {
          headers: {
            Authorization: `Bearer ${
              env.ENV === "dev" ? env.CLERK_DEV_JWT : env.CLERK_PROD_JWT
            }`,
          },
        });
      }
      await kv.set("total_posts", validatedData.media_count);
      return { status: "success" };
    } catch (e) {
      await io.logger.error(
        `Error while syncing instagram posts: ${JSON.stringify(e)}`,
      );
      return { status: "error" };
    }
  },
});
