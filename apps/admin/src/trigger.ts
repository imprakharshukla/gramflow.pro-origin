import { TriggerClient } from "@trigger.dev/sdk";
import { env } from "./env.mjs";

export const client = new TriggerClient({
  id: env.TRIGGER_ID ?? "",
  apiKey: env.TRIGGER_API_KEY,
  apiUrl: env.TRIGGER_API_URL,
  ioLogLocalEnabled: true,
  //enable this is if you want even more logs
  verbose: false,
});
