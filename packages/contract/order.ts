import { initContract } from "@ts-rest/core";
import { string, z } from "zod";

import { OrderInputZodSchema } from "../../apps/backend/src/interfaces/IOrder";
import { OrdersModel } from "../db/prisma/zod";

const c = initContract();

export const orderContract = c.router({
  createOrder: {
    method: "POST",
    path: "/order",
    responses: {
      200: OrdersModel.nullable(),
    },
    body: OrderInputZodSchema,
    summary: "Create an order",
  },
  updateOrder: {
    method: "PUT",
    path: "/order",
    responses: {
      200: OrdersModel.nullable(),
    },
    body: OrdersModel.partial().required({
      id: true,
    }),
    summary: "Update an order",
  },
  deleteOrder: {
    method: "DELETE",
    path: "/order",
    responses: {
      200: z.string(),
    },
    query: z.object({
      id: string(),
    }),
    // setting body to empty object because ts-rest forces it to be present for some reason, see issue https://github.com/ts-rest/ts-rest/issues/307
    body: z.object({}),
    summary: "Delete an order",
  },
  getOrders: {
    method: "GET",
    path: "/order",
    responses: {
      200: OrdersModel.array(),
    },
    query: z.object({
      from: string().optional(),
      to: string().optional(),
      page: string().optional(),
      pageSize: string().optional(),
      searchTerm: string().optional(),
    }),
    summary: "Get all orders",
  },
});
