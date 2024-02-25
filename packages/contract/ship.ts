import { initContract } from "@ts-rest/core";
import { string, z } from "zod";

import {
  DelhiveryDeliveryCostRequestSchema,
  DelhiveryPickupRequestSchema,
  DelhiveryPickupResponseSchema,
} from "../../apps/backend/src/api/schema/delhivery";
const c = initContract();

export const shipContract = c.router({
  createShipment: {
    method: "POST",
    path: "/shipment",
    responses: {
      200: z.object({
        response: z.string(),
      }),
    },
    body: z.object({
      order_id: z.string(),
    }),
    summary: "Create a shipment",
  },
  createPickup: {
    method: "POST",
    path: "/pickup",
    responses: {
      200: DelhiveryPickupResponseSchema,
    },
    body: DelhiveryPickupRequestSchema,
    summary: "Create a pickup",
  },
  calculateShippingCost: {
    method: "GET",
    path: "/shipment/cost",
    responses: {
      200: z.number(),
    },
    query: DelhiveryDeliveryCostRequestSchema,
    summary: "Calculate shipping cost",
  },
  getPickup: {
    method: "GET",
    path: "/pickup",
    responses: {
      200: DelhiveryPickupResponseSchema.nullable(),
    },
    query: z.object({
        date: string(),
    }),
    summary: "Get all pickups",
  },
});
