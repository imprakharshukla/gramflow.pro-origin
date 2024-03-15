import { TsRestRequest, initServer } from "@ts-rest/express";
import Container from "typedi";
import { Logger } from "winston";

import { analyticsContract } from "@gramflow/contract/analytics";

import AnalyticsService from "../../services/analytics";
import { adminOnlyMiddleware } from "../middleware/auth";

export default (server: ReturnType<typeof initServer>) => {
  const logger: Logger = Container.get("logger");
  const analyticsServiceInstance: AnalyticsService =
    Container.get(AnalyticsService);

  return server.router(analyticsContract, {
    getTopStatesAndCitiesAnalytics: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof analyticsContract.getTopStatesAndCitiesAnalytics>>
        ],
      handler: async ({ }) => {
        logger.debug("Calling Get-Top-States-And-Cities endpoint");
        const res =
          await analyticsServiceInstance.getTopStatesAndCitiesAnalytics();
        return {
          status: 200,
          body: res,
        }
      },
    },

    getRevenueAnalyticsOverTimeAnalytics: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof analyticsContract.getRevenueAnalyticsOverTimeAnalytics>>
        ],
      handler: async ({ query }) => {
        logger.debug(
          "Calling Get-Total-Sales-Analytics-Over-Time endpoint with query: %o",
          query,
        );
        const result =
          await analyticsServiceInstance.getRevenueAnalyticsOverTimeAnalytics({
            start: new Date(Number(query.start)).toISOString(),
            end: new Date(Number(query.end)).toISOString(),
          });
        return {
          status: 200,
          body: result,
        };
      },
    },
    getNumberOfOrdersOverTimeAnalytics: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof analyticsContract.getNumberOfOrdersOverTimeAnalytics>>
        ],
      handler: async ({ query }) => {
        logger.debug(
          "Calling Get-Number-Of-Orders-Over-Time endpoint with query: %o",
          query,
        );
        const res =
          await analyticsServiceInstance.getNumberOfOrdersOverTimeAnalytics({
            start: new Date(Number(query.start)).toISOString(),
            end: new Date(Number(query.end)).toISOString(),
          });
        return {
          status: 200,
          body: res,
        };
      },
    },
    getNumberOfCustomersOverTimeAnalytics: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof analyticsContract.getNumberOfCustomersOverTimeAnalytics>>
        ],
      handler: async ({ query }) => {
        logger.debug(
          "Calling Get-Number-Of-Customers-Over-Time endpoint with query: %o",
          query,
        );

        const res =
          await analyticsServiceInstance.getNumberOfCustomersOverTimeAnalytics({
            start: new Date(Number(query.start)).toISOString(),
            end: new Date(Number(query.end)).toISOString(),
          });
        return {
          status: 200,
          body: res,
        };
      }
    },
    getTopCustomersAnalytics: {
      middleware:
        [
          adminOnlyMiddleware<TsRestRequest<typeof analyticsContract.getTopCustomersAnalytics>>
        ],
      handler: async ({ }) => {
        logger.debug("Calling Get-Top-Customers endpoint");
        const res = await analyticsServiceInstance.getTopCustomersAnalytics();
        return {
          status: 200,
          body: res,
        };
      },
    }
  });
};
