import { Card, Text, Title } from "@tremor/react";

export default function DashboardSelectedRowDisplayCard<TData>({
  rowSelection,
  data,
}: {
  rowSelection: object;
  data: TData;
}) {
  return (
    <>
      {
        // display only if there is atleast one order selected
        Object.keys(rowSelection).length > 0 && (
          <div >  </div>
        )
      }
    </>
  );
}
