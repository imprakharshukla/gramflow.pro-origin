import { type Metadata } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
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
import { Plus } from "lucide-react";

import { Button as UiButton } from "@gramflow/ui";

import { OrderTable } from "~/app/dashboard/components/orderTableComponent";
import KpiCards from "./components/analytics/kpiCards";
import NumberOfOrdersChart from "./components/analytics/numberOfOrderChart";
import RevenueChart from "./components/analytics/revenueChart";

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

        <div className="flex space-x-3">
          <Button>
            <Link href="/new" rel="noopener noreferrer" target="_blank">
              Create Order
            </Link>
          </Button>
          <UiButton variant="outline">
            <Link href="/order" rel="noopener noreferrer" target="_blank">
              <Plus className="h-4 w-4" />
            </Link>
          </UiButton>
        </div>
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
