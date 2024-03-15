import { TsRestRequest, TsRestRequestHandler, initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";

import { orderContract } from "@gramflow/contract";
import { InstagramService } from "../../services/instagram";
import OrderService from "../../services/order";
import { R2Service } from "../../services/r2";
import { USER_ROLE } from "@gramflow/db";
import { NextFunction, Response } from "express";

function checkAuthorization<T>(req: T, res: Response, next: NextFunction) {
  console.log("sds")
  const roles = [USER_ROLE.ADMIN.valueOf(), USER_ROLE.SUPER_ADMIN.valueOf()];
  // @ts-ignore
  if (roles.includes(req.auth.role)) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default (server: ReturnType<typeof initServer>) => {
  const logger: Logger = Container.get("logger");

  return server.router(orderContract, {
    createOrder: {
      handler: async ({ body }) => {
        logger.debug("Calling Sign-Up endpoint with body: %o", body);
        const orderServiceInstance = Container.get(OrderService);
        const instagramServiceInstance = Container.get(InstagramService);
        const r2ServiceInstance = Container.get(R2Service);

        const mediaUrls =
          body.images && body.images.length > 0
            ? body.images
            : await instagramServiceInstance.fetchImageUrls(
              body.instagram_post_urls,
            );
        logger.debug("Instagram Media: %o", mediaUrls);

        body.images = mediaUrls;
        const order = await orderServiceInstance.createOrder(body);
        return {
          status: 200,
          body: order,
        };
      }
    },
    updateOrders: {
      middleware: [checkAuthorization<TsRestRequest<typeof orderContract.updateOrders>>],
      handler: async ({ body }) => {
        try {
          const logger: Logger = Container.get("logger");
          logger.debug("Calling Update-Order endpoint with body: %o", body);
          const orderServiceInstance = Container.get(OrderService);
          await orderServiceInstance.updateOrders({
            order_ids: body.order_ids.split(","),
            update: body.update,
          });
          return {
            status: 200,
            body: "OK",
          };
        } catch (e: any) {
          logger.error("Error in updateOrders: %o", e);
          return {
            status: 400,
            body: e.message ? e.message : "Something went wrong!  ",
          };
        }
      }
    },
    mergeOrders: {
      middleware:
        [
          (req: TsRestRequest<typeof orderContract.mergeOrders>, res, next) => {
            const roles = [USER_ROLE.ADMIN.valueOf(), USER_ROLE.SUPER_ADMIN.valueOf(), USER_ROLE.USER.valueOf()]
            // @ts-ignore
            if (roles.includes(req.auth.role)) {
              return next();
            } else {
              return res.status(401).json({ message: "Unauthorized" });
            }
          }
        ],
      handler: async ({ body }) => {
        try {
          const logger: Logger = Container.get("logger");
          logger.debug("Calling Merge-Order endpoint with body: %o", body);
          const orderServiceInstance = Container.get(OrderService);
          await orderServiceInstance.mergeOrders(body.order_ids);
          return {
            status: 200,
            body: "OK",
          };
        } catch (e: any) {
          logger.error("Error in mergeOrders: %o", e);
          return {
            status: 400,
            body: e.message ? e.message : "Something went wrong!  ",
          };
        }
      }
    },
    deleteOrders: {
      middleware:
        [
          (req, res, next) => {
            const roles = [USER_ROLE.ADMIN.valueOf(), USER_ROLE.SUPER_ADMIN.valueOf(), USER_ROLE.USER.valueOf()]
            // @ts-ignore
            if (roles.includes(req.auth.role)) {
              return next();
            } else {
              return res.status(401).json({ message: "Unauthorized" });
            }
          }
        ],
      handler: async ({ query: { order_ids } }) => {
        const logger: Logger = Container.get("logger");
        logger.debug("Calling Delete-Order endpoint with query: %o", order_ids);
        const orderServiceInstance = Container.get(OrderService);
        await orderServiceInstance.deleteOrder(order_ids.split(","));
        return {
          status: 200,
          body: "OK",
        };
      },
    },
    getOrders: {
      middleware:
        [
          checkAuthorization<TsRestRequest<typeof orderContract.getOrders>>
        ],
      handler: async ({ query }) => {
        const logger: Logger = Container.get("logger");
        logger.debug(
          `Calling Get-Orders endpoint with query: ${JSON.stringify(query)}`,
        );
        const orderServiceInstance = Container.get(OrderService);
        const orders = await orderServiceInstance.getOrders(
          Number(query.from),
          Number(query.to),
          Number(query.page),
          Number(query.pageSize),
          query.searchTerm,
        );
        const count = await orderServiceInstance.getOrdersCount(
          Number(query.from),
          Number(query.to),
          query.searchTerm,
        );

        logger.debug("Orders length %o", orders.length);
        logger.debug("Orders count %o", count);

        return {
          status: 200,
          body: {
            orders,
            count: count
          },
        };
      },
    },
  });
};
