import { AppRouter, initContract } from "@ts-rest/core";

import { docContract } from "./document";
import { orderContract } from "./order";
import { postContract } from "./post";
import { shipContract } from "./ship";

export * from "./order";
export * from "./ship";
export * from "./document";
export * from "./post";

const c = initContract();

export const superContract = c.router({
  document: docContract,
  order: orderContract,
  ship: shipContract,
  post: postContract,
});

export { type AppRouter };
