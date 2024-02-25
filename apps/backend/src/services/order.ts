import { Container, Inject, Service } from "typedi";
import { z } from "zod";

import { db } from "@gramflow/db";
import { OrdersModel, RelatedOrdersModel } from "@gramflow/db/prisma/zod";

import { IOrderInputDTO } from "../interfaces/IOrder";

type OrdersModelType = z.infer<typeof OrdersModel>;
const optionalOrdersModelType = OrdersModel.partial().required({
  id: true,
});
type OptionalOrdersModelType = z.infer<typeof optionalOrdersModelType>;

@Service()
export default class OrderService {
  public async createOrder(order: IOrderInputDTO): Promise<OrdersModelType> {
    return db.orders.create({
      data: order,
    });
  }
  public async updateOrder(
    order: OptionalOrdersModelType,
  ): Promise<OrdersModelType> {
    return db.orders.update({
      where: {
        id: order.id,
      },
      data: order,
    });
  }
  public async deleteOrder(id: string[]) {
    return db.orders.deleteMany({
      where: {
        id: {
          in: id,
        },
      },
    });
  }
  public async getOrdersById(order_ids: string[]) {
    return db.orders.findMany({
      include: {
        user: true,
      },
      where: {
        id: {
          in: order_ids,
        },
      },
    });
  }
  public async getOrders(
    from?: string,
    to?: string,
    page?: number,
    pageSize?: number,
    searchTerm?: string,
  ): Promise<OrdersModelType[]> {
    if (!from || !to) {
      // from and to are not present, so we are returning all the orders
      return db.orders.findMany({
        include: {
          user: true,
          bundles: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });
    }

    if (!page || !pageSize) {
      // page and pageSize are not present, so we are returning all the orders in the given date range
      return db.orders.findMany({
        include: {
          user: true,
          bundles: {
            include: {
              user: true,
            },
          },
        },
        where: {
          created_at: {
            gte: new Date(from).toISOString(),
            lte: new Date(to).toISOString(),
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });
    }
    // returning everything if the search term is present so that we can search on the frontend
    const offset = page * pageSize;
    if (searchTerm) {
      return db.orders.findMany();
    }
    return db.orders.findMany({
      include: {
        user: true,
        bundles: {
          include: {
            user: true,
          },
        },
      },
      where: {
        created_at: {
          gte: new Date(from).toISOString(),
          lte: new Date(to).toISOString(),
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: offset,
      take: pageSize,
    });
  }
}
