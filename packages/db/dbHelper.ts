import { PrismaClient, Status } from "@prisma/client";
import { z } from "zod";

import {
  OrderShippingUpdateSchema,
  type AddOrderPostSchema,
  type UserSchema,
} from "@acme/utils/src/schema";

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
  OrderShippingUpdateSchema.extend({
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
      status: rest.status,
      courier: rest.courier,
      awb: rest.awb,
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

  return prisma.orders.create({
    data: {
      instagram_post_urls: order.instagram_post_urls,
      images: mediaUrls,
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
