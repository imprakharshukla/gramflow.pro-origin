import { initContract } from "@ts-rest/core";

import { docContract } from "./document";
import { orderContract } from "./order";
import { shipContract } from "./ship";

export * from "./order";
export * from "./ship";
export * from "./document";

const c = initContract();

export const superContract = c.router({
  document: docContract,
  order: orderContract,
  ship: shipContract,
});
