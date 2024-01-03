import { AreaChart, Text, Title } from "@tremor/react";

import { prisma } from "~/lib/prismaClient";

export default async function RevenueChart() {
  //   const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  const numberOfDays = 20;

  const fetchData = async () => {
    const orders = await prisma.orders.findMany({
      where: {
        created_at: {
          lte: new Date(),
          gte: new Date(
            new Date().getTime() - numberOfDays * 24 * 60 * 60 * 1000,
          ),
        },
      },
    });

    const startDate = new Date(
      new Date().getTime() - numberOfDays * 24 * 60 * 60 * 1000,
    );
    const endDate = new Date();
    const dateArray = [];
    const orderCountByDay = {};

    // Create date array
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }`;
      dateArray.push(formattedDate);
      orderCountByDay[formattedDate] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate order count by day
    orders.forEach((order) => {
      const orderDate = order.created_at.toISOString().split("T")[0];
      const formattedDate = `${order.created_at.getDate()}/${
        order.created_at.getMonth() + 1
      }`;
      //get the total price of the order
      let totalPrice = order.price;
      orderCountByDay[formattedDate] += totalPrice;
    });

    const data = dateArray.map((day) => ({
      day,
      Revenue: orderCountByDay[day],
    }));
    return data;
  };

  const weekBack = new Date(
    new Date().getTime() - numberOfDays * 24 * 60 * 60 * 1000,
  );
  const today = new Date();
  const weekBackFormatted = `${weekBack.getDate()}/${weekBack.getMonth() + 1}`;
  const todayFormatted = `${today.getDate()}/${today.getMonth() + 1}`;
  const dateRange = `${weekBackFormatted} - ${todayFormatted}`;

  const data = await fetchData();
  const dataFormatter = (value: number) => {
    return "₹ " + Intl.NumberFormat("en-IN").format(number).toString();
  };

  return (
    <div>
      <Title>Revenue</Title>
      <Text>{dateRange}</Text>
      <AreaChart
        className="mt-6"
        data={data}
        index="day"
        categories={["Revenue"]}
        colors={["purple"]}
        // valueFormatter={dataFormatter}
        yAxisWidth={40}
      />
    </div>
  );
}
