"use client";

import { useEffect, useState } from "react";
import { AreaChart, BarList, Card, Grid, Title } from "@tremor/react";
import { subDays } from "date-fns";

import { Button, Loader } from "@gramflow/ui";
import { DatePickerWithRange } from "~/features/ui/components/dateRangePicker";
import { DateRange } from "react-day-picker";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@gramflow/utils";
import useRestAPI from "~/features/hooks/use-rest-client";


export default function AnanlyticCharts() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })
    const [isDataVisible, setIsDataVisible] = useState<boolean>(false);
    const { client } = useRestAPI();
    const { data: revenueChartData, isLoading: isRevenueChartLoading, refetch: revenueChartDataRefetch } =
        client.analytics.getRevenueAnalyticsOverTimeAnalytics.useQuery(
            ["timeRevenue", dateRange],
            {
                query: {
                    start: dateRange?.from?.valueOf().toString() ?? "",
                    end: dateRange?.to?.valueOf().toString() ?? "",
                },
            },
            {
                refetchOnWindowFocus: false
            }
        );
    const { data: orderChartData, isLoading: isOrderCharDataLoading, refetch: orderChartDataRefetch } =
        client.analytics.getNumberOfOrdersOverTimeAnalytics.useQuery(
            ["timeOrders", dateRange],
            {
                query: {
                    start: dateRange?.from?.valueOf().toString() ?? "",
                    end: dateRange?.to?.valueOf().toString() ?? "",
                },
            },
            {
                refetchOnWindowFocus: false
            }
        );

    const { data: topCustomersChartData, isLoading: isTopCustomerChartDataLoading } =
        client.analytics.getTopCustomersAnalytics.useQuery(["topCustomers"], {
            query: {
                start: dateRange?.from?.valueOf().toString() ?? "",
                end: dateRange?.to?.valueOf().toString() ?? "",
            },

        }, {
            refetchOnWindowFocus: false
        });


    const { data: topCitiesAndStatesChartData, isLoading: isTopCitiesAndStatesChartDataLoading } =
        client.analytics.getTopStatesAndCitiesAnalytics.useQuery(["topCities"], {
            query: {
                start: dateRange?.from?.valueOf().toString() ?? "",
                end: dateRange?.to?.valueOf().toString() ?? "",
            },
        },
            {
                refetchOnWindowFocus: false
            });
    useEffect(() => {
        console.log({
            topCitiesAndStatesChartData,
        })
    }, [topCitiesAndStatesChartData]);

    return (
        <div className={"my-5"}>
            <div className={"w-full items-end lg:justify-end lg:items-center flex flex-col lg:flex-row gap-3"}>
                <Button
                    onClick={() => {
                        setIsDataVisible((lastValue) => {
                            return !lastValue;
                        })
                    }}
                    size={"sm"}
                    className="flex w-fit items-center space-x-2"
                    variant={"outline"}
                >
                    <span>{
                        isDataVisible ? "Hide Data" : "Show Data"
                    }</span>
                    {isDataVisible ?
                        <EyeOff className="h-4 w-4" />
                        :
                        <Eye className="h-4 w-4" />
                    }

                </Button>
                <DatePickerWithRange
                    onClickFunction={() => {
                        orderChartDataRefetch();
                        revenueChartDataRefetch();
                    }}
                    date={dateRange}
                    setDate={setDateRange}
                />
            </div>
            <Grid numItemsMd={1} numItemsLg={2} className="mt-6 gap-6">

                <Card>
                    <Title>Revenue</Title>
                    <p className={"text-lg font-bold my-2"}>₹ {
                        `${isDataVisible ? revenueChartData?.body.total.toLocaleString() : "****"}`
                    }</p>
                    {!isRevenueChartLoading ?
                        <div className={cn(!isDataVisible && "blur")}>
                            <AreaChart
                                curveType={"natural"}
                                className="mt-6"
                                noDataText="No data available"
                                showLegend={false}
                                prefix={"₹"}
                                data={revenueChartData?.body.data ?? []}
                                index="date"
                                connectNulls={true}
                                categories={["total"]}
                                colors={["pink"]}
                                // valueFormatter={dataFormatter}
                                yAxisWidth={40}
                            />
                        </div>
                        : <div className={"flex items-center justify-center h-[70%] mb-20"}>
                            <Loader />
                        </div>
                    }
                </Card>

                <Card>
                    <Title>Orders</Title>
                    <p className={"text-lg font-bold my-2"}>{
                        `${isDataVisible ? orderChartData?.body.total.toLocaleString() : "****"}`
                    }</p>
                    {!isRevenueChartLoading ?
                        <div className={cn(!isDataVisible && "blur")}>
                            <AreaChart
                                curveType={"natural"}
                                className="mt-6"
                                noDataText="No data available"
                                showLegend={false}
                                data={orderChartData?.body.data ?? []}
                                index="date"
                                connectNulls={true}
                                showAnimation={true}
                                categories={["total"]}
                                colors={["pink"]}
                                // valueFormatter={dataFormatter}
                                yAxisWidth={40}
                            />
                        </div>
                        : <div className={"flex items-center justify-center h-[70%] mb-20"}>
                            <Loader />
                        </div>
                    }
                </Card>{" "}
            </Grid>
            <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-6">
                <Card>
                    <Title>Top Customers</Title>
                    {!isRevenueChartLoading ?
                        <BarList
                            data={topCustomersChartData?.body ?? []}
                            className="mx-auto max-w-sm mt-6"
                        />
                        : <div className={"flex items-center justify-center h-[70%] mb-20"}>
                            <Loader />
                        </div>
                    }
                </Card>
                <Card>
                    <Title>Top Cities</Title>
                    {!isRevenueChartLoading ?
                        <BarList
                            data={topCitiesAndStatesChartData?.body.cities ?? []}
                            className="mx-auto max-w-sm mt-6"
                        />
                        : <div className={"flex items-center justify-center h-[70%] mb-20"}>
                            <Loader />
                        </div>
                    }
                </Card>

                <Card>
                    <Title>Top States</Title>
                    {!isRevenueChartLoading ?
                        <BarList
                            data={topCitiesAndStatesChartData?.body.states ?? []}
                            className="mx-auto max-w-sm mt-6"
                        />
                        : <div className={"flex items-center justify-center h-[70%] mb-20"}>
                            <Loader />
                        </div>
                    }
                </Card>
            </Grid>
        </div>
    );
}