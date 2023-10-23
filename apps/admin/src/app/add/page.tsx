"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DetailForm } from "~/features/ui/components/detailForm";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export default function Add() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const router = useRouter();
  if (!orderId) {
    //navigate back to /
    router.push("/");
    return;
  }
  console.log(orderId);
  return (
    <div className="mx-6 flex min-h-screen flex-col items-center justify-center">
      <div className={"w-full animate-in fade-in duration-200"}>
        <DetailForm orderId={orderId} />
      </div>
    </div>
  );
}
