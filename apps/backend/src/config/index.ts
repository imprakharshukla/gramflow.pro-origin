import { cleanEnv, email, json, str } from "envalid";

export const env = cleanEnv(process.env, {
  INSTAGRAM_TOKEN: str(),
  CF_SECRET_ACCESS_KEY: str(),
  CF_ACCOUNT_ID: str(),
  CF_ACCESS_KEY_ID: str(),
  UPSTASH_URL: str(),
  UPSTASH_TOKEN: str(),
  DATABASE_URL: str(),
  RESEND_DOMAIN: str(),
  NEXTAUTH_SECRET: str(),
  JWT_TOKEN_SECRET: str(),
  RESEND_API_KEY: str(),
  NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
  DELHIVERY_API_KEY: str(),
});

export default env;