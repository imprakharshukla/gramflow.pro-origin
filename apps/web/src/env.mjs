import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    SHADOW_DATABASE_URL: z.string().url(),

    //misc
    ENV: z.string(),
    PERSONAL_API_KEY: z.string(),

    //mailgun
    MAILGUN_API_KEY: z.string(),
    MAILGUN_DOMAIN: z.string(),
    RESEND_API_KEY: z.string(),
    RESEND_DOMAIN: z.string(),

    //instagram
    INSTAGRAM_TOKEN: z.string(),

    //slack
    SLACK_TOKEN: z.string(),
    SLACK_WEBHOOK_URL_ACCEPTED: z.string().url(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,

    //misc
    ENV: process.env.ENV,
    PERSONAL_API_KEY: process.env.PERSONAL_API_KEY,

    //mailgun
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_DOMAIN: process.env.RESEND_DOMAIN,

    //instagram
    INSTAGRAM_TOKEN: process.env.INSTAGRAM_TOKEN,
    //slack
    SLACK_TOKEN: process.env.SLACK_TOKEN,
    SLACK_WEBHOOK_URL_ACCEPTED: process.env.SLACK_WEBHOOK_URL_ACCEPTED,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
