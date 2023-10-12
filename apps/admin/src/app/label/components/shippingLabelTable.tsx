import Image from "next/image";

import { CompleteOrders } from "@acme/db/prisma/zod";
import { AppConfig } from "@acme/utils";

import { type OrderUserType } from "~/app/label/page";

export default function ShippingLabelTable({
  order,
}: {
  order: OrderUserType;
}) {
  const user = order?.user;
  const awb = order?.awb;
  const courier = order?.courier;
  const products: string[] = [];
  const prices: number[] = [];
  let totalPrice = 0;
  order?.instagram_post_urls.map((url) => {
    const { postId, imageIndex } = getPostIdAndImageIndex(url);
    products.push(`${postId}(${imageIndex})`);
    const uri = new URL(url);
    const priceValue = uri.searchParams.get("price");
    const parsedPrice = Number(priceValue);
    prices.push(parsedPrice);
    totalPrice += parsedPrice;
  });
  return (
    <div className="relative my-12 overflow-x-auto">
      <table className="break-inside: avoid w-full max-w-5xl text-left text-sm text-gray-500">
        <tbody>
          <tr className="border bg-white" style={{ pageBreakInside: "avoid" }}>
            <td
              className="whitespace-pre-line border px-6 py-4 font-medium text-gray-700"
              style={{ pageBreakInside: "avoid" }}
            >
              <div className={"max-w-xs"}>
                <span className={""}>To</span>,<br />
                <span className="text-lg font-bold uppercase">
                  {user?.name},
                </span>
                <br />
                <p contentEditable="true">
                  {user?.house_number}, {user?.locality}, {user?.landmark}
                </p>
                <br />
                <p contentEditable="true" className={"font-bold"}>
                  {user?.city}, {user?.state}, {user?.country}- {user?.pincode}
                </p>
              </div>
              <br />
              <div className={"font-bold"}>
                Mobile-
                <span contentEditable="true" className="font-normal">
                  {user?.phone_no}
                </span>
              </div>
            </td>
            <td
              className="whitespace-pre-line border  px-6 py-2 text-gray-600"
              style={{ pageBreakInside: "avoid" }}
            >
              <div>
                From (If undelivered, return to),
                <br />
                <br />
                {AppConfig.StoreName},
                <br />
                {AppConfig.ReturnAddress.house_number},{" "}
                {AppConfig.ReturnAddress.locality}, <br />
                {AppConfig.ReturnAddress.city}, {AppConfig.ReturnAddress.state},{" "}
                {AppConfig.ReturnAddress.country},{" "}
                {AppConfig.ReturnAddress.pincode}
                <br />
              </div>
              <br />
              <div>
                Mobile-{" "}
                <span className="">{AppConfig.ReturnAddress.phone_no}</span>
              </div>
            </td>
            <td style={{ pageBreakInside: "avoid" }}>
              <div>
                <div className="flex items-center justify-center whitespace-pre-line px-4">
                  <div className="-mt-5 flex flex-col text-center">
                    <img width="150" src={AppConfig.logo} />
                    <p>@{AppConfig.InstagramUsername}</p>
                    <p className={"pb-3"}>{AppConfig.BaseStoreUrl}</p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr className="border bg-white" style={{ pageBreakInside: "avoid" }}>
            <td
              className="whitespace-nowrap border px-6 pb-3 pt-4 font-medium text-gray-700"
              style={{ pageBreakInside: "avoid" }}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                {courier !== "INDIA_POST" && awb && (
                  <div>
                    <img
                      width={300}
                      src={`http://bwipjs-api.metafloor.com/?bcid=code128&text=${awb}&scaleX=10&scaleY=3`}
                      alt=""
                    />
                    <p className="my-1 text-center text-xs tracking-widest text-gray-700">
                      {awb}
                    </p>
                    <p className="text-center font-bold text-gray-700">
                      DELHIVERY
                    </p>
                  </div>
                )}
                {courier === "INDIA_POST" && (
                  <div className={"h-16 w-52"}></div>
                )}
              </div>
            </td>
            <td
              style={{ pageBreakInside: "avoid" }}
              className="border text-sm "
            >
              <div className={"my-2"}>
                {products.map((product, index) => {
                  return (
                    <div>
                      <div
                        className={
                          "my-1 flex items-center justify-between space-y-2 px-3 text-xs"
                        }
                      >
                        <p className={"font-medium text-gray-700"}>
                          {product}(1)
                        </p>
                        <p>₹ {prices[index]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className={"my-4"} />
              <div className={"my-2 flex items-center justify-between px-3"}>
                <p className={"font-bold text-gray-800"}>Prepaid | Surface</p>
                <p>₹{totalPrice}</p>
              </div>
            </td>
            <td
              style={{ pageBreakInside: "avoid" }}
              className="flex items-center justify-center px-3 text-sm"
            >
              <div
                className={
                  "my-3 flex flex-col items-center justify-center space-y-2.5"
                }
              >
                <p className="text-center font-bold text-gray-700">Order ID</p>
                <p className={"text-center text-xs"}>{order.id}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const getPostIdAndImageIndex = (
  url: string,
): {
  postId: string;
  imageIndex: string;
} => {
  const regex = /\/p\/([A-Za-z0-9-_]+)\/\?img_index=(\d+)/;
  const match = url.match(regex);
  console.log({ match, url });
  if (match) {
    const postID = match[1];
    const imageIndex = match[2];

    console.log({ postID, imageIndex });
    return {
      postId: postID ?? "P",
      imageIndex: imageIndex ?? "(0)",
    };
  } else {
    return {
      postId: "",
      imageIndex: "",
    };
  }
};
