import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import {
  OrderShippingUpdateSchemaWithOrderId,
  getAllOrders,
  getAllOrdersWithPagination,
  updateOrderStatus,
} from "@acme/db/dbHelper";

import { prisma } from "~/lib/prismaClient";

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
    console.log({ pageIndex, pageSize });
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
    return NextResponse.json({ message: "Order updated" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "No order found" }, { status: 404 });
  }
}
