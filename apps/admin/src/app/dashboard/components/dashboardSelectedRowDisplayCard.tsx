import { Card, Text, Title } from "@tremor/react";

export default function DashboardSelectedRowDisplayCard({
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
            <p>
              {/* add up the total price of the selected orders by taking it out of the instagram_post_urls using params price=xx */}{" "}
              {"₹ " +
                Object.keys(rowSelection)
                  .filter((key) => {
                    return "1";
                  })
                  .reduce((acc, key) => {
                    //use url searchParams to get the price of all the post and add it to the accumulator
                    //loop through all the urls and add the price to the accumulator
                    const price = data[key].instagram_post_urls.reduce(
                      (acc, curr) => {
                        const url = new URL(curr);
                        const priceValue = url.searchParams.get("price");
                        const parsedPrice = Number(priceValue);
                        return acc + (isNaN(parsedPrice) ? 0 : parsedPrice); // Add parsed price to accumulator
                      },
                      0,
                    );
                    console.log({ price });
                    return acc + price;
                  }, 0)}
            </p>
          </div>
        )
      }
    </>
  );
}
