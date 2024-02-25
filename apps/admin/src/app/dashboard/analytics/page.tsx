import { Grid,Card } from "@tremor/react"
import KpiCards from "../components/analytics/kpiCards"
import NumberOfOrdersChart from "../components/analytics/numberOfOrderChart"
import RevenueChart from "../components/analytics/revenueChart"

export default function AnalyticsPage() {
    return (
        <>
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
        </>
    )
}