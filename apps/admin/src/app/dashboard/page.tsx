import { type Metadata } from "next";
import { Redis } from "@upstash/redis";
import { format } from "date-fns";

import { env } from "~/env.mjs";
import { prisma } from "~/lib/prismaClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

const checkIfPickupToday = async () => {
  const date = new Date();
  console.log(format(date, "yyyy-MM-dd"));
  const pickupToday = await prisma.pickups.findFirst({
    where: {
      pickup_date: format(date, "yyyy-MM-dd"),
    },
  });
  console.log(pickupToday);
  return pickupToday;
};

const pickupToday = await checkIfPickupToday();

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // get search params from the page:
  console.log({ searchParams });
  const redis = new Redis({
    url: env.UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
  });
  const areBundlesAvailable = (await redis.get<boolean>("bundles")) ?? false;
  return (
    <>

    </>
  );
}
