import { initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";

import { shipContract } from "@gramflow/contract";

import DelhiveryService from "../../services/delhivery";
import OrderService from "../../services/order";
import { chunkData } from "../../utils/dataUtils";

const NO_OF_ORDERS_PER_SHIPMENT = 50;

export default (server: ReturnType<typeof initServer>) => {
  const logger: Logger = Container.get("logger");
  return server.router(shipContract, {
    createShipment: async ({ body }) => {
      const orderServiceInstance = Container.get(OrderService);

      const order_ids = body.order_id.split(",");
      const orders = await orderServiceInstance.getOrdersById(order_ids);

      logger.debug("Calling Create-Ship endpoint with body: %o", body.order_id);
      const delhiveryServiceInstance = Container.get(DelhiveryService);

      const chunkedOrders = chunkData(orders, NO_OF_ORDERS_PER_SHIPMENT);

      for (const [index, orders] of chunkedOrders.entries()) {
        logger.info(`Creating shipment for chunk ${index + 1}`);
        await delhiveryServiceInstance.createShipmemt(orders);
        logger.info(`Shipment created for chunk ${index + 1}`);
      }
      return {
        status: 200,
        body: {
          response: "OK",
        },
      };
    },
    createPickup: async ({ body }) => {
      const delhiveryServiceInstance = Container.get(DelhiveryService);
      logger.debug("Calling Create-Pickup endpoint with body: %o", body);

      const pickupResponse = await delhiveryServiceInstance.createPickup(body);
      return {
        status: 200,
        body: pickupResponse,
      };
    },
    calculateShippingCost: async ({ query }) => {
      const delhiveryServiceInstance = Container.get(DelhiveryService);
      logger.debug("Calling Calculate-Shipping-Cost endpoint with query: %o", query);
      const cost = await delhiveryServiceInstance.calculateShippingCost(query);
      return {
        status: 200,
        body: cost,
      };
    },
    getPickup: async ({ query }) => {
      const delhiveryServiceInstance = Container.get(DelhiveryService);
      logger.debug("Calling Get-Pickup endpoint with query: %o", query);
      const pickups = await delhiveryServiceInstance.getPickup(query.date);
      return {
        status: 200,
        body: pickups,
      };
    },
  });
};
