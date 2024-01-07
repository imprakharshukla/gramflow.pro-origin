import { Card, Text, Title } from "@tremor/react";

export default function DashboardBundlesSelectedRowDisplayCard({
  rowSelection,
  data,
}: {
  rowSelection: object;
  data: any;
}) {
  return (
    <>
      {
        // display only if there is atleast one order selected
        Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-center gap-x-3 px-4 py-2">
            <p className={""}>
              {/*  Display the selected order */}
              {
                Object.keys(rowSelection).filter((key) => {
                  return "1";
                }).length
              }{" "}
              selected
            </p>
          </div>
        )
      }
    </>
  );
}
