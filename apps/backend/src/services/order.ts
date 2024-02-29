import { Container, Inject, Service } from "typedi";
import { Logger } from "winston";
import { z } from "zod";



import { Status, db } from "@gramflow/db";
import { OrdersModel, RelatedOrdersModel } from "@gramflow/db/prisma/zod";



import { AppConfig } from "../config/app-config";
import { IOrderInputDTO } from "../interfaces/IOrder";


type OrdersModelType = z.infer<typeof OrdersModel>;
const optionalOrdersModelType = OrdersModel.partial().omit({
  id: true,
});
type OptionalOrdersModelType = z.infer<typeof optionalOrdersModelType>;

@Service()
export default class OrderService {
  constructor(@Inject("logger") private logger: Logger) {}

  public async createOrder(order: IOrderInputDTO): Promise<OrdersModelType> {
    return db.orders.create({
      data: {
        length: order.size.length,
        breadth: order.size.breadth,
        height: order.size.height,
        weight: order.size.weight,
        instagram_post_urls: order.instagram_post_urls,
        prebook: order.prebook,
        bundle_id: order.bundle_id,
        images: order.images,
      },
    });
  }
  public async updateOrders({
    update,
    order_ids,
  }: {
    update: OptionalOrdersModelType;
    order_ids: string[];
  }) {
    return db.orders.updateMany({
      where: {
        id: {
          in: order_ids,
        },
      },
      data: update,
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
  public async mergeOrders(order_ids: string) {
    const orderIDs = order_ids.split(",");
    const ordersData = await db.orders.findMany({
      where: {
        id: {
          in: orderIDs,
        },
      },
      include: {
        user: true,
      },
    });
    const usersIds = ordersData.map((order) => order.user_id);
    //remove the null and undefined values
    const users = usersIds.filter((user_id) => user_id !== null);

    // Create a set from the user IDs
    const usersSet = new Set(users);
    const userSetArray = Array.from(usersSet);
    if (userSetArray.length === 0) {
      throw new Error("Orders do not have any users");
    }

    if (userSetArray.length !== 1) {
      throw new Error("Orders have different users");
    }

    const mergedOrderData = ordersData.reduce<{
      instagram_post_urls: string[];
      images: string[];
      price: number;
    }>(
      (acc, order) => {
        return {
          instagram_post_urls: Array.from(
            new Set([...acc.instagram_post_urls, ...order.instagram_post_urls]),
          ),
          images: [...acc.images, ...order.images],
          price: acc.price + order.price,
        };
      },
      {
        instagram_post_urls: [],
        images: [],
        price: 0,
      },
    );


    const defaultPackageDetails = AppConfig.DefaultPackageDetails.MEDIUM;
    const user = userSetArray[0];
    this.logger.debug("User: %o", JSON.stringify(user));
    const deleteReq = await db.orders.deleteMany({
      where: {
        id: {
          in: orderIDs,
        },
      },
    });
    this.logger.debug("Deleted Orders while merging: %o", JSON.stringify(deleteReq));

    return await db.orders.create({
      data: {
        user: user ? { connect: { id: user } } : undefined,
        status: user ? Status.ACCEPTED : Status.PENDING,
        images: mergedOrderData.images,
        weight: defaultPackageDetails.weight,
        length: defaultPackageDetails.length,
        breadth: defaultPackageDetails.breadth,
        height: defaultPackageDetails.height,
        instagram_post_urls: mergedOrderData.instagram_post_urls,
      },
    });
  }

  public async getOrdersByStatus({
    order_ids,
    from,
    to,
    statuses,
  }: {
    order_ids?: string[];
    from?: number;
    to?: number;
    statuses?: Status[];
  }) {
    // Check if order_ids and statuses are defined, but from and to are undefined
    if (
      order_ids !== undefined &&
      statuses !== undefined &&
      from === undefined &&
      to === undefined
    ) {
      this.logger.debug(
        "order_ids and statuses are defined, but from and to are undefined",
      );
      return db.orders.findMany({
        include: {
          user: true,
        },
        where: {
          id: {
            in: order_ids,
          },
          status: {
            in: statuses,
          },
        },
      });
    }

    // Check if from or to are undefined
    if (from === undefined || to === undefined) {
      this.logger.debug("from or to are undefined");
      return db.orders.findMany({
        include: {
          user: true,
        },
        where: {
          status: {
            in: statuses,
          },
        },
      });
    }

    // Default case when all parameters are defined
    this.logger.debug("All parameters are defined");
    return db.orders.findMany({
      include: {
        user: true,
      },
      where: {
        created_at: {
          gte: new Date(from).toISOString(),
          lte: new Date(to).toISOString(),
        },
        status: {
          in: statuses,
        },
      },
    });
  }
  public async getOrdersCount(from?: number, to?: number) {
    if (from === undefined || to === undefined) {
      return db.orders.count();
    }
    return db.orders.count({
      where: {
        created_at: {
          gte: new Date(from).toISOString(),
          lte: new Date(to).toISOString(),
        },
      },
    });
  }
  public async getOrders(
    from?: number,
    to?: number,
    page?: number,
    pageSize?: number,
    searchTerm?: string,
  ): Promise<OrdersModelType[]> {
    this.logger.debug(page?.toString());
    this.logger.debug(pageSize?.toString());

    if (searchTerm) {
      this.logger.debug("Search term is present");
      // Handle search functionality here if needed
      // Return empty array for now
      return [];
    }

    if (from === undefined || to === undefined) {
      this.logger.debug("from and to are not present");
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

    if (page === undefined || pageSize === undefined) {
      this.logger.debug("page and pageSize are not present");
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

    // All the required parameters are present, so we are returning orders within the date range with pagination
    const offset = page * pageSize;
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