"use client"

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";

import AuthNavMenu from "~/features/ui/components/authNavMenu";
import AnalyticsPage from "./analytics/page";
import BundlesPage from "./bundles/page";
import OrdersPage from "./orders/page";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <AuthNavMenu />
      <main className="mt-16 container mx-auto px-4 lg:px-1">
        <TabGroup
          className="mt-6"
          defaultIndex={1}
        >
          <TabList>
            <Tab>Analytics</Tab>
            <Tab>Orders</Tab>
            <Tab>Bundles</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
                {/* <AnalyticsPage /> */}
            </TabPanel>
            <TabPanel>
                <OrdersPage />
            </TabPanel>
            <TabPanel>
                {/* <BundlesPage /> */}
            </TabPanel>
          </TabPanels>
        </TabGroup>
        {children}
      </main>
    </div>
  );
}
