import { type Metadata } from "next";
import { useRouter } from "next/navigation";
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


import { OrderTable } from "~/app/dashboard/components/orderTableComponent";
import KpiCards from "./components/analytics/kpiCards";
import NumberOfOrdersChart from "./components/analytics/numberOfOrderChart";
import RevenueChart from "./components/analytics/revenueChart";
import { DashboardNavigation } from "./components/dashboardNavigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Dashboard() {
  return (
    <main className="container mx-auto px-4 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title>Order Dashboard</Title>
          <Text>Here is all the information about your orders</Text>
        </div>

        <DashboardNavigation/>
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
              </Card>
            </Grid>
          </TabPanel>
          <TabPanel>
            <OrderTable />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
