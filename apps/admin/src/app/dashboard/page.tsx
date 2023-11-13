import { type Metadata } from "next";
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
import { format } from "date-fns";

import { OrderTable } from "~/app/dashboard/components/orderTableComponent";
import { prisma } from "~/lib/prismaClient";
import KpiCards from "./components/analytics/kpiCards";
import NumberOfOrdersChart from "./components/analytics/numberOfOrderChart";
import RevenueChart from "./components/analytics/revenueChart";
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

export default function Dashboard() {
  return (
    <>
      {pickupToday && (
        <div className="-mt-16 mb-12 w-full bg-blue-600 px-4 py-2 text-sm font-medium">
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

        <TabGroup className="mt-6" defaultIndex={1}>
          <TabList>
            <Tab>Analytics</Tab>
            <Tab>Orders</Tab>
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
              <OrderTable />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </main>
    </>
  );
}
