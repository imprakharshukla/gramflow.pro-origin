"use client";

import { useState } from "react";
import { z } from "zod";

import { OrderPageOrderFetchSchema } from "@acme/utils/src/schema";

import { DetailForm } from "~/features/ui/components/detailForm";
import OrderCancelledComponent from "./OrderCancelledComponent";
import OrderPendingComponent from "./OrderPendingComponent";
import OrderUpdatedComponent from "./OrderUpdatedComponent";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export default function OrderManager({
  order,
  updated,
}: {
  order: z.infer<typeof OrderPageOrderFetchSchema>;
  updated: boolean;
}) {
  const [orderConfirmed, setOrderConfirmed] = useState<OrderStatus>(
    OrderStatus.PENDING,
  );

  return (
    <div className="mx-6 flex min-h-screen flex-col items-center justify-center">
      {updated && <OrderUpdatedComponent order={order} />}
      {!updated && (
        <div className={"w-full"}>
          {orderConfirmed === OrderStatus.PENDING && (
            <OrderPendingComponent
              order={order}
              setOrderConfirmed={setOrderConfirmed}
            />
          )}
          {orderConfirmed === OrderStatus.CONFIRMED && (
            <div className={"w-full animate-in fade-in duration-200"}>
              <DetailForm orderId={order.id} />
            </div>
          )}
          {orderConfirmed === OrderStatus.CANCELLED && (
            <OrderCancelledComponent />
          )}
        </div>
      )}
    </div>
  );
}
