import { AppRouter, initContract } from "@ts-rest/core";

import { analyticsContract } from "./analytics";
import { docContract } from "./document";
import { orderContract } from "./order";
import { postContract } from "./post";
import { shipContract } from "./ship";

export * from "./order";
export * from "./ship";
export * from "./document";
export * from "./post";
export * from "./analytics";

const c = initContract();

export const superContract = c.router({
  document: docContract,
  order: orderContract,
  ship: shipContract,
  post: postContract,
  analytics: analyticsContract,
});
export enum SearchParam {
  order_id,
  user_id,
  instagram_id,
  name,
  email,
  phone,
  city,
  state,
  bundle
}
export { type AppRouter };
