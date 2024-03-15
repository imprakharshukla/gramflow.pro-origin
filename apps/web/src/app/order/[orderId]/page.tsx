import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";

import { db as prisma } from "@gramflow/db";

import Order404Component from "./components/Order404Component";
import OrderManager from "./components/OrderManagerComponent";

export default async function Order({
  params,
}: {
  params: { orderId: string };
}) {


  const order = await prisma.orders.findUnique({
    where: {
      id: params.orderId,
    },
    select: {
      bundle_id: true,
      id: true,
      status: true,
      instagram_post_urls: true,
      price: true,
      images: true,
      awb: true,
    },
  });
  console.log(order);
  if (!order) {
    return <Order404Component />;
  }
  return (
    <OrderManager order={order} updated={order.status !== Status.PENDING} />
  );
}
