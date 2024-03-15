"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { type z } from "zod";

import { Button, Card, CardContent, Separator } from "@gramflow/ui";
import { OrderPageOrderFetchSchemas, type OrderPageOrderFetchSchema } from "@gramflow/utils/src/schema";

import { OrderStatus } from "./OrderManagerComponent";

export default function functionOrderPendingComponent({
  order,
  setOrderConfirmed,
}: {
  order: z.infer<typeof OrderPageOrderFetchSchemas>;
  setOrderConfirmed: Dispatch<SetStateAction<OrderStatus>>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{  opacity: 1 }}
  
      className={""}
    >
      <h1 className="bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pb-3 pt-4 text-center text-4xl font-medium tracking-tight text-transparent dark:text-white md:text-5xl">
        Confirm Your Order
      </h1>
      <p className={"text-center text-sm text-muted-foreground"}>
        Please confirm if this is what you bought.
      </p>
      <div className={"flex items-center justify-center"}>
        <Link
          href="#"
          className="dark:bg-gray-800/50 dark: group mt-5 flex w-fit space-x-1 rounded-full bg-white/30 px-5 py-2 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm sm:mt-0 md:mt-5"
        >
          <p className={"dark:text-white"}>
            Order ID- <span className={"font-medium"}>{order.id}</span>
          </p>
        </Link>
      </div>
      <div className={"item-center flex justify-center space-x-3 p-3"}>
        {order &&
          // order.images.map((image, index) => {
          //   return (
          //     <Image
          //       key={index}
          //       className={
          //         "mt-5 rounded-md text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm"
          //       }
          //       width={150}
          //       height={150}
          //       src={image}
          //       alt={"Item Picture"}
          //     />
          //   );
          // })}
          <div className="w-[400px]">
            <Card className={"flex flex-col space-y-2"}>
              <p className="p-3 text-xs font-medium text-muted-foreground">
                {/* Products in order */}
              </p>
              <CardContent className="grid grid-cols-1 gap-2">
                {order.instagram_post_urls.map((url, index) => {
                  const uri = new URL(url);
                  const priceValue = uri.searchParams.get("price");
                  const parsedPrice = Number(priceValue);
                  const postId = uri.pathname.split("/")[2];
                  const slideNumber = uri.searchParams.get("img_index");
                  return (
                    <div className="flex items-center justify-between">
                      <a href={url} target="_blank">
                        <img
                          width={50}
                          height={50}
                          className="rounded-md"
                          src={order.images[index]}
                        />
                      </a>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Item {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {postId} ({slideNumber})
                        </p>
                      </div>
                      <p className="text-sm font-medium">{`₹ ${parsedPrice}`}</p>
                    </div>
                  );
                })}
                <div>
                  <div className="my-3">
                    <Separator />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm font-medium">{`₹ ${order.price}`}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        }
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
