import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    //prisma
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),

    //upstash
    UPSTASH_URL: z.string(),
    UPSTASH_TOKEN: z.string(),

    //cloudlfare
    CF_ACCESS_KEY_ID: z.string(),
    CF_SECRET_ACCESS_KEY: z.string(),
    CF_ACCOUNT_ID: z.string(),
    CF_BUCKET_NAME: z.string(),
    CF_IMAGES_BUCKET_NAME: z.string(),
    CF_FILES_BUCKET_NAME: z.string(),

    //clerk
    CLERK_DEV_JWT: z.string(),
    CLERK_PROD_JWT: z.string(),
    CLERK_SECRET_KEY: z.string(),

    //resend
    RESEND_API_KEY: z.string(),
    RESEND_DOMAIN: z.string(),

    //instagram
    INSTAGRAM_TOKEN: z.string(),

    //supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_API_KEY: z.string(),

    //delivery
    DELHIVERY_API_KEY: z.string(),

    //misc
    ENV: z.string(),

    //slack
    SLACK_TOKEN: z.string(),
    SLACK_WEBHOOK_URL_ACCEPTED: z.string().url(),
    SLACK_WEBHOOK_URL_CREATED: z.string().url(),
    SLACK_WEBHOOK_URL_CSV_FILE: z.string().url(),

    //trigger
    TRIGGER_API_KEY: z.string(),
    TRIGGER_API_URL: z.string().url(),
    TRIGGER_ID: z.string(),
    TRIGGER_SUPABASE_ID: z.string(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    //clerk
    CLERK_PROD_JWT: process.env.CLERK_PROD_JWT,
    CLERK_DEV_JWT: process.env.CLERK_DEV_JWT,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,

    //prisma
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,

    //supabase
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,

    //cloudflare
    CF_FILES_BUCKET_NAME: process.env.CF_FILES_BUCKET_NAME,
    CF_ACCESS_KEY_ID: process.env.CF_ACCESS_KEY_ID,
    CF_SECRET_ACCESS_KEY: process.env.CF_SECRET_ACCESS_KEY,
    CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    CF_BUCKET_NAME: process.env.CF_BUCKET_NAME,
    CF_IMAGES_BUCKET_NAME: process.env.CF_IMAGES_BUCKET_NAME,

    //instagram
    INSTAGRAM_TOKEN: process.env.INSTAGRAM_TOKEN,

    //resend
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_DOMAIN: process.env.RESEND_DOMAIN,

    //delhivery
    DELHIVERY_API_KEY: process.env.DELHIVERY_API_KEY,

    //upstack
    UPSTASH_URL: process.env.UPSTASH_URL,
    UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,

    //node
    ENV: process.env.ENV,

    //slack
    SLACK_TOKEN: process.env.SLACK_TOKEN,
    SLACK_WEBHOOK_URL_ACCEPTED: process.env.SLACK_WEBHOOK_URL_ACCEPTED,
    SLACK_WEBHOOK_URL_CREATED: process.env.SLACK_WEBHOOK_URL_CREATED,
    SLACK_WEBHOOK_URL_CSV_FILE: process.env.SLACK_WEBHOOK_URL_CSV_FILE,

    //trigger
    TRIGGER_API_KEY: process.env.TRIGGER_API_KEY,
    TRIGGER_API_URL: process.env.TRIGGER_API_URL,
    TRIGGER_ID: process.env.TRIGGER_ID,
    TRIGGER_SUPABASE_ID: process.env.TRIGGER_SUPABASE_ID,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
