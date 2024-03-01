"use client";

import { useEffect } from "react";
import { AreaChart, BarList, Card, Grid, Text, Title } from "@tremor/react";
import { subDays } from "date-fns";

import useAnalyticsQueryClient from "~/features/hooks/use-analytics-query-client";
import NumberOfOrdersChart from "./numberOfOrderChart";

export default async function RevenueChart() {
  const analyticsQueryClient = useAnalyticsQueryClient();

  const { data: revenueChartData } =
    analyticsQueryClient.getRevenueAnalyticsOverTimeAnalytics.useQuery(
      ["timeRevenue"],
      {
        query: {
          start: subDays(new Date(), 400).valueOf().toString(),
          end: new Date().valueOf().toString(),
        },
      },
    );
  const { data: orderChartData } =
    analyticsQueryClient.getNumberOfOrdersOverTimeAnalytics.useQuery(
      ["timeOrders"],
      {
        query: {
          start: subDays(new Date(), 400).valueOf().toString(),
          end: new Date().valueOf().toString(),
        },
      },
    );

  const { data: topCustomersChartData } =
    analyticsQueryClient.getTopCustomersAnalytics.useQuery(["topCustomers"], {
      query: {
        start: subDays(new Date(), 400).valueOf().toString(),
        end: new Date().valueOf().toString(),
      },
    });

  useEffect(() => {
    console.log(revenueChartData);
    console.log(orderChartData);
    console.log(topCustomersChartData);
  }, [revenueChartData, orderChartData, topCustomersChartData]);

  return (
    <div>
      <Grid numItemsMd={1} numItemsLg={2} className="mt-6 gap-6">
        <Card>
          <Title>Revenue</Title>
          <Text>{revenueChartData?.body.total}</Text>
          <AreaChart
            curveType={"natural"}
            className="mt-6"
            noDataText="No data available"
            showLegend={false}
            data={revenueChartData?.body.data ?? []}
            index="date"
            connectNulls={true}
            categories={["total"]}
            colors={["purple"]}
            // valueFormatter={dataFormatter}
            yAxisWidth={40}
          />
        </Card>{" "}
        <Card>
          <Title>Orders</Title>
          <Text>{orderChartData?.body.total}</Text>
          <AreaChart
            curveType={"natural"}
            className="mt-6"
            noDataText="No data available"
            showLegend={false}
            data={orderChartData?.body.data ?? []}
            index="date"
            connectNulls={true}
            categories={["total"]}
            colors={["purple"]}
            // valueFormatter={dataFormatter}
            yAxisWidth={40}
          />
        </Card>{" "}
      </Grid>
      <Card className="mt-6">
        <Title>Top Customers</Title>
        <BarList
          data={topCustomersChartData?.body ?? []}
          className="mx-auto max-w-sm"
        />
      </Card>
    </div>
  );
}
