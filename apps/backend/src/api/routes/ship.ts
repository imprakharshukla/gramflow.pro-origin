import { initServer } from "@ts-rest/express";
import { addDays } from "date-fns";
import Container from "typedi";
import { Logger } from "winston";

import { shipContract } from "@gramflow/contract";
import { Status } from "@gramflow/db";

import DelhiveryService from "../../services/delhivery";
import OrderService from "../../services/order";
import { chunkData } from "../../utils/dataUtils";

const NO_OF_ORDERS_PER_SHIPMENT = 50;

export default (server: ReturnType<typeof initServer>) => {
  const logger: Logger = Container.get("logger");
  return server.router(shipContract, {
    syncShipments: async ({ body }) => {
      logger.debug("Calling Sync-Shipments endpoint with body: %o", body);
      const orderServiceInstance = Container.get(OrderService);
      if (body.order_ids) {
        const orders = await orderServiceInstance.getOrdersByStatus({
          order_ids: body.order_ids.split(","),
          statuses: [Status.SHIPPED, Status.MANIFESTED, Status.ACCEPTED],
        });
        logger.debug(JSON.stringify(orders));
        const delhiveryServiceInstance = Container.get(DelhiveryService);
        await delhiveryServiceInstance.syncOrdersWithDelhivery(orders);
      } else {
        const orders = await orderServiceInstance.getOrdersByStatus({
          statuses: [Status.SHIPPED, Status.MANIFESTED],
          // only fetch the orders made within 3 weeks
          from: addDays(new Date(), 21).valueOf(),
          to: new Date().valueOf(),
        });
        logger.debug(JSON.stringify(orders));
        const delhiveryServiceInstance = Container.get(DelhiveryService);
        await delhiveryServiceInstance.syncOrdersWithDelhivery(orders);
      }

      return {
        status: 200,
        body: {
          response: "OK",
        },
      };
    },
    createShipment: async ({ body }) => {
      const orderServiceInstance = Container.get(OrderService);

      const order_ids = body.order_ids.split(",");
      const orders = await orderServiceInstance.getOrdersById(order_ids);

      logger.debug(
        "Calling Create-Ship endpoint with body: %o",
        body.order_ids,
      );
      const delhiveryServiceInstance = Container.get(DelhiveryService);

      const chunkedOrders = chunkData(orders, NO_OF_ORDERS_PER_SHIPMENT);

      console.log({
        orders: JSON.stringify(chunkedOrders),
      });

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
      logger.debug(
        "Calling Calculate-Shipping-Cost endpoint with query: %o",
        query,
      );
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
