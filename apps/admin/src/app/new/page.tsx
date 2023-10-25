import { Suspense } from "react";
import { Metadata } from "next";

import { Loader } from "@gramflow/ui";

import { prisma } from "~/lib/prismaClient";
import { GridComponent } from "./components/gridComponent";

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
  const state =
    typeof searchParams.state === "string"
      ? Number(searchParams.state)
      : State.Selection;

  const posts = await prisma.posts.findMany({
    orderBy: { post_created_at: "desc" },
  });

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <GridComponent state={state} />
      </Suspense>
    </div>
  );
}
