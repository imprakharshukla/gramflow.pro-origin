import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { Router } from "express";
import Container from "typedi";
import { Logger } from "winston";

import { orderContract } from "@gramflow/contract";

import OrderService from "../../services/order";


export default (server: ReturnType<typeof initServer>) => {
  return server.router(orderContract, {
    createOrder: async ({ body }) => {
      const logger: Logger = Container.get("logger");
      logger.debug("Calling Sign-Up endpoint with body: %o", body);
      const orderServiceInstance = Container.get(OrderService);
      const order = await orderServiceInstance.createOrder(body);
      return {
        status: 200,
        body: order,
      };
    },
    updateOrder: async ({ body }) => {
      const logger: Logger = Container.get("logger");
      logger.debug("Calling Update-Order endpoint with body: %o", body);
      const orderServiceInstance = Container.get(OrderService);
      const order = await orderServiceInstance.updateOrder(body);
      return {
        status: 200,
        body: order,
      };
    },
    deleteOrder: async ({ query: { id } }) => {
      const logger: Logger = Container.get("logger");
      logger.debug("Calling Delete-Order endpoint with query: %o", id);
      const orderServiceInstance = Container.get(OrderService);
      const orderIds = id.split(",");
      await orderServiceInstance.deleteOrder(orderIds);
      return {
        status: 200,
        body: "OK",
      };
    },
    getOrders: async ({ query }) => {
      const logger: Logger = Container.get("logger");
      logger.debug(
        `Calling Get-Orders endpoint with query: ${JSON.stringify(query)}`,
      );
      const orderServiceInstance = Container.get(OrderService);
      const orders = await orderServiceInstance.getOrders(
        query.from,
        query.to,
        Number(query.page),
        Number(query.pageSize),
        query.searchTerm,
      );
      return {
        status: 200,
        body: orders,
      };
    },
  });
};
