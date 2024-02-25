import { Response as FetchResponse } from "node-fetch";
import { z } from "zod";

import { Orders, Users } from "@gramflow/db";
import { CompleteOrders, OrdersModel } from "@gramflow/db/prisma/zod";

import {
  DelhiveryDeliveryCostRequestSchema,
  DelhiveryPackageCreationResponseSchema,
  DelhiveryPickupRequestSchema,
  DelhiveryPickupResponseSchema,
} from "../api/schema/delhivery";

type DelhiveryPickupResponse = z.infer<typeof DelhiveryPickupResponseSchema>;
export interface ShippingService {
  createShipmemt(
    orders: (Orders & { user: Users | null })[],
  ): Promise<z.infer<typeof DelhiveryPackageCreationResponseSchema>>;
  createPickup(
    orders: z.infer<typeof DelhiveryPickupRequestSchema>,
  ): Promise<DelhiveryPickupResponse>;
  getPickup(
    date: string,
  ): Promise<z.infer<typeof DelhiveryPickupResponseSchema> | null>;
  calculateShippingCost(
    orders: z.infer<typeof DelhiveryDeliveryCostRequestSchema>,
  ): Promise<number>;
}
