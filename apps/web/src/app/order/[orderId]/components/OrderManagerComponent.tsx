"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

import { OrderPageOrderFetchSchema, OrderPageOrderFetchSchemas } from "@gramflow/utils/src/schema";

import { DetailForm } from "~/features/ui/components/detailForm";
import OrderCancelledComponent from "./OrderCancelledComponent";
import OrderPendingComponent from "./OrderPendingComponent";
import OrderUpdatedComponent from "./OrderUpdatedComponent";
import { useSession } from "next-auth/react";
import useSessionWithLoading from "~/features/ui/hooks/use-session-auth";
import { useRouter } from "next/navigation"; import { Loader } from "@gramflow/ui";


export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export default function OrderManager({
  order,
  updated,
}: {
  order: z.infer<typeof OrderPageOrderFetchSchemas>;
  updated: boolean;
}) {

  const router = useRouter();
  const [orderConfirmed, setOrderConfirmed] = useState<OrderStatus>(
    OrderStatus.PENDING,
  );

  const { loading, session } = useSessionWithLoading()
  useEffect(() => {
    if (!loading && !session) {
      router.push(`/login?redirect=/order/${order.id}`)
    }
  }, [session, loading])

  return (
    <div className="mx-6 flex min-h-screen flex-col items-center justify-center">
      {
        <>
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
        </>
      }
    </div>
  );
}
