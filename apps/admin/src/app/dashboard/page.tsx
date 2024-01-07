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
import { currentTabAtom } from "~/stores/dashboardStore";
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

  const redis = new Redis({
    url: env.UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
  });
  const areBundlesAvailable = (await redis.get<boolean>("bundles")) ?? false;

  //  const [currentDashboardTab, setCurrentDashboardTab] = useAtom(currentTabAtom);

  const searchOrderId = Array.isArray(searchParams?.order_id)
    ? searchParams?.order_id.join(",")
    : searchParams?.order_id ?? null;
  const searchBundleId = Array.isArray(searchParams?.bundle_id)
    ? searchParams?.bundle_id.join(",")
    : searchParams?.bundle_id ?? null;
  return (
    <>
      {pickupToday && (
        <div className="-mt-16 mb-12 w-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
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

        <TabGroup
          className="mt-6"
          defaultIndex={2}
          // index={currentDashboardTab}
          // onIndexChange={setCurrentDashboardTab}
        >
          <TabList>
            <Tab>Analytics</Tab>
            <Tab>Orders</Tab>
            <Tab>Bundles</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <div className="mt-6">
                <KpiCards />
              </div>
              <Grid numItemsMd={1} numItemsLg={2} className="mt-6 gap-6">
                <Card>
                  <NumberOfOrdersChart />
                </Card>
                <Card>
                  <RevenueChart />
                </Card>{" "}
              </Grid>
            </TabPanel>
            <TabPanel>
              <OrderTable searchOrderId={searchOrderId} />
            </TabPanel>
            <TabPanel>
              <BundlesTable areBundlesAvailable={areBundlesAvailable} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </main>
    </>
  );
}
