import { Status } from "@prisma/client";
import {
  BadgeDelta,
  Card,
  Flex,
  Grid,
  Metric,
  Text,
  type Color,
  type DeltaType,
} from "@tremor/react";

import { prisma } from "~/lib/prismaClient";

const colors: { [key: string]: Color } = {
  increase: "emerald",
  unchanged: "orange",
  decrease: "rose",
  moderateIncrease: "emerald",
  moderateDecrease: "red",
};
const getDeltaType = (delta: number) => {
  if (delta > 0) {
    return "increase";
  } else if (delta < 0) {
    return "decrease";
  } else if (delta > 10) {
    return "moderateIncrease";
  } else if (delta < -10) {
    return "moderateDecrease";
  } else {
    return "unchanged";
  }
};

const dataFormatterRupee = (number: number) => {
  return "₹ " + Intl.NumberFormat("en-IN").format(number).toString();
};

export default async function KpiCards() {
  const fetchCustomers = async () => {
    const currentMonthCustomers = await prisma.users.count({
      where: {
        created_at: {
          lte: new Date(),
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const previousMonthCustomers = await prisma.users.count({
      where: {
        created_at: {
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        },
      },
    });

    return {
      currentMonthCustomers,
      previousMonthCustomers,
    };
  };

  const fetchOrders = async () => {
    const currentMonthOrders = await prisma.orders.count({
      where: {
        created_at: {
          lte: new Date(),
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const previousMonthOrders = await prisma.orders.count({
      where: {
        created_at: {
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        },
      },
    });

    return {
      currentMonthOrders,
      previousMonthOrders,
    };
  };

  const fetchDeliveries = async () => {
    const currentMonthDeliveries = await prisma.orders.count({
      where: {
        created_at: {
          lte: new Date(),
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: Status.DELIVERED,
      },
    });

    const previousMonthDeliveries = await prisma.orders.count({
      where: {
        created_at: {
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        },
        status: Status.DELIVERED,
      },
    });

    return {
      currentMonthDeliveries,
      previousMonthDeliveries,
    };
  };

  const fetchRevenue = async () => {
    const currentMonthRevenue = await prisma.orders.aggregate({
      _sum: {
        price: true,
      },
      where: {
        created_at: {
          lte: new Date(),
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const previousMonthRevenue = await prisma.orders.aggregate({
      _sum: {
        price: true,
      },
      where: {
        created_at: {
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        },
      },
    });

    return {
      currentMonthRevenue: currentMonthRevenue._sum.price,
      previousMonthRevenue: previousMonthRevenue._sum.price,
    };
  };

  const { currentMonthCustomers, previousMonthCustomers } =
    await fetchCustomers();

  const customerDelta = Math.round(
    ((currentMonthCustomers - previousMonthCustomers) /
      previousMonthCustomers) *
      100,
  );

  const { currentMonthOrders, previousMonthOrders } = await fetchOrders();
  const orderDelta = Math.round(
    ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100,
  );

  const { currentMonthDeliveries, previousMonthDeliveries } =
    await fetchDeliveries();
  const deliveryDelta = Math.round(
    ((currentMonthDeliveries - previousMonthDeliveries) /
      previousMonthDeliveries) *
      100,
  );

  const { currentMonthRevenue, previousMonthRevenue } = await fetchRevenue();
  const revenueDelta = Math.round(
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100,
  );

  const categories: {
    title: string;
    metric: string;
    metricPrev: string;
    delta: string;
    deltaType: DeltaType;
  }[] = [
    {
      title: "Orders",
      metric: currentMonthOrders,
      metricPrev: previousMonthOrders,
      delta: orderDelta.toString() + "%",
      deltaType: getDeltaType(orderDelta),
    },
    {
      title: "Revenue",
      metric: dataFormatterRupee(currentMonthRevenue),
      metricPrev: dataFormatterRupee(previousMonthRevenue),
      delta: revenueDelta.toString() + "%",
      deltaType: getDeltaType(revenueDelta),
    },
    {
      title: "Customers",
      metric: currentMonthCustomers.toString(),
      metricPrev: previousMonthCustomers.toString(),
      delta: customerDelta.toString() + "%",
      deltaType: getDeltaType(customerDelta),
    },
    {
      title: "Deliveries",
      metric: currentMonthDeliveries.toString(),
      metricPrev: previousMonthDeliveries.toString(),
      delta: deliveryDelta.toString() + "%",
      deltaType: getDeltaType(deliveryDelta),
    },
  ];

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
      {categories.map((item) => (
        <Card key={item.title}>
          <Text>{item.title}</Text>
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-3 truncate"
          >
            <Metric>{item.metric}</Metric>
            <Text className="truncate">from {item.metricPrev}</Text>
          </Flex>
          <Flex justifyContent="start" className="mt-4 space-x-2">
            <BadgeDelta deltaType={item.deltaType} />
            <Flex justifyContent="start" className="space-x-1 truncate">
              <Text color={colors[item.deltaType]}>{item.delta}</Text>
              <Text className="truncate">to previous month</Text>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
}
