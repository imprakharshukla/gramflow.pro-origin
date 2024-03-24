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
  
    const { searchParams } = new URL(req.url);
    console.log({ url: req.url });
    const pageIndex = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    // const searchParam = searchParams.get("searchParam") as SearchParams;
    const searchTerm = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if(!from || !to) return NextResponse.json({ error: "Please provide from and to date" }, { status: 400 });
    const fromDate = new Date(Number(from));
    const toDate = new Date(Number(to));
    console.log(`Fetching orders within date range: ${fromDate} to ${toDate}`)
    if (searchTerm) {
      console.log("Returning everything...");
      const getReq = await getAllOrders();
      return NextResponse.json({ orders: getReq, count: getReq.length });
    }
    if (pageIndex && pageSize) {
      const getReq = await getAllOrdersWithPagination({
        page: parseInt(pageIndex),
        pageSize: parseInt(pageSize),
        from: fromDate,
        to: toDate,
      });
      console.log(`Fetched ${getReq.count} orders`)
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
