"use client";

import Image from "next/image";
import Link from "next/link";
import { Status } from "@prisma/client";
import { motion } from "framer-motion";
import { type z } from "zod";

import { Button } from "@gramflow/ui";
import { type OrderPageOrderFetchSchema } from "@gramflow/utils/src/schema";

export const OrderStatusTitleDescription = {
  [Status.ACCEPTED]: {
    title: "Order Accepted",
    description:
      "Your order is already confirmed. Please check your email for new updates.",
  },
  [Status.MANIFESTED]: {
    title: "Order Manifested",
    description:
      "Your order has been manifested. Please click the button below to track your order.",
  },
  [Status.CANCELLED]: {
    title: "Order Cancelled",
    description:
      "Your order has been cancelled. If you think this is a mistake, please reach out to us.",
  },
  [Status.SHIPPED]: {
    title: "Order Shipped",
    description:
      "Your order has been shipped. Please click the button below to track your order.",
  },
  [Status.DELIVERED]: {
    title: "Order Delivered",
    description:
      "Your order has been delivered. Please click the button below to track your order.",
  },
  [Status.PENDING]: {
    title: "Confirm Your Order",
    description: "Please confirm if this is what you bought.",
  },
};

export default function OrderUpdatedComponent({
  order,
}: {
  order: z.infer<typeof OrderPageOrderFetchSchema>;
}) {
  return (
    <>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={""}
      >
        <h1 className="bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pb-3 pt-4 text-center text-4xl font-medium tracking-tight text-transparent dark:text-white md:text-5xl">
          {OrderStatusTitleDescription[order.status].title}
        </h1>
        <p className={"text-center text-sm text-muted-foreground"}>
          {OrderStatusTitleDescription[order.status].description}
        </p>
        <div className={"item-center m-4 flex justify-center space-x-3 p-3"}>
          {order &&
            order.images.map((image, index) => {
              return (
                <Image
                  key={index}
                  className={
                    "mt-5 rounded-md text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm"
                  }
                  width={150}
                  height={150}
                  src={image}
                  alt={"Item Picture"}
                />
              );
            })}
        </div>
        <div
          className={
            "flex items-center justify-center animate-in fade-in duration-200"
          }
        >
          <Link
            href="#"
            className="dark: group mt-5 flex w-fit space-x-1 rounded-full bg-white/30 px-5 py-2 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm dark:bg-gray-700/50 dark:text-white sm:mt-0 md:mt-5"
          >
            <p>
              Order ID- <span className={"font-medium"}>{order.id}</span>
            </p>
          </Link>
        </div>
        {(order.status === Status.SHIPPED ||
          order.status === Status.MANIFESTED ||
          order?.status === Status.DELIVERED) &&
          order.awb && (
            <div className={"flex items-center justify-center"}>
              <Button
                className={"mx-auto mt-5 w-full max-w-sm"}
                onClick={() => {
                  window.open(
                    `https://www.delhivery.com/track/package/${order?.awb}`,
                    "_blank",
                  );
                }}
              >
                Track Order
              </Button>
            </div>
          )}
      </motion.div>
    </>
  );
}
