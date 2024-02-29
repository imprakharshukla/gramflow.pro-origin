"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Text, Title } from "@tremor/react";

import AuthNavMenu from "~/features/ui/components/authNavMenu";
import { DashboardNavigation } from "./components/dashboardNavigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(currentPath);
  }, [currentPath]);
  return (
    <div className="">
      <AuthNavMenu />

      <main className="container mx-auto mt-10 px-4 lg:px-10">
        <div className="my-4 flex flex-wrap items-center justify-end gap-3">
          {/* <div>
            <Title>Order Dashboard</Title>
            <Text>Here is all the information about your orders</Text>
          </div> */}

          <DashboardNavigation />
        </div>
        <div className="max:w-[60%] border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <ul className="-mb-px flex flex-wrap">
            <li className="me-2">
              <Link
                href={"/dashboard/analytics"}
                className={`inline-block rounded-t-lg border-b-2 p-4 hover:border-primary hover:text-primary ${
                  activeTab === "/dashboard/analytics"
                    ? "border-solid border-primary text-primary"
                    : "border-none"
                }`}
              >
                Analytics
              </Link>
            </li>
            <li className="me-2">
              <Link
                href={"/dashboard/orders"}
                className={`inline-block rounded-t-lg border-b-2 p-4 hover:border-primary hover:text-primary ${
                  activeTab === "/dashboard/orders"
                    ? "border-solid border-primary text-primary"
                    : "border-none"
                }`}
              >
                Orders
              </Link>
            </li>
            <li className="me-2">
              <Link
                href={"/dashboard/bundles"}
                className={`inline-block rounded-t-lg border-b-2 p-4 hover:border-primary hover:text-primary ${
                  activeTab === "/dashboard/bundles"
                    ? "border-solid border-primary text-primary"
                    : "border-none"
                }`}
              >
                Bundles
              </Link>
            </li>
          </ul>
        </div>
        {children}
      </main>
    </div>
  );
}
