import { PrismaClient, Status } from "@prisma/client";
import { z } from "zod";

import {
  OrderShippingUpdateSchema,
  UpdateOrderWeightAndSizePutSchema,
  type AddOrderPostSchema,
  type UserSchema,
} from "@gramflow/utils/src/schema";

import { SearchParams } from "~/app/dashboard/data-table";
import { fetchImageUrls } from "./instagramHelper";

const prisma = new PrismaClient();

export const getOrder = async (id: string) => {
  return prisma.orders.findUnique({
    where: {
      id: id,
    },
  });
};
export const GetOtp = async (id: string) => {
  return prisma.otp.findUnique({
    where: {
      id: id,
    },
  });
};

// export const getOrdersWithSearchParams = async ({
//   searchTerm,
//   searchParam,
// }: {
//   searchTerm: string;
//   searchParam: SearchParams;
// }) => {
//   switch (searchTerm) {
//     case SearchParams.Order_ID:
//       return prisma.orders.findMany({
//         where: {
//           id: searchParam,
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//     case SearchParams.Phone_Number:
//       return prisma.orders.findMany({
//         where: {
//           user: {
//             phone_no: searchParam,
//           },
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//     case SearchParams.Email:
//       return prisma.orders.findMany({
//         where: {
//           user: {
//             email: searchParam,
//           },
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//     case SearchParams.Name:
//       return prisma.orders.findMany({
//         where: {
//           user: {
//             name: searchParam,
//           },
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//     case SearchParams.Awb:
//       return prisma.orders.findMany({
//         where: {
//           awb: searchParam,
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//     case SearchParams.Username:
//       return prisma.orders.findMany({
//         where: {
//           user: {
//             instagram_username: searchParam,
//           },
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           created_at: "desc",
//         },
//       });
//   }
// };

export const getAllOrdersWithPagination = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  const offset = page * pageSize;
  const orders = await prisma.orders.findMany({
    include: {
      user: true,
    },
    orderBy: {
      created_at: "desc",
    },
    skip: offset,
    take: pageSize,
  });
  const count = await prisma.orders.count();
  return {
    orders,
    count,
  };
};
export const getAllOrders = async () => {
  return prisma.orders.findMany({
    include: {
      user: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};
export const getUserData = async (email: string) => {
  return prisma.users.findUnique({
    where: {
      email: email,
    },
  });
};
export const updateOrder = async (id: string, user_id: string) => {
  //now add the user to the order and update the order
  return prisma.orders.update({
    where: {
      id: id,
    },
    data: {
      status: Status.ACCEPTED,
      user_id: user_id,
    },
  });
};

export const deleteOtp = async (id: string) => {
  return prisma.otp.delete({
    where: {
      id: id,
    },
  });
};

export const OrderShippingUpdateSchemaWithOrderId =
  UpdateOrderWeightAndSizePutSchema.extend({
    id: z.string().uuid(),
  });

export const updateOrderStatus = async (
  order: z.infer<typeof OrderShippingUpdateSchemaWithOrderId>,
) => {
  const { id, ...rest } = order;

  return prisma.orders.update({
    where: {
      id: id,
    },
    data: {
      status: rest.status !== undefined ? rest.status : undefined,
      length: rest.length !== undefined ? rest.length : undefined,
      breadth: rest.breadth !== undefined ? rest.breadth : undefined,
      height: rest.height !== undefined ? rest.height : undefined,
      weight: rest.weight !== undefined ? rest.weight : undefined,
      courier: rest.courier !== undefined ? rest.courier : undefined,
      awb: rest.awb !== undefined ? rest.awb : undefined,
    },
  });
};
export const checkIfAnyOrderContainsProducts = async (
  order: z.infer<typeof AddOrderPostSchema>,
) => {
  return prisma.orders.findFirst({
    where: {
      instagram_post_urls: {
        hasSome: order.instagram_post_urls,
      },
    },
  });
};

export const addOrder = async (
  order: z.infer<typeof AddOrderPostSchema>,
  images: string[],
) => {
  const mediaUrls =
    images.length > 0
      ? images
      : await fetchImageUrls(order.instagram_post_urls);
  console.log({ mediaUrls });
  //add order.instagram_post_id to the instagram_post_ids array
  const size = order.size;
  return prisma.orders.create({
    data: {
      prebook: order.prebook,
      instagram_post_urls: order.instagram_post_urls,
      images: mediaUrls,
      length: size.length,
      breadth: size.breadth,
      height: size.height,
      weight: size.weight,
    },
  });
};

export const upsertUser = async (user: z.infer<typeof UserSchema>) => {
  console.log({ user });

  return prisma.users.upsert({
    where: {
      email: user.email,
    },
    update: {
      ...user,
    },
    // @ts-ignore
    create: {
      ...user,
    },
  });
};
