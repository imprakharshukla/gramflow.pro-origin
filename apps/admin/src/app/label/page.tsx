import { type Orders, type Users } from "@acme/db";
import { ThemeToggle } from "@acme/ui";

import { prisma } from "~/lib/prismaClient";
import ShippingLabelTable from "./components/shippingLabelTable";

export type OrderUserType = Orders & {
  user: Users | null;
};

export type SearchParams = {
  order_ids?: string;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: false,
    },
  },
  title: `Shipping Labels ${
    new Date().toDateString() + " " + new Date().toLocaleTimeString()
  }`,
  description: "",
};

export default async function LabelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const order_ids = searchParams.order_ids;

  const getOrders = async (order_ids: string): Promise<OrderUserType[]> => {
    return new Promise(async (resolve, reject) => {
      const orderArray = order_ids.split(",");
      try {
        const orders: OrderUserType[] = [];
        for (let i = 0; i < orderArray.length; i++) {
          const order = await prisma.orders.findUnique({
            where: {
              id: orderArray[i],
            },
            include: {
              user: true,
            },
          });
          if (order && order.user) orders.push(order);
        }
        resolve(orders);
      } catch (e) {
        console.log({ e });
        return [];
      }
    });
  };

  const orders = await getOrders(order_ids ?? "");

  return (
    <div className="container mx-auto py-10">
      {!order_ids && <p>No order ids</p>}
      {orders.map((order) => {
        return <ShippingLabelTable order={order} key={order.id} />;
      })}
    </div>
  );
}
