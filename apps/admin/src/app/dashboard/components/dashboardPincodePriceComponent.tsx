import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Loader } from "@acme/ui";

import { RecordDisplay } from "~/app/dashboard/components/dashboardOrderDetailSheet";

const pincodePriceResponseSchema = z.object({
  status: z.string(),
  status_code: z.number(),
  data: z.array(
    z.object({
      logistic_name: z.string(),
      logistic_service_type: z.string(),
      logistic_id: z.string(),
      rto_charges: z.number(),
      prepaid: z.string(),
      cod: z.string(),
      pickup: z.string(),
      rev_pickup: z.string(),
      weight_slab: z.string(),
      rate: z.number(),
    }),
  ),
  zone: z.string(),
  expected_delivery_date: z.string(),
});

export const DashboardShippingRateDisplayComponent = ({ pincode }: { pincode: string }) => {
  const {
    data: shippingPrices,
    isLoading: shippingPricesLoading,
    error: shippingPricesError,
  } = useQuery<z.infer<typeof pincodePriceResponseSchema>>(
    ["shippingPrices"],
    async () => {
      console.log("before fetch");
      const response = await fetch(`/api/ship?pincode=${pincode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("after fetch");
      console.log({ response });
      if (!response.ok) {
        throw new Error("Something went wrong while fetching prices");
      }
      const data = await response.json();
      console.log({ data });
      return await data;
    },
  );

  return (
    <div className="flex items-center justify-center px-4">
      {shippingPricesLoading && <Loader />}
      {!shippingPricesLoading && !shippingPricesError && shippingPrices && (
        <div className={"flex w-full flex-col space-y-3"}>
          {shippingPrices.data &&
            shippingPrices.data.map((price, index) => (
              <div key={index} className={"w-full"}>
                <RecordDisplay
                  className={"w-full justify-between"}
                  label={price.logistic_name}
                  value={price.rate.toString()}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
