import { type Metadata } from "next";
import { useSearchParams } from "next/navigation";
import {
  Card,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title,
} from "@tremor/react";
import { Redis } from "@upstash/redis";
import { format } from "date-fns";
import { useAtom } from "jotai";

import { OrderTable } from "~/app/dashboard/components/orderTableComponent";
import { env } from "~/env.mjs";
import { prisma } from "~/lib/prismaClient";
import KpiCards from "./components/analytics/kpiCards";
import NumberOfOrdersChart from "./components/analytics/numberOfOrderChart";
import RevenueChart from "./components/analytics/revenueChart";
import { BundlesTable } from "./components/bundles/bundleTableComponent";
import { DashboardNavigation } from "./components/dashboardNavigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

const checkIfPickupToday = async () => {
  const date = new Date();
  console.log(format(date, "yyyy-MM-dd"));
  const pickupToday = await prisma.pickups.findFirst({
    where: {
      pickup_date: format(date, "yyyy-MM-dd"),
    },
  });
  console.log(pickupToday);
  return pickupToday;
};

const pickupToday = await checkIfPickupToday();

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // get search params from the page:
  console.log({ searchParams });
  const currentTab = searchParams?.tab as string ?? '1';

  const redis = new Redis({
    url: env.UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
  });
  const areBundlesAvailable = (await redis.get<boolean>("bundles")) ?? false;
  return (
    <>
      {pickupToday && (
        <div className="-mt-16 mb-12 w-full bg-card px-4 py-2 text-sm font-medium text-black">
          Pickup today on {format(new Date(), "dd MMMM yyyy")}
        </div>
      )}
      <main className="container mx-auto px-4 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title>Order Dashboard</Title>
            <Text>Here is all the information about your orders</Text>
          </div>

          <DashboardNavigation />
        </div>
      </main>
    </>
  );
}
