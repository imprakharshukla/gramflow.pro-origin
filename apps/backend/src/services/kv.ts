import { Redis } from "@upstash/redis";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

import { env } from "../config";

const redis = new Redis({
  url: env.UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
});

@Service()
export class R2Service {
  constructor(@Inject("logger") private logger: Logger) {}
  getValueFromKV = async <T>({
    key,
    defaultValue,
  }: {
    key: string;
    defaultValue: T;
  }): Promise<T | null> => {
    const value = await redis.get<T>(key);
    return value ?? defaultValue;
  };
}
