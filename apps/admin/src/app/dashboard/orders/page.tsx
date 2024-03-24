
import { OrderTable } from "./orderTableComponent";

export default function OrderPage() {
  return (
    <>
      <div className="grid w-full max-w-6xl mt-3 lg:mt-0 -mb-3 gap-2">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-muted-foreground text-sm">View your recent orders</p>
      </div>
      <OrderTable />
    </>
  );
};
