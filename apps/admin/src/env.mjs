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
    SHADOW_DATABASE_URL: z.string().url(),
    //cloudlfare
    CF_ACCESS_KEY_ID: z.string(),
    CF_SECRET_ACCESS_KEY: z.string(),
    CF_ACCOUNT_ID: z.string(),
    CF_BUCKET_NAME: z.string(),
    CF_IMAGES_BUCKET_NAME: z.string(),
    CF_FILES_BUCKET_NAME: z.string(),
    CLERK_DEV_JWT: z.string(),
    CLERK_PROD_JWT: z.string(),
    RESEND_API_KEY: z.string(),

    //instagram
    INSTAGRAM_TOKEN: z.string(),

    //clerk
    CLERK_SECRET_KEY: z.string(),

    //supabase
    SUPABASE_URL: z.string().url(),

    //delivery
    DELHIVERY_API_KEY: z.string(),

    //mailgun
    MAILGUN_API_KEY: z.string(),
    MAILGUN_DOMAIN: z.string(),

    //misc
    ENV: z.string(),
    PERSONAL_API_KEY: z.string(),

    //slack
    SLACK_TOKEN: z.string(),
    SLACK_WEBHOOK_URL_ACCEPTED: z.string().url(),
    SLACK_WEBHOOK_URL_CREATED: z.string().url(),
    SLACK_WEBHOOK_URL_CSV_FILE: z.string().url(),

    //telegram
    TELEGRAM_API_KEY: z.string(),
    TELEGRAM_CHAT_ID: z.string(),

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
    CLERK_PROD_JWT: process.env.CLERK_PROD_JWT,
    CLERK_DEV_JWT: process.env.CLERK_DEV_JWT,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
    CF_FILES_BUCKET_NAME: process.env.CF_FILES_BUCKET_NAME,
    CF_ACCESS_KEY_ID: process.env.CF_ACCESS_KEY_ID,
    CF_SECRET_ACCESS_KEY: process.env.CF_SECRET_ACCESS_KEY,
    CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    CF_BUCKET_NAME: process.env.CF_BUCKET_NAME,

    INSTAGRAM_TOKEN: process.env.INSTAGRAM_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,

    SUPABASE_URL: process.env.SUPABASE_URL,

    DELHIVERY_API_KEY: process.env.DELHIVERY_API_KEY,

    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,

    ENV: process.env.ENV,
    PERSONAL_API_KEY: process.env.PERSONAL_API_KEY,

    SLACK_TOKEN: process.env.SLACK_TOKEN,
    SLACK_WEBHOOK_URL_ACCEPTED: process.env.SLACK_WEBHOOK_URL_ACCEPTED,

    SLACK_WEBHOOK_URL_CREATED: process.env.SLACK_WEBHOOK_URL_CREATED,
    SLACK_WEBHOOK_URL_CSV_FILE: process.env.SLACK_WEBHOOK_URL_CSV_FILE,

    TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,

    TRIGGER_API_KEY: process.env.TRIGGER_API_KEY,
    TRIGGER_API_URL: process.env.TRIGGER_API_URL,
    TRIGGER_ID: process.env.TRIGGER_ID,
    TRIGGER_SUPABASE_ID: process.env.TRIGGER_SUPABASE_ID,
    CF_IMAGES_BUCKET_NAME: process.env.CF_IMAGES_BUCKET_NAME,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
