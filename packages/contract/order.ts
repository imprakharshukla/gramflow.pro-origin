import { initContract } from "@ts-rest/core";
import { z } from "zod";

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
  updateOrders: {
    method: "PUT",
    path: "/order",
    responses: {
      200: z.string(),
      400: z.string(),
    },
    body: z.object({
      update: OrdersModel.partial().omit({ id: true }),
      order_ids: z.string(),
    }),
    summary: "Update an order",
  },
  deleteOrders: {
    method: "DELETE",
    path: "/order",

    responses: {
      200: z.string(),
    },
    query: z.object({
      order_ids: z.string(),
    }),
    // setting body to empty object because ts-rest forces it to be present for some reason, see issue https://github.com/ts-rest/ts-rest/issues/307
    body: z.object({}),
    summary: "Delete an order",
  },
  mergeOrders: {
    method: "POST",
    path: "/order/merge",
    responses: {
      200: z.string(),
      400: z.string(),
    },
    body: z.object({
      order_ids: z.string(),
    }),
    summary: "Merge orders",
  },
  getOrders: {
    method: "GET",
    path: "/order",
    responses: {
      200: z.object({
        count: z.number(),
        orders: OrdersModel.array(),
      }),
    },
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      page: z.string().optional(),
      pageSize: z.string().optional(),
      searchTerm: z.string().optional(),
    }),
    summary: "Get all orders",
  },
});
