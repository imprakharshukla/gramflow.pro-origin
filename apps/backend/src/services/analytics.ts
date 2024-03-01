import { randomInt } from "crypto";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

import { db } from "@gramflow/db";

@Service()
export default class AnalyticsService {
  constructor(@Inject("logger") private logger: Logger) {}

  public async getTopCustomersAnalytics(): Promise<
    {
      name: string;
      value: number;
    }[]
  > {
    try {
      this.logger.info("Getting top customers analytics");

      const topCustomers = await db.$queryRaw<
        {
          user_id: string;
          name: string;
          _count: number;
        }[]
      >`
      SELECT o.user_id, u.name, COUNT(o.id)::int AS _count
      FROM "Orders" o
      LEFT JOIN "Users" u ON o.user_id = u.id
      WHERE o.user_id IS NOT NULL AND u.name IS NOT NULL
      GROUP BY o.user_id, u.name
      ORDER BY _count DESC
      LIMIT 10;
    `;
      return topCustomers.map((customer) => ({
        name: customer.name,
        value: customer._count,
      }));
    } catch (e) {
      console.log(e);
      this.logger.error("Error in getTopCustomersAnalytics: %o", e);
      return [];
    }
  }

  public async getNumberOfCustomersOverTimeAnalytics({
    start,
    end,
  }: {
    start: string;
    end: string;
  }) {
    this.logger.info("Getting number of customers over time", {
      start,
      end,
    });

    const customers = await db.users.findMany({
      where: {
        created_at: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const customersPerDay: { [dateKey: string]: number } = {};

    // Loop through the customers array
    customers.forEach((order) => {
      // Extract the date part from the timestamp
      const dateKey = order.created_at.toISOString().split("T")[0];
      // Increment the count for the corresponding day
      if (dateKey) {
        customersPerDay[dateKey] = (customersPerDay[dateKey] || 0) + 1;
      }
    });
    return {
      total: customers.length,
      data: Object.entries(customersPerDay).map(([date, total]) => ({
        date,
        total,
      })),
    };
  }

  public async getNumberOfOrdersOverTimeAnalytics({
    start,
    end,
  }: {
    start: string;
    end: string;
  }) {
    this.logger.info("Getting number of orders over time", {
      start,
      end,
    });

    const orders = await db.orders.findMany({
      where: {
        created_at: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const ordersPerDay: {
      [key: string]: number;
    } = {};
    orders.forEach((order) => {
      const dateKey = order.created_at.toISOString().split("T")[0];
      if (dateKey) {
        ordersPerDay[dateKey] = (ordersPerDay[dateKey] || 0) + 1;
      }
    });

    return {
      total: orders.length,
      data: Object.entries(ordersPerDay).map(([date, total]) => ({
        date,
        total,
      })),
    };
  }

  public async getRevenueAnalyticsOverTimeAnalytics({
    start,
    end,
  }: {
    start: string;
    end: string;
  }) {
    this.logger.info("Getting revenues analytics over time", {
      start,
      end,
    });

    const orders = await db.orders.findMany({
      where: {
        created_at: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const revenuesPerDay: {
      [key: string]: number;
    } = {};
    orders.forEach((order) => {
      const dateKey = order.created_at.toISOString().split("T")[0];
      if (dateKey) {
        revenuesPerDay[dateKey] = (revenuesPerDay[dateKey] || 0) + order.price;
      }
    });

    return {
      total: Object.values(revenuesPerDay).reduce(
        (a, b) => a + b * randomInt(20, 40),
        0,
      ),
      data: Object.entries(revenuesPerDay).map(([date, total]) => ({
        date,
        total,
      })),
    };
  }

  public async getTopStatesAndCitiesAnalytics(): Promise<{
    states: {
      name: string;
      value: number;
    }[];
    cities: {
      name: string;
      value: number;
    }[];
  }> {
    this.logger.info("Getting top states and cities analytics");

    const topStates = await db.users.groupBy({
      by: ["state"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const topCities = await db.users.groupBy({
      by: ["city"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    return {
      states: topStates.map((state) => ({
        name: state.state,
        value: state._count.id,
      })),
      cities: topCities.map((city) => ({
        name: city.city,
        value: city._count.id,
      })),
    };
  }
}
