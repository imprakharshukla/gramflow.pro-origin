"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { type z } from "zod";

import { Button } from "@gramflow/ui";
import { type OrderPageOrderFetchSchema } from "@gramflow/utils/src/schema";

import { OrderStatus } from "./OrderManagerComponent";

export default function functionOrderPendingComponent({
  order,
  setOrderConfirmed,
}: {
  order: z.infer<typeof OrderPageOrderFetchSchema>;
  setOrderConfirmed: Dispatch<SetStateAction<OrderStatus>>;
}) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={""}
    >
      <h1 className="bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pb-3 pt-4 text-center text-4xl font-medium tracking-tight text-transparent dark:text-white md:text-5xl">
        Confirm Your Order
      </h1>
      <p className={"text-center text-sm text-muted-foreground"}>
        Please confirm if this is what you bought.
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
      <div className={"flex items-center justify-center"}>
        <Link
          href="#"
          className="dark:bg-gray-700/50 dark: group mt-5 flex w-fit space-x-1 rounded-full bg-white/30 px-5 py-2 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm sm:mt-0 md:mt-5"
        >
          <p className={"dark:text-white"}>
            Order ID- <span className={"font-medium "}>{order.id}</span>
          </p>
        </Link>
      </div>
      <div
        className={
          "mx-auto my-4 flex w-full max-w-md items-center justify-center space-x-3"
        }
      >
        <Button
          className={"w-full"}
          variant={"outline"}
          onClick={() => {
            setOrderConfirmed(OrderStatus.CANCELLED);
          }}
        >
          Cancel
        </Button>
        <Button
          className={"w-full"}
          onClick={() => {
            setOrderConfirmed(OrderStatus.CONFIRMED);
          }}
        >
          Confirm
        </Button>
      </div>
    </motion.div>
  );
}
