"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { COURIER, Status } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import { Loader2, ShareIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CompleteBundles, type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Button,
  Card,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@gramflow/ui";
import { SheetClose } from "@gramflow/ui/src/sheet";
import { AppConfig } from "@gramflow/utils";
import { OrderShippingUpdateSchema } from "@gramflow/utils/src/schema";

export const RecordDisplay = ({
  label,
  value,
  className,
  ...restProps
}: {
  label: string;
  value?: string | null;
  className?: string;
  onClick?: () => void;
}) => (
  <Card
    className={`flex cursor-pointer items-center border p-3 text-sm ${className}`}
    {...restProps}
  >
    <Label className={"border-r pr-2"}>{label}</Label>
    <p className="ml-2 text-xs text-muted-foreground">{value}</p>
  </Card>
);

export const pillColors: { [key: string]: Color } = {
  [Status.PENDING]: "amber",
  [Status.ACCEPTED]: "indigo",
};
export const sizePillColors: { [key: string]: Color } = {
  extra_small: "amber",
  small: "indigo",
  medium: "purple",
  large: "orange",
  extra_large: "blue",
};

export function AcceptForm({
  params,
}: {
  params: {
    bundle_id: string;
  };
}) {
  const acceptFormSchema = z.object({
    price: z.string(),
  });

  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(acceptFormSchema),
  });

  const { mutate: acceptMutate, isLoading: acceptLoading } = useMutation(
    async ({ price, id }: { price: string; id: string }) => {
      const res = await fetch(`/api/bundle?id=${id}&price=${price}`, {
        method: "POST",
      });
      const data = await res.json();
      return data;
    },
    {
      onSuccess: async () => {
        toast.success("Bundle Accepted");
        await queryClient.invalidateQueries({
          queryKey: ["allOrders"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["allBundles"],
        });
      },
      onError: () => {
        toast.error("Bundle Acceptance Failed");
      },
    },
  );

  //onSubmit function

  async function onSubmit(values: z.infer<typeof acceptFormSchema>) {
    if (params.bundle_id) {
      acceptMutate({ price: values.price, id: params.bundle_id });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormDescription>Enter the price of the bundle.</FormDescription>
              <FormControl>
                <Input placeholder="Price" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {acceptLoading && <Loader />}
          Accept
        </Button>
      </form>
    </Form>
  );
}

export function DashboardBundleDetailSheet({
  bundle,
}: {
  bundle: CompleteBundles;
}) {
  const router = useRouter();
  return (
    <SheetContent
      side={"top"}
      className={"max-h-screen overflow-y-scroll pb-20"}
    >
      <SheetHeader className="sticky top-0 bg-background pb-4 pt-6 dark:bg-background">
        <div className="flex justify-end">
          <SheetClose>
            <Button variant={"ghost"}>
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <SheetTitle>Manage Bundle</SheetTitle>
        <SheetDescription>
          <div className="flex items-center justify-between gap-4">
            <span className={"break-all text-xs text-muted-foreground"}>
              {bundle.id}
            </span>
          </div>
        </SheetDescription>
      </SheetHeader>
      <div className="flex items-center space-x-4">
        <StatusBadge
          size="xs"
          color={pillColors[bundle.status] as Color}
          className={"mt-2 text-xs font-medium"}
        >
          {bundle.status}
        </StatusBadge>
        <StatusBadge
          size="xs"
          color={sizePillColors[bundle.bundle_size] as Color}
          className={"mt-2 text-xs font-medium"}
        >
          {bundle.bundle_size.toUpperCase()}
        </StatusBadge>
      </div>

      <div className={"flex space-x-3"}>
        {bundle.images.map((image) => (
          <Image
            key={image}
            src={image ?? ""}
            alt={"product_image"}
            width={100}
            height={100}
            className="mt-5 rounded-md shadow"
          />
        ))}
      </div>

      <div className="grid gap-4 py-4">
        <div className="p-1"></div>
        {bundle.Orders && (
          <div className="mt-4">
            <RecordDisplay
              onClick={() => {
                router.push(`/dashboard?order_id=${bundle.Orders?.id}`);
              }}
              label="Order ID"
              value={bundle.Orders.id}
            />
          </div>
        )}
        <RecordDisplay label="Bundle ID" value={bundle.id} />
        {/* <RecordDisplay
          label="Size"
          value={`${order.length} cm x ${order.breadth} cm x ${order.height} cm @ ${order.weight} gm`}
        /> */}
        <RecordDisplay
          label="Date"
          value={format(
            new Date(bundle.created_at ?? new Date()),
            "dd/MM/yy, hh:mm a",
          )}
        />
        <>
          {bundle.user && (
            <div className="grid gap-4 py-4">
              <RecordDisplay label="Name" value={bundle.user?.name} />
              <RecordDisplay
                label={"Phone"}
                value={`+91 ${bundle.user?.phone_no}`}
              />
              <RecordDisplay label="Email" value={bundle.user?.email} />
              <RecordDisplay
                label={"Buyer's Username"}
                value={`${bundle.user?.instagram_username}`}
              />
            </div>
          )}
        </>
        <hr className={"my-4"} />

        {bundle.status === "PENDING" && (
          <AcceptForm params={{ bundle_id: bundle.id }} />
        )}
        {/* <UpdateForm order={order} /> */}
      </div>

      {/* <div>
        {order.user?.pincode &&
          (order.status === "PENDING" || order.status === "ACCEPTED") && (
            <div>
              <hr className={"my-4"} />
              <SheetTitle className={"mb-5"}>Shipping Costs</SheetTitle>
              {order.user?.pincode && (
                <DashboardShippingRateDisplayComponent
                  pincode={order.user?.pincode}
                />
              )}
            </div>
          )}
      </div> */}
      <SheetFooter className={"text-left"}></SheetFooter>
    </SheetContent>
  );
}
