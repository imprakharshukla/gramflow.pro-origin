"use client"
import { Card, Grid } from "@tremor/react";

import AnanlyticCharts from "../components/analytics/revenueChart";

export default function AnalyticsPage() {

    return (
        <>
            {/*<div className="mt-6">*/}
            {/*    <KpiCards/>*/}
            {/*</div>*/}

            <Grid numItemsMd={1} numItemsLg={1} className="mt-6 gap-6">
                <AnanlyticCharts />
            </Grid>
        </>
    );
}
