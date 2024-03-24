"use client"

import { Button, Loader, Separator, Sheet, SheetContent, Skeleton } from "@gramflow/ui";
import { DashboardOrderDetailSheet, OrderDetailsContent } from "../dashboardOrderDetailSheet";
import useRestAPI from "~/features/hooks/use-rest-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrdersPage({
  params,
}: {
  params: { order_id: string };
}) {
  const { client } = useRestAPI();
  const { data, isLoading, error } = client.order.getOrder.useQuery(
    [params.order_id],
    {
      params: {
        id: params.order_id,
      },
    }
  );


  return (
    <div className="container">
      <div className="grid max-w-6xl mt-3 lg:mt-0 gap-2">
        <Button size={"sm"} variant={"outline"} className="w-fit mb-2">
          <Link
            href={`/dashboard/orders`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Orders</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Order Details</h1>
        <p className="text-muted-foreground text-sm">{params.order_id}</p>
      </div>
      <Separator className="my-3" />
      {
        isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={24} />
          </div>
        ) : (
          <div className="max-w-lg">
            <OrderDetailsContent order={data?.body} />
          </div>
        )
      }

    </div>
  );
}