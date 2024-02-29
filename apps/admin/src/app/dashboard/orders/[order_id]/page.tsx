import { id } from "date-fns/locale";

import { Sheet } from "@gramflow/ui";

import { DashboardOrderDetailSheet } from "../../components/dashboardOrderDetailSheet";

export default function OrdersPage({
  params,
}: {
  params: { order_id: string };
}) {

    
  return (
    <>
      <Sheet open={true}>
        {/* <DashboardOrderDetailSheet order={rowDetails} /> */}
      </Sheet>
    </>
  );
}
