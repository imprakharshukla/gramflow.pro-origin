import { cleanEnv, email, json, str } from "envalid";

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
  DELHIVERY_API_KEY: str(),
});

export default env;