import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import {
    BundleShippingUpdateSchemaWithOrderId,
  getAllBundles,
  getAllBundlesWithPagination,
  updateBundleStatus,
} from "@gramflow/db/dbHelper";


export async function GET(req: Request) {
  try {

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
      const getReq = await getAllBundles();
      return NextResponse.json({ orders: getReq, count: getReq.length });
    }
    if (pageIndex && pageSize) {
      const getReq = await getAllBundlesWithPagination({
        page: parseInt(pageIndex),
        pageSize: parseInt(pageSize),
      });
      return NextResponse.json({ ...getReq });
    }
    const getReq = await getAllBundles();
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
    const validated = BundleShippingUpdateSchemaWithOrderId.parse(body);
    await updateBundleStatus(validated);
    return NextResponse.json({ message: "Bundle updated" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "No bundle found" }, { status: 404 });
  }
}
