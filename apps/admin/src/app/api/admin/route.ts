import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import {
  OrderShippingUpdateSchemaWithOrderId,
  getAllOrders,
  getAllOrdersWithPagination,
  updateOrderStatus,
  updateShippingCharges,
} from "@gramflow/db/dbHelper";

import { SearchParams } from "~/app/dashboard/data-table";

export async function GET(req: Request) {
  try {
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log({ url: req.url });
    const pageIndex = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    // const searchParam = searchParams.get("searchParam") as SearchParams;
    const searchTerm = searchParams.get("search");

    console.log({ pageIndex, pageSize });
    if (searchTerm) {
      console.log("Returning everything...");
      // const getSearchingReq = await getOrdersWithSearchParams({
      //   searchParam,
      //   searchTerm,
      // });
      // return NextResponse.json({ orders: getSearchingReq });
      const getReq = await getAllOrders();
      return NextResponse.json({ orders: getReq, count: getReq.length });
    }
    if (pageIndex && pageSize) {
      const getReq = await getAllOrdersWithPagination({
        page: parseInt(pageIndex),
        pageSize: parseInt(pageSize),
      });
      return NextResponse.json({ ...getReq });
    }
    const getReq = await getAllOrders();
    return NextResponse.json({ orders: getReq });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "No order found" }, { status: 404 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    console.log({ body });
    const validated = OrderShippingUpdateSchemaWithOrderId.parse(body);
    await updateOrderStatus(validated);
    if (validated.weight && validated.weight !== "")
      await updateShippingCharges({
        id: validated.id,
        weight: validated.weight,
      });
    return NextResponse.json({ message: "Order updated" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "No order found" }, { status: 404 });
  }
}
