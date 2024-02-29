import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const analyticsContract = c.router({
  getRevenueAnalyticsOverTimeAnalytics: {
    description: "Get total sales analytics over time",
    method: "GET",
    path: "/analytics/time/revenue",
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    responses: {
      200: z.object({
        total: z.number(),
        data: z.array(
          z.object({
            date: z.string(),
            total: z.number(),
          }),
        ),
      }),
    },
    summary: "Get total sales analytics over time",
  },
  getNumberOfOrdersOverTimeAnalytics: {
    description: "Get number of orders over time",
    method: "GET",
    path: "/analytics/time/orders",
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    responses: {
      200: z.object({
        total: z.number(),
        data: z.array(
          z.object({
            date: z.string(),
            total: z.number(),
          }),
        ),
      }),
    },
    summary: "Get number of orders over time",
  },
  getTopStatesAndCitiesAnalytics: {
    description: "Get top states and cities",
    method: "GET",
    path: "/analytics/top/geo",
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    responses: {
      200: z.object({
        states: z.array(
          z.object({
            name: z.string(),
            value: z.number(),
          }),
        ),
        cities: z.array(
          z.object({
            name: z.string(),
            value: z.number(),
          }),
        ),
      }),
    },
    summary: "Get top states and cities",
  },
  getNumberOfCustomersOverTimeAnalytics: {
    description: "Get number of customers over time",

    method: "GET",
    path: "/analytics/time/customer",
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    responses: {
      200: z.object({
        total: z.number(),
        data: z.array(
          z.object({
            date: z.string(),
            total: z.number(),
          }),
        ),
      }),
    },
    summary: "Get number of customers over time",
  },
  getTopCustomersAnalytics: {
    description: "Get top customers",
    method: "GET",
    path: "/analytics/top/customer",
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    responses: {
      200: z.array(
        z.object({
          name: z.string(),
          value: z.number(),
        }),
      ),
    },
    summary: "Get top customers",
  },
});
