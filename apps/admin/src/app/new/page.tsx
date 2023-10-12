import { Suspense } from "react";

import { Loader } from "@acme/ui";

import { prisma } from "~/lib/prismaClient";
import { GridComponent } from "./components/gridComponent";
import { Metadata } from "next";

export enum State {
  Loading,
  Selection,
  Form,
  Success,
}

export const metadata: Metadata = {
  title: "New Order",
};

export default async function New({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const limit =
    typeof searchParams.limit === "string" ? Number(searchParams.limit) : 3;

  const state =
    typeof searchParams.state === "string"
      ? Number(searchParams.state)
      : State.Selection;

  const posts = await prisma.posts.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { post_created_at: "desc" },
  });

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <GridComponent posts={posts} page={page} limit={limit} state={state} />
      </Suspense>
    </div>
  );
}
